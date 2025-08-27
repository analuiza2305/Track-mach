// --- FUNÇÕES GLOBAIS ---
// Em produção, deixe vazio; no emulador também funciona relativo
const API_BASE = "";



// Função para obter e exibir o nome do gestor no cabeçalho
async function carregarNomeGestor() {
  const nomeGestorEl = document.getElementById("nomeGestor");
  if (!nomeGestorEl) return;

  try {
    const response = await fetch(
      "https://porto-back.onrender.com/api/gestor/nome"
    );
    const dados = await response.json();
    nomeGestorEl.textContent = `Olá, ${dados.nome}!`;
  } catch (error) {
    console.error("Erro ao carregar o nome do gestor:", error);
    // Mantém o texto padrão 'Olá, Gestor(a)!' em caso de erro
  }
}

// Função para ativar o item de menu da página atual
function ativarMenu() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const activeLink = document.querySelector(
    `.nav-menu a[href*="${currentPage}"]`
  );
  if (activeLink) {
    document
      .querySelectorAll(".nav-menu li.active")
      .forEach((item) => item.classList.remove("active"));
    activeLink.parentElement.classList.add("active");
  }
}

// Função que configura o link do perfil no cabeçalho
function configurarLinkPerfil() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const linkPerfil = document.querySelector(".user-profile-link");
  if (linkPerfil) {
    linkPerfil.href = isLoggedIn ? "cadastro-gestor.html" : "login.html";
  }
}

// --- FUNÇÃO PARA O MENU HAMBÚRGUER ---
function configurarMenuHamburger() {
  const hamburgerButton = document.getElementById("hamburger-menu");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");

  // AQUI O ERRO FOI CORRIGIDO COM O HTML QUE VOCÊ ME MANDOU!
  if (!hamburgerButton || !sidebar || !overlay) return;

  const toggleMenu = () => {
    sidebar.classList.toggle("sidebar-open");
    overlay.classList.toggle("active");
  };

  hamburgerButton.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", toggleMenu);
}

// --- FUNÇÃO PARA O BOTÃO DARK MODE ---
function configurarThemeToggle() {
  const themeToggleButton = document.getElementById("theme-toggle-button");
  if (!themeToggleButton) return;

  const toggleIcon = themeToggleButton.querySelector("i");

  const aplicarTema = (tema) => {
    if (tema === "dark") {
      document.body.classList.add("dark-mode");
      toggleIcon.className = "bi bi-sun-fill";
    } else {
      document.body.classList.remove("dark-mode");
      toggleIcon.className = "bi bi-moon-fill";
    }
  };

  themeToggleButton.addEventListener("click", () => {
    const isDarkMode = document.body.classList.contains("dark-mode");
    const novoTema = isDarkMode ? "light" : "dark";
    aplicarTema(novoTema);
    localStorage.setItem("theme", novoTema);
  });

  const temaSalvo = localStorage.getItem("theme") || "light";
  aplicarTema(temaSalvo);
}

// --- FUNÇÕES ESPECÍFICAS ---

// Dashboard (index.html)
async function preencherDadosDashboard() {
  const qtdEquipamentosEl = document.getElementById("qtdEquipamentos");
  if (!qtdEquipamentosEl) return;
  try {
    const response = await fetch(
      "https://porto-back.onrender.com/api/dashboard/stats"
    );
    let dados = await response.json();

    // Garante que a resposta seja um objeto, mesmo que a base de dados esteja vazia
    if (Array.isArray(dados)) {
      dados = { totalEquipamentos: 0, emManutencao: 0, tempoMedioOperacao: 0 };
    }

    qtdEquipamentosEl.textContent = dados.totalEquipamentos;
    document.getElementById("emManutencao").textContent = dados.emManutencao;
    const tempoMedioEl = document.getElementById("tempoMedio");
    tempoMedioEl.textContent = dados.tempoMedioOperacao;
    const spanUnit = document.createElement("span");
    spanUnit.className = "unit";
    spanUnit.textContent = "Horas";
    tempoMedioEl.appendChild(spanUnit);
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
  }
}

// Função para carregar e exibir o gráfico de performance
async function carregarGraficoPerformance() {
  const ctx = document.getElementById("performanceChart");
  if (!ctx) return;

  try {
    const response = await fetch(
      "https://porto-back.onrender.com/api/equipamentos/status"
    );
    const statusData = await response.json();

    // Mapear os dados para o formato que a Chart.js entende
    const labels = Object.keys(statusData);
    const data = Object.values(statusData);

    // Definir as cores para cada barra do gráfico
    const backgroundColors = labels.map((label) => {
      if (label === "OK") return "#28a745"; // Verde
      if (label === "Manutenção em breve") return "#ffc107"; // Amarelo
      if (label === "Manutenção necessária") return "#dc3545"; // Vermelho
      return "#007bff"; // Azul padrão para outros status
    });

    // Configurar e renderizar o gráfico
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Número de Equipamentos",
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Erro ao carregar o gráfico de performance:", error);
    // Opcional: exibir uma mensagem de erro na tela
  }
}

