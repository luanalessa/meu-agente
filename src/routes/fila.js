const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET /api/fila/resumo
router.get("/resumo", async (req, res) => {
  try {
    const consultas = await prisma.consulta.findMany({
      where: { status: "solicitada" },
      select: { tipoConsulta: true },
    });

    const porEspecialidade = {};

    consultas.forEach((c) => {
      const esp = c.tipoConsulta || "Outros";
      porEspecialidade[esp] = (porEspecialidade[esp] || 0) + 1;
    });

    const resumo = Object.entries(porEspecialidade).map(([esp, total]) => {
      // heurística simples só pra demo
      const semanasMin = Math.max(1, Math.round(total / 20));
      const semanasMax = semanasMin + 2;
      const status = total > 80 ? "atrasada" : "avancando";

      return {
        especialidade: esp,
        posicaoMedia: Math.round(total / 2),
        tempoEstimadoSemanas: `${semanasMin}-${semanasMax}`,
        totalNaFila: total,
        status,
      };
    });

    res.json({ resumo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao calcular fila" });
  }
});

// GET /api/fila/pacientes?agenteId=1 (se quiser usar)
router.get("/pacientes", async (req, res) => {
  try {
    const { agenteId } = req.query;

    const consultas = await prisma.consulta.findMany({
      where: {
        status: "solicitada",
        ...(agenteId ? { idProfissional: Number(agenteId) } : {}),
      },
      include: { paciente: true },
    });

    const lista = consultas.map((c, idx) => ({
      nomePaciente: c.paciente?.nome || "Paciente",
      especialidade: c.tipoConsulta,
      posicao: idx + 1,
      risco: idx > 40 ? "Risco" : idx > 20 ? "Atenção" : "Normal",
    }));

    res.json({ pacientes: lista });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar pacientes em fila" });
  }
});

module.exports = router;
