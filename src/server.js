// src/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/pacientes/identificar", async (req, res) => {
  try {
    const { telefoneWhatsapp, nome, dataNascimento, bairro, cidade, estado } = req.body;

    if (!telefoneWhatsapp) {
      return res.status(400).json({ error: "telefoneWhatsapp é obrigatório" });
    }

    let paciente = await prisma.paciente.findUnique({
      where: { telefoneWhatsapp },
    });

    if (!paciente) {
      if (!nome || !dataNascimento) {
        return res.status(400).json({
          error: "Paciente não encontrado. Envie nome e dataNascimento para cadastro.",
        });
      }

      paciente = await prisma.paciente.create({
        data: {
          nome,
          dataNascimento: new Date(dataNascimento),
          telefoneWhatsapp,
          bairro,
          cidade,
          estado,
        },
      });
    }

    res.json(paciente);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao identificar/cadastrar paciente" });
  }
});

app.post("/consultas", async (req, res) => {
  try {
    const { pacienteId, tipoConsulta, origemSolicitacao, prioridade } = req.body;

    if (!pacienteId || !tipoConsulta) {
      return res.status(400).json({ error: "pacienteId e tipoConsulta são obrigatórios" });
    }

    const consulta = await prisma.consulta.create({
      data: {
        pacienteId,
        tipoConsulta,
        origemSolicitacao: origemSolicitacao || "whatsapp",
        status: "solicitada",
        prioridade: prioridade || "normal",
      },
    });

    res.status(201).json(consulta);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao criar consulta" });
  }
});


app.get("/consultas", async (req, res) => {
  try {
    const { pacienteId } = req.query;

    if (!pacienteId) {
      return res.status(400).json({ error: "pacienteId é obrigatório" });
    }

    const consultas = await prisma.consulta.findMany({
      where: { pacienteId: Number(pacienteId) },
      orderBy: { dataSolicitacao: "desc" },
    });

    res.json(consultas);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao listar consultas" });
  }
});

// 4) salvar receita
app.post("/receitas", async (req, res) => {
  try {
    const { pacienteId, consultaId, urlImagem, textoExtraido } = req.body;

    if (!pacienteId || !urlImagem) {
      return res.status(400).json({ error: "pacienteId e urlImagem são obrigatórios" });
    }

    const receita = await prisma.receitaMedica.create({
      data: {
        pacienteId,
        consultaId: consultaId || null,
        urlImagem,
        textoExtraido: textoExtraido || null,
        status: "pendente",
      },
    });

    res.status(201).json(receita);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao salvar receita" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