// Função para buscar e exibir os equipamentos
async function carregarEquipamentosNaTabela() {
  const tableBody = document.getElementById("equipamentos-table-body");
  if (!tableBody) return;

  try {
    // Corrigindo para o caminho COMPLETO do seu servidor Node.js
    const response = await fetch(
      "https://porto-back.onrender.com/api/equipamentos"
    );
    const equipamentos = await response.json();

    tableBody.innerHTML = ""; // Limpa a tabela antes de popular

    if (equipamentos.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3">Nenhum equipamento cadastrado.</td></tr>`;
      return;
    }

    equipamentos.forEach((equipamento) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${equipamento.nome || "N/A"}</td>
                <td>${equipamento.idEquipamento || "N/A"}</td>
                <td>${equipamento.localizacao || "N/A"}</td>
            `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Erro ao carregar equipamentos:", error);
    tableBody.innerHTML = `<tr><td colspan="3">Erro ao carregar dados.</td></tr>`;
  }
}

// Cadastro de Equipamento (cadastro-equipamento.html)
const cadastroForm = document.getElementById("cadastroForm");
if (cadastroForm) {
  cadastroForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome = document.getElementById("nomeEquipamento").value;
    const idEquipamento = document.getElementById("id-equipamento").value;
    const fabricante = document.getElementById("fabricante").value;
    const modelo = document.getElementById("modelo").value;
    const localizacao = document.getElementById("localizacao").value;
    const status = document.getElementById("status").value;
    const descricao = document.getElementById("descricao").value;
    const horasOperacao = document.getElementById("horasOperacao").value;

    // Mapeamento dos valores do select para um texto mais descritivo
    const statusMap = {
      ok: "OK",
      breve: "Manutenção em breve",
      necessaria: "Manutenção necessária",
      inativo: "Inativo",
    };
    const statusCompleto = statusMap[status] || "OK";

    // Criar o objeto com todos os dados do formulário
    const dadosEquipamento = {
      nome,
      idEquipamento,
      fabricante,
      modelo,
      localizacao,
      status: statusCompleto,
      descricao,
      horasOperacao,
    };

    try {
      const response = await fetch(
        "https://porto-back.onrender.com/api/equipamentos",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosEquipamento),
        }
      );
      const resultado = await response.json();
      if (response.ok) {
        alert("Equipamento cadastrado com sucesso! ID: " + resultado.id);
        // Limpar o formulário após o sucesso
        cadastroForm.reset();
      } else {
        alert("Erro ao cadastrar equipamento: " + resultado.error);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao conectar com o servidor.");
    }
  });
}

// Cadastro de Gestor (cadastro-gestor.html)
async function carregarDadosGestor() {
  const formGestor = document.getElementById("gestor-form");
  if (!formGestor) return;
  try {
    const response = await fetch(
      "https://porto-back.onrender.com/api/gestor/nome"
    );
    const dados = await response.json();
    document.getElementById("nome-gestor").value = dados.nome || "";
    document.getElementById("email-gestor").value = dados.email || "";
    document.getElementById("funcao-gestor").value = dados.funcao || "";
    document.getElementById("telefone-gestor").value = dados.telefone || "";
    document.getElementById("profile-name").textContent =
      dados.nome || "Nome do Gestor";
    document.getElementById("profile-role").textContent =
      dados.funcao || "Gerente de Operações";
  } catch (error) {
    console.error("Erro ao carregar dados do gestor:", error);
  }
}

// ... dentro da função handleAtualizarGestor
async function handleAtualizarGestor(event) {
  event.preventDefault();
  const nome = document.getElementById("nome-gestor").value;
  const email = document.getElementById("email-gestor").value;
  const funcao = document.getElementById("funcao-gestor").value;
  const telefone = document.getElementById("telefone-gestor").value;

  // Obtenha o ID do gestor do localStorage
  const gestorId = localStorage.getItem("gestorId");

  // Verifique se o ID existe antes de fazer a requisição
  if (!gestorId) {
    alert("ID do gestor não encontrado. Por favor, faça login novamente.");
    return;
  }

  try {
    const response = await fetch(
      "https://porto-back.onrender.com/api/gestor/atualizar",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gestorId, nome, email, funcao, telefone }),
      }
    );
    const result = await response.json();
    if (response.ok) {
      alert(result.message);
    } else {
      alert(result.error);
    }
  } catch (error) {
    console.error("Erro ao atualizar gestor:", error);
    alert("Erro de conexão com o servidor.");
  }
}

// --- FUNÇÃO PARA O BOTÃO DE LOGOUT ---
function configurarLogout() {
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem("isLoggedIn");
      window.location.href = "login.html";
    });
  }
}

// --- INICIALIZAÇÃO GERAL ---
document.addEventListener("DOMContentLoaded", () => {
  // Funções de inicialização globais que rodam em todas as páginas
  carregarNomeGestor();
  ativarMenu();
  configurarLinkPerfil();
  configurarThemeToggle();
  configurarLogout();
  configurarMenuHamburger();

  const currentPage = window.location.pathname.split("/").pop();

  // Lógica para a página "Dashboard" (index.html)
  if (currentPage === "index.html" || currentPage === "") {
    preencherDadosDashboard();
    carregarEquipamentosNaTabela();
    carregarGraficoPerformance();
  }

  // Lógica para a página "Relatórios"
  if (currentPage === "relatorios.html") {
    carregarEquipamentosNaTabela();
  }

  // Lógica para a página "Configurações" (cadastro-gestor.html)
  if (currentPage === "cadastro-gestor.html") {
    carregarDadosGestor();
    const formGestor = document.getElementById("gestor-form");
    if (formGestor) {
      formGestor.addEventListener("submit", handleAtualizarGestor);
    }
  }
});
