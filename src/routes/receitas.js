const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { extrairReceitaDeImagem } = require("../services/iaService");

// POST /api/receitas/foto - IA lê receita
router.post("/foto", async (req, res) => {
  try {
    const { imageUrl, pacienteId, consultaId } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "imageUrl obrigatório" });

    const parsed = await extrairReceitaDeImagem(imageUrl);

    const receita = await prisma.receitaMedica.create({
      data: {
        pacienteId: pacienteId || null,
        consultaId: consultaId || null,
        urlImagem: imageUrl,
        textoExtraido: JSON.stringify(parsed),
        status: "pendente",
      },
    });

    res.json({
      receitaId: receita.id,
      medicamentos: parsed.medicamentos || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao ler receita" });
  }
});

// POST /api/receitas - cadastro manual
router.post("/", async (req, res) => {
  try {
    const {
      pacienteId,
      consultaId,
      urlImagem,
      textoExtraido,
      status = "pendente",
    } = req.body;

    if (!pacienteId) {
      return res.status(400).json({ error: "pacienteId é obrigatório" });
    }

    const receita = await prisma.receitaMedica.create({
      data: {
        pacienteId,
        consultaId: consultaId || null,
        urlImagem: urlImagem || "",
        textoExtraido: textoExtraido || null,
        status,
      },
    });

    res.status(201).json({ receita });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar receita" });
  }
});

// GET /api/receitas - listar
router.get("/", async (req, res) => {
  try {
    const { pacienteId } = req.query;
    const where = pacienteId ? { pacienteId: Number(pacienteId) } : {};
    const receitas = await prisma.receitaMedica.findMany({
      where,
      orderBy: { dataEnvio: "desc" },
    });
    res.json({ receitas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar receitas" });
  }
});

// PATCH /api/receitas/:id - atualizar status/texto
router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, textoExtraido } = req.body;

    const receita = await prisma.receitaMedica.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(textoExtraido && { textoExtraido }),
      },
    });

    res.json({ receita });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar receita" });
  }
});

module.exports = router;
