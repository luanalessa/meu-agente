const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// POST /api/fila/entrada
router.post("/entrada", async (req, res) => {
  try {
    const { pacienteId, tipoServico, especialidade, prioridade } = req.body;

    if (!pacienteId || !tipoServico) {
      return res
        .status(400)
        .json({ error: "pacienteId e tipoServico são obrigatórios" });
    }

    const fila = await prisma.filaEspera.create({
      data: {
        pacienteId,
        tipoServico,
        especialidade: especialidade || null,
        prioridade: prioridade || "normal",
        status: "em_espera",
      },
    });

    res.status(201).json({ fila });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao incluir na fila" });
  }
});

// PATCH /api/fila/:id/saida
router.patch("/:id/saida", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { motivoSaida } = req.body; // "atendido" | "desistiu" | "encaminhado"

    if (!motivoSaida) {
      return res.status(400).json({ error: "motivoSaida é obrigatório" });
    }

    const fila = await prisma.filaEspera.update({
      where: { id },
      data: {
        motivoSaida,
        status: motivoSaida,
        dataSaida: new Date(),
      },
    });

    res.json({ fila });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar saída da fila" });
  }
});

// GET /api/fila/:id - ver status de uma entrada
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const fila = await prisma.filaEspera.findUnique({
      where: { id },
      include: { paciente: true },
    });
    if (!fila)
      return res.status(404).json({ error: "Entrada de fila não encontrada" });
    res.json({ fila });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao consultar fila" });
  }
});

module.exports = router;
