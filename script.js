// --- CONFIGURATION & BASE DE DONNÉES ---
const KNOWLEDGE = [
    {
        keys: ["math", "calcul", "addition", "multiplication", "equation", "pythagore", "thales"],
        short: "Je suis expert en Mathématiques ! Je peux t'aider pour le primaire, le secondaire et l'université.",
        detailed: "### Expert Mathématiques\n- **Primaire**: Arithmétique de base (+, -, *, /).\n- **Secondaire**: Algèbre, Géométrie (Théorèmes de Pythagore et Thalès), Équations du 2nd degré.\n- **Université**: Calcul différentiel, Intégrales, Algèbre linéaire et Statistiques."
    },
    {
        keys: ["compta", "bilan", "gestion", "debit", "credit", "journal"],
        short: "La comptabilité est ma spécialité. Parlons de bilan ou de gestion financière !",
        detailed: "### Expert Comptabilité\n- **Secondaire**: Le Journal, le Grand Livre et l'équilibre de la Balance.\n- **Université**: Normes IFRS/SYSCOHADA, Analyse des flux de trésorerie (Cash-flow), et Consolidation des comptes."
    },
    {
        keys: ["code", "genie logiciel", "python", "javascript", "programmation"],
        short: "Je maîtrise le Génie Logiciel et le développement d'applications.",
        detailed: "### Expert Génie Logiciel\n- **Algorithmie**: Structures de données et logique.\n- **Développement**: Création d'appli Web (HTML/CSS/JS) et Backend (Python, Node.js).\n- **Architecture**: Micro-services, Design Patterns et méthodes Agiles."
    }
];

const SMALL_TALK = [
    { keys: ["bonjour", "salut", "hello", "coucou", "yo"], res: ["Bonjour Chef ! Comment puis-je t'aider ?", "Salut l'ami ! Content de te voir.", "Bonjour ! Prêt pour une nouvelle discussion ?"] },
    { keys: ["ca va", "tu vas bien", "cv"], res: ["Je vais super bien, et toi ?", "Toujours prêt à répondre, je me sens en forme ! Et toi ?"] },
    { keys: ["chef", "bro", "ami", "pote"], res: ["C'est moi ! On est ensemble l'ami.", "Présent ! Qu'est-ce qu'on fait aujourd'hui ?"] }
];

// --- LOGIQUE DE CHAT ---
let chats = JSON.parse(localStorage.getItem('chatgemi_v2')) || {};
let currentChatId = Date.now();

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');

function clean(t) { return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); }

async function getAIResponse(text) {
    const input = clean(text);
    const isDetail = input.includes("explique") || input.includes("pourquoi") || input.includes("comment") || input.includes("detail");

    // 1. Social / Amitié
    for (let t of SMALL_TALK) {
        if (t.keys.some(k => input.includes(k)) && !isDetail) {
            return t.res[Math.floor(Math.random() * t.res.length)];
        }
    }

    // 2. Expertise Locale
    for (let k of KNOWLEDGE) {
        if (k.keys.some(key => input.includes(key))) {
            return isDetail ? k.detailed : k.short;
        }
    }

    // 3. Recherche Web (Wikipedia)
    return await fetchWiki(text, isDetail);
}

async function fetchWiki(query, detailed) {
    try {
        const resSearch = await fetch(`https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`);
        const dataSearch = await resSearch.json();
        if (dataSearch.query.search.length > 0) {
            const title = dataSearch.query.search[0].title;
            const url = detailed 
                ? `https://fr.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=0&explaintext=1&titles=${encodeURIComponent(title)}&format=json&origin=*`
                : `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
            
            const resData = await fetch(url);
            const finalData = await resData.json();
            
            if (detailed) {
                const pages = finalData.query.pages;
                return pages[Object.keys(pages)[0]].extract.substring(0, 1200) + "... *(Source: Wikipédia)*";
            }
            return finalData.extract + " *(Source: Wikipédia)*";
        }
    } catch (e) { return "Je n'ai pas trouvé d'info précise, mais pose-moi une autre question Chef !"; }
    return "Je ne suis pas sûr de comprendre, mais je peux t'aider en Maths, Compta ou Code !";
}

// --- INTERFACE & GESTION ---

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    if (!chats[currentChatId]) chats[currentChatId] = { title: text.substring(0, 25), messages: [] };

    appendMsg(text, 'user');
    userInput.value = "";

    const loading = document.createElement('div');
    loading.className = "message ai";
    loading.innerHTML = "🔍 Réflexion...";
    chatBox.appendChild(loading);

    const response = await getAIResponse(text);
    chatBox.removeChild(loading);
    appendMsg(response, 'ai');
    save();
}

function appendMsg(text, role) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    chats[currentChatId].messages.push({ role, text });
}

function save() {
    localStorage.setItem('chatgemi_v2', JSON.stringify(chats));
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = "";
    Object.keys(chats).reverse().forEach(id => {
        const d = document.createElement('div');
        d.className = "history-item";
        d.innerHTML = `<i class="far fa-comment"></i> ${chats[id].title}`;
        d.onclick = () => {
            currentChatId = id;
            chatBox.innerHTML = "";
            chats[id].messages.forEach(m => {
                const div = document.createElement('div');
                div.className = `message ${m.role}`;
                div.innerHTML = marked.parse(m.text);
                chatBox.appendChild(div);
            });
            document.getElementById('sidebar').classList.remove('open');
        };
        list.appendChild(d);
    });
}

// --- ÉVÉNEMENTS ---

// Splash Screen
window.addEventListener('load', () => {
    setTimeout(() => { document.getElementById('splash-screen').classList.add('hidden'); }, 3000);
});

// Menu Hamburger & Clic Extérieur
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');

menuToggle.onclick = (e) => { e.stopPropagation(); sidebar.classList.toggle('open'); };

document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('open');
    }
});

// Nouveau Chat
document.getElementById('new-chat-btn').onclick = () => {
    currentChatId = Date.now();
    chatBox.innerHTML = "<div class='message ai'>Bonjour Chef ! Que faisons-nous aujourd'hui ?</div>";
    sidebar.classList.remove('open');
};

document.getElementById('send-btn').onclick = handleSend;
userInput.onkeypress = (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

renderHistory();