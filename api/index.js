// 1. Importa as bibliotecas necessárias para o projeto
const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

// CÓDIGO CORRIGIDO
// O caminho '../' faz o servidor voltar uma pasta (de 'portoooo' para
// 'porto-atualizado')
// para encontrar o arquivo 'firebase-key.json'.
const serviceAccountPath = path.join(__dirname, "firebase-key.json");
const serviceAccountFile = fs.readFileSync(serviceAccountPath, "utf8");
const serviceAccount = JSON.parse(serviceAccountFile);

// 3. Inicializa o Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 4. Cria uma referência ao banco de dados Firestore
const db = admin.firestore();

// 5. Inicializa o servidor Express
const app = express();
app.use(cors());

// 6. Habilita o uso de JSON nas requisições
app.use(express.json());

// 7. Definição das rotas (Endpoints)

// Rota de teste
app.get('/', (req, res) => {
  res.send('Olá! O servidor está funcionando.');
});

// Rota para adicionar um novo equipamento (Versão corrigida e única)
app.post("/api/equipamentos", async (req, res) => {
  try {
    const novoEquipamento = req.body;
    if (!novoEquipamento.nome || !novoEquipamento.localizacao) {
      return res
          .status(400)
          .send({error: "Nome e localização são obrigatórios."});
    }

    // Define o status padrão se não for fornecido
    if (!novoEquipamento.status) {
      novoEquipamento.status = "OK";
    }

    novoEquipamento.criadoEm = admin.firestore.FieldValue.serverTimestamp();
    const docRef = await db.collection("equipamentos").add(novoEquipamento);
    res
        .status(201)
        .send({id: docRef.id, message: "Equipamento cadastrado com sucesso."});
  } catch (error) {
    console.error("Erro ao adicionar equipamento:", error);
    res.status(500).send({error: "Erro ao processar a requisição."});
  }
});
// --- ROTA PARA BUSCAR EQUIPAMENTOS ---
app.get("/api/equipamentos", async (req, res) => {
  try {
    const db = admin.firestore();
    const equipamentosRef = db.collection("equipamentos");
    const snapshot = await equipamentosRef.get();

    const equipamentos = [];
    snapshot.forEach((doc) => {
      equipamentos.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(equipamentos);
  } catch (error) {
    console.error("Erro ao buscar equipamentos:", error);
    res
        .status(500)
        .json({message: "Erro interno do servidor ao buscar dados."});
  }
});
// -------------------------------------

// Rota para obter estatísticas do dashboard
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const equipamentosRef = db.collection("equipamentos");
    const equipamentosSnapshot = await equipamentosRef.get();
    const equipamentos = equipamentosSnapshot.docs.map((doc) => doc.data());

    // CORREÇÃO: Garante que um objeto seja retornado,
    // mesmo que não haja equipamentos
    if (equipamentos.length === 0) {
      return res.status(200).send({
        totalEquipamentos: 0,
        emManutencao: 0,
        tempoMedioOperacao: 0,
      });
    }

    const totalEquipamentos = equipamentos.length;

    let emManutencao = 0;
    let totalHorasOperacao = 0;

    equipamentos.forEach((equipamento) => {
      const status = equipamento.status;
      if (
        status === "Manutenção em breve" ||
        status === "Manutenção necessária"
      ) {
        emManutencao++;
      }
      const horas = parseInt(equipamento.horasOperacao, 10);
      if (!isNaN(horas)) {
        totalHorasOperacao += horas;
      }
    });

    const tempoMedioOperacao =
      totalEquipamentos > 0 ?
        Math.round(totalHorasOperacao / totalEquipamentos) :
        0;

    res.status(200).send({
      totalEquipamentos: totalEquipamentos,
      emManutencao: emManutencao,
      tempoMedioOperacao: tempoMedioOperacao,
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas do dashboard:", error);
    res.status(500).send({error: "Erro ao obter estatísticas do dashboard."});
  }
});
// Rota para obter o nome do gestor
app.get("/api/gestor/nome", async (req, res) => {
  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.get();
    if (snapshot.empty) {
      return res.status(404).send({error: "Nenhum usuário encontrado."});
    }
    const userData = snapshot.docs[0].data();
    const nome = userData.nome || "Gestor(a)";
    res
        .status(200)
        .send({
          nome: nome,
          email: userData.email,
          funcao: userData.funcao,
          telefone: userData.telefone,
        });
  } catch (error) {
    console.error("Erro ao obter nome do gestor:", error);
    res.status(500).send({error: "Erro ao obter nome do gestor."});
  }
});

// Rota para atualizar os dados de um gestor
app.put("/api/gestor/atualizar", async (req, res) => {
  try {
    const {gestorId, nome, email, funcao, telefone} = req.body;

    if (!gestorId) {
      return res.status(400).send({error: "ID do gestor não fornecido."});
    }

    const gestorRef = db.collection("users").doc(gestorId);

    const dadosParaAtualizar = {};
    if (nome !== undefined) dadosParaAtualizar.nome = nome;
    if (email !== undefined) dadosParaAtualizar.email = email;
    if (funcao !== undefined) dadosParaAtualizar.funcao = funcao;
    if (telefone !== undefined) dadosParaAtualizar.telefone = telefone;

    if (Object.keys(dadosParaAtualizar).length === 0) {
      return res
          .status(400)
          .send({error: "Nenhum dado fornecido para atualização."});
    }

    await gestorRef.update(dadosParaAtualizar);

    res
        .status(200)
        .send({message: "Dados do gestor atualizados com sucesso!"});
  } catch (error) {
    console.error("Erro ao atualizar os dados do gestor:", error);
    res.status(500).send({error: "Erro ao atualizar os dados do gestor."});
  }
});

// Rota para obter todos os equipamentos registrados
app.get("/api/equipamentos/listar", async (req, res) => {
  try {
    const equipamentosRef = db.collection("equipamentos");
    const snapshot = await equipamentosRef.get();

    if (snapshot.empty) {
      return res.status(200).send([]);
    }

    const equipamentos = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    res.status(200).send(equipamentos);
  } catch (error) {
    console.error("Erro ao obter a lista de equipamentos:", error);
    res.status(500).send({error: "Erro ao obter a lista de equipamentos."});
  }
});

// Rota para obter a contagem de equipamentos por status
app.get("/api/equipamentos/status", async (req, res) => {
  try {
    const equipamentosRef = db.collection("equipamentos");
    const snapshot = await equipamentosRef.get();

    const statusCounts = {};

    snapshot.forEach((doc) => {
      const equipamento = doc.data();
      const status = equipamento.status || "OK";

      if (statusCounts[status]) {
        statusCounts[status]++;
      } else {
        statusCounts[status] = 1;
      }
    });

    res.status(200).send(statusCounts);
  } catch (error) {
    console.error("Erro ao obter a contagem de status:", error);
    res.status(500).send({error: "Erro ao obter a contagem de status."});
  }
});

module.exports = app;
