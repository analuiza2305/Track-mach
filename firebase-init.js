// Importando SDKs do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Sua configuração (copie do console do Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyAE7umi47Zya8CQn7-xBoZMpFDnDKYwUi4",
    authDomain: "hack-mach.firebaseapp.com",
    projectId: "hack-mach",
    storageBucket: "hack-mach.firebasestorage.app",
    messagingSenderId: "152158733858",
    appId: "1:152158733858:web:5f298c9f5c59baaac62c7b"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta serviços
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
