// --- CONFIGURATION ---
const API_KEY = "AIzaSyC8erXmQ_XaSuiq_sNWAsK50mPYVXrUemk"; // ⚠️ Vérifie qu'elle ne commence pas par "Alza" mais par "AIza"
const MODEL = "gemini-1.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`;

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const historyList = document.getElementById('history-list');

let currentChatId = Date.now();
let chats = JSON.parse(localStorage.getItem('chatGemi_v2')) || {};

const SYSTEM_PROMPT = "Tu es ChatGemi, un expert multi-disciplinaire. Tu maîtrises les mathématiques (du primaire à l'université), la comptabilité (SYSCOHADA/IFRS), le génie logiciel, et la littérature (poésie, citations). Réponds de manière précise et éducative.";

// --- FONCTIONS DE CHAT ---

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Créer la discussion si elle n'existe pas
    if (!chats[currentChatId]) {
        chats[currentChatId] = { title: text.substring(0, 25), messages: [] };
    }

    appendMessage(text, 'user');
    userInput.value = "";

    // Préparation des messages pour l'API Gemini
    // On inclut le système prompt dans le premier message pour donner le rôle d'expert
    let messagesToAPI = [];
    if (chats[currentChatId].messages.length <= 1) {
        messagesToAPI.push({ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nQuestion : " + text }] });
    } else {
        messagesToAPI = chats[currentChatId].messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.text }]
        }));
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: messagesToAPI })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        appendMessage(aiResponse, 'ai');
        saveToLocal();
        renderHistory();
    } catch (error) {
        console.error("Erreur détaillée:", error);
        appendMessage("Désolé, j'ai une erreur : " + error.message, 'ai');
    }
}

function appendMessage(text, role) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    // Support du Markdown pour les formules maths et code
    div.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    chats[currentChatId].messages.push({ role, text });
}

// --- HISTORIQUE & NOUVELLE DISCUSSION ---

function saveToLocal() {
    localStorage.setItem('chatGemi_v2', JSON.stringify(chats));
}

function renderHistory() {
    historyList.innerHTML = "";
    Object.keys(chats).reverse().forEach(id => {
        const div = document.createElement('div');
        div.className = "history-item";
        div.innerHTML = `<i class="far fa-message"></i> ${chats[id].title}`;
        div.onclick = () => loadChat(id);
        historyList.appendChild(div);
    });
}

function loadChat(id) {
    currentChatId = id;
    chatBox.innerHTML = "";
    chats[id].messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = `message ${msg.role}`;
        div.innerHTML = typeof marked !== 'undefined' ? marked.parse(msg.text) : msg.text;
        chatBox.appendChild(div);
    });
    if (window.innerWidth < 768) document.getElementById('sidebar').classList.remove('open');
}

function startNewChat() {
    currentChatId = Date.now();
    chatBox.innerHTML = `<div class="message ai">Nouvelle discussion prête. Je vous écoute (Maths, Compta, Poésie...)</div>`;
    if (window.innerWidth < 768) document.getElementById('sidebar').classList.remove('open');
}

// --- VOCAL ---

function setupVoice() {
    const voiceBtn = document.getElementById('voice-btn');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        voiceBtn.style.display = "none";
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';

    voiceBtn.onclick = () => {
        recognition.start();
        voiceBtn.style.color = "red";
    };

    recognition.onresult = (event) => {
        userInput.value = event.results[0][0].transcript;
        voiceBtn.style.color = "#acacbe";
        sendMessage();
    };
}

// --- INIT ---
document.getElementById('send-btn').onclick = sendMessage;
document.getElementById('new-chat-btn').onclick = startNewChat;
document.getElementById('menu-toggle').onclick = () => document.getElementById('sidebar').classList.toggle('open');
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

renderHistory();
setupVoice();