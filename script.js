// --- BASE DE DONNÉES ENRICHIE (KNOWLEDGE) ---
const KNOWLEDGE = {
    maths: {
        keywords: ["math", "calcul", "equation", "geometrie", "algebre", "arithmetique", "nombre"],
        levels: {
            primaire: "### 🧮 Maths - Niveau Primaire\nEn primaire, on apprend les bases :\n- **Addition & Soustraction** : 12 + 8 = 20.\n- **Multiplication** : Les tables (1 à 10).\n- **Division** : Partager en parts égales.\n- **Géométrie** : Carré, Triangle, Cercle.",
            secondaire: "### 📐 Maths - Niveau Secondaire (Collège/Lycée)\nLe programme devient plus complexe :\n- **Algèbre** : Résolution d'équations (2x + 5 = 15).\n- **Géométrie** : Théorème de Pythagore (a² + b² = c²) et Thalès.\n- **Trigonométrie** : Sinus, Cosinus, Tangente.\n- **Statistiques** : Moyenne, Médiane, Probabilités.",
            universitaire: "### 🏛️ Maths - Niveau Universitaire\nAnalyse avancée pour les ingénieurs et chercheurs :\n- **Analyse** : Dérivées, Intégrales, Équations différentielles.\n- **Algèbre Linéaire** : Matrices, Espaces vectoriels.\n- **Maths Discrètes** : Logique booléenne, Graphes (essentiel pour le Génie Logiciel).\n- **Analyse Numérique** : Algorithmes d'approximation."
        },
        default: "Les mathématiques sont la science des nombres et des formes. Je peux t'aider pour les niveaux **primaire**, **secondaire** ou **universitaire**. Précise ton niveau !"
    },
    compta: {
        keywords: ["compta", "bilan", "gestion", "debit", "credit", "journal", "finance", "fiscalite", "ohada"],
        levels: {
            primaire: "Au niveau débutant, la comptabilité c'est apprendre à gérer son argent : ce qui rentre (Recettes) et ce qui sort (Dépenses).",
            secondaire: "### 💹 Compta - Niveau Secondaire\nMaîtrise du cycle comptable :\n- **Journal** : Enregistrement quotidien des pièces.\n- **Grand Livre** : Suivi des comptes individuels.\n- **Bilan** : Photo du patrimoine (Actif = Passif).\n- **Compte de Résultat** : Charges et Produits.",
            universitaire: "### 📈 Compta - Niveau Universitaire (Gestion/Expertise)\n- **Normes** : SYSCOHADA (Afrique) ou IFRS (International).\n- **Analyse Financière** : Ratios de rentabilité, Cash-flow, FRNG.\n- **Comptabilité Analytique** : Calcul des coûts et marges.\n- **Audit & Fiscalité** : Impôts sur les sociétés et contrôle interne."
        },
        default: "La comptabilité gère les flux financiers d'une entité. Veux-tu une explication pour le niveau **secondaire** ou **universitaire** ?"
    },
    genie_logiciel: {
        keywords: ["code", "logiciel", "programmation", "python", "javascript", "algorithme", "sql", "architecture", "agile"],
        levels: {
            primaire: "Programmer, c'est donner des ordres à l'ordinateur. C'est comme une recette de cuisine : étape 1, étape 2...",
            secondaire: "### 💻 Génie Logiciel - Bases\n- **Algorithmique** : Logique des boucles (Si, Alors, Tant que).\n- **Langages** : Python ou JavaScript.\n- **HTML/CSS** : Créer des pages web.",
            universitaire: "### 🚀 Génie Logiciel - Expert (Université)\n- **POO** : Programmation Orientée Objet (Classes, Héritage).\n- **Base de données** : Modélisation SQL, NoSQL.\n- **Architecture** : Micro-services, Design Patterns.\n- **Méthodes** : Agile (Scrum), DevOps, Cycle en V."
        },
        default: "Le génie logiciel est l'art de concevoir des systèmes informatiques fiables. Précise si tu es débutant ou étudiant à l'université !"
    },
    sciences: {
        keywords: ["physique", "chimie", "biologie", "science", "atome", "cellule", "energie"],
        levels: {
            primaire: "La science explique le monde : pourquoi le ciel est bleu, comment poussent les fleurs et pourquoi les objets tombent.",
            secondaire: "### 🔬 Sciences - Secondaire\n- **Physique** : Électricité, Optique, Mécanique de Newton.\n- **Chimie** : Tableau périodique, Molécules, Réactions.\n- **SVT** : La cellule, la génétique, l'écologie.",
            universitaire: "### ⚛️ Sciences - Universitaire\n- **Physique** : Thermodynamique, Physique quantique.\n- **Biochimie** : Réactions métaboliques complexes.\n- **Ingénierie** : Résistance des matériaux, Dynamique des fluides."
        },
        default: "Je connais la physique, la chimie et la biologie. Quel niveau t'intéresse ?"
    }
};

