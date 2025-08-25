import { auth, db } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Cadastro
const cadastroForm = document.getElementById("cadastro-form");
if (cadastroForm) {
  cadastroForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("password").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        nome: nome,
        email: email,
        criadoEm: new Date()
      });

      alert("Usuário cadastrado com sucesso!");
      window.location.href = "login.html";
    } catch (error) {
      alert("Erro ao cadastrar: " + error.message);
    }
  });
}

// ...
// Login
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const senha = document.getElementById("password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user; // <--- Adicione esta linha
      localStorage.setItem('gestorId', user.uid); 
      alert("Login realizado com sucesso!");
      window.location.href = "index.html";
    } catch (error) {
      alert("Erro ao logar: " + error.message);
    }
  });
}