// --- LOGIQUE DE CONVERSATION ---
const SMALL_TALK = [
    { keys: ["bonjour", "salut", "hello", "yo"], res: ["Bonjour Chef ! Ravi de te voir.", "Salut l'ami ! On commence quoi ?", "Bonjour ! Prêt pour une nouvelle discussion ?"] },
    { keys: ["ca va", "comment vas-tu", "cv"], res: ["Je vais super bien, et toi Chef ?", "En pleine forme numérique ! Et toi ?", "Tout va bien pour moi, je suis prêt à t'aider."] },
    { keys: ["merci", "super", "bien joue"], res: ["Avec plaisir !", "C'est normal Chef !", "Ravi que cela t'aide."] },
    { keys: ["chef", "boss", "ami"], res: ["Oui Chef ! Je t'écoute.", "Présent, mon ami !", "À tes ordres !"] }
];

// --- CORE LOGIC ---
let chats = JSON.parse(localStorage.getItem('chatgemi_v2')) || {};
let currentChatId = Date.now();
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');

// Nettoyer le texte (accents, minuscules)
function clean(t) { return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); }

// Détecter le niveau scolaire
function detectLevel(text) {
    const t = clean(text);
    if (t.includes("primaire") || t.includes("1ere") || t.includes("6eme")) return "primaire";
    if (t.includes("universite") || t.includes("superieur") || t.includes("licence") || t.includes("master")) return "universitaire";
    if (t.includes("secondaire") || t.includes("7eme") || t.includes("lycee") || t.includes("college")) return "secondaire";
    return null;
}

async function getAIResponse(text) {
    const input = clean(text);
    const isDetail = input.includes("explique") || input.includes("pourquoi") || input.includes("comment") || input.includes("detail");
    const level = detectLevel(text);

    // 1. Social (Small Talk)
    for (let t of SMALL_TALK) {
        if (t.keys.some(k => input.includes(k)) && !isDetail) {
            return t.res[Math.floor(Math.random() * t.res.length)];
        }
    }

    // 2. Expertise Locale (Maths, Compta, etc.)
    for (let category in KNOWLEDGE) {
        const data = KNOWLEDGE[category];
        if (data.keywords.some(key => input.includes(key))) {
            if (level && data.levels[level]) return data.levels[level];
            if (isDetail) return data.levels.universitaire || data.levels.secondaire;
            return data.default;
        }
    }

    // 3. Poésie / Citations
    if (input.includes("poeme") || input.includes("poesie")) return "### ✍️ Poème\nDans le silence des serveurs,\nChatGemi cherche le bonheur.\nEntre les chiffres et les mots,\nIl guérit tous tes maux.";

    // 4. Recherche Web (Fallback Wikipedia)
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
                const extract = pages[Object.keys(pages)[0]].extract;
                return extract.substring(0, 1500) + "... \n\n*(Source: Wikipédia)*";
            }
            return finalData.extract + " \n\n*(Source: Wikipédia)*";
        }
    } catch (e) { return "Désolé Chef, une erreur de connexion m'empêche d'accéder à Wikipédia."; }
    return "Je ne suis pas sûr de comprendre Chef. Pose-moi une question sur les **maths**, la **compta**, le **code**, ou demande-moi un **poème** !";
}

// --- INTERFACE GESTION ---
async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    if (!chats[currentChatId]) chats[currentChatId] = { title: text.substring(0, 25), messages: [] };

    appendMsg(text, 'user');
    userInput.value = "";
    userInput.style.height = '45px'; // Reset height

    // Animation "Réflexion..."
    const loadingId = "loading-" + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.className = "message ai";
    loadingDiv.id = loadingId;
    loadingDiv.innerHTML = "🔍 *En train de réfléchir...*";
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    const response = await getAIResponse(text);
    
    document.getElementById(loadingId).remove();
    appendMsg(response, 'ai');
    save();
}

function appendMsg(text, role) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerHTML = marked.parse(text);
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    chats[currentChatId].messages.push({ role, text });
}

function save() { localStorage.setItem('chatgemi_v2', JSON.stringify(chats)); renderHistory(); }

function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = "";
    Object.keys(chats).reverse().forEach(id => {
        const d = document.createElement('div');
        d.className = "history-item";
        d.innerHTML = `<i class="far fa-comment"></i> ${chats[id].title}`;
        d.onclick = () => {
            currentChatId = id; chatBox.innerHTML = "";
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

// UI HANDLERS
window.onload = () => setTimeout(() => document.getElementById('splash-screen').classList.add('hidden'), 3000);

document.getElementById('menu-toggle').onclick = (e) => { e.stopPropagation(); document.getElementById('sidebar').classList.toggle('open'); };

document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target)) sidebar.classList.remove('open');
});

userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

document.getElementById('send-btn').onclick = handleSend;
userInput.onkeypress = (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

// NOUVEAU CHAT
document.getElementById('new-chat-btn').onclick = () => {
    currentChatId = Date.now();
    chatBox.innerHTML = "<div class='message ai'>Nouveau chat commencé Chef ! Je t'écoute.</div>";
    sidebar.classList.remove('open');
};

// VOCAL
function setupVoice() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) return;
    const rec = new Speech();
    rec.lang = 'fr-FR';
    document.getElementById('voice-btn').onclick = () => { rec.start(); document.getElementById('voice-btn').style.color = "red"; };
    rec.onresult = (e) => { userInput.value = e.results[0][0].transcript; handleSend(); document.getElementById('voice-btn').style.color = "#acacbe"; };
}

renderHistory();
setupVoice();
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js'); }