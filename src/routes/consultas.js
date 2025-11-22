const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  extrairConsultaDeImagem,
  extrairConsultaDeTexto,
} = require("../services/iaService");

// POST /api/consultas/foto - usa IA na imagem
router.post("/foto", async (req, res) => {
  try {
    const { imageUrl, pacienteId } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl obrigatório" });
    }

    const extraido = await extrairConsultaDeImagem(imageUrl);

    const consulta = await prisma.consulta.create({
      data: {
        pacienteId: pacienteId || null,
        tipoConsulta: extraido.tipo_consulta || "clinico_geral",
        origemSolicitacao: "painel_foto",
        status: "solicitada",
        dataSolicitacao: new Date(),
        dataAgendada:
          extraido.data
            ? new Date(`${extraido.data}T${extraido.hora || "00:00"}:00`)
            : null,
      },
    });

    res.json({ consulta, extraido });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao processar imagem" });
  }
});

// POST /api/consultas/voz - usa IA no texto
router.post("/voz", async (req, res) => {
  try {
    const { texto, pacienteId } = req.body;
    if (!texto) return res.status(400).json({ error: "texto obrigatório" });

    const extraido = await extrairConsultaDeTexto(texto);

    const consulta = await prisma.consulta.create({
      data: {
        pacienteId: pacienteId || null,
        tipoConsulta: extraido.tipo_consulta || "clinico_geral",
        origemSolicitacao: "painel_voz",
        status: "solicitada",
        dataSolicitacao: new Date(),
        dataAgendada:
          extraido.data
            ? new Date(`${extraido.data}T${extraido.hora || "00:00"}:00`)
            : null,
      },
    });

    res.json({ consulta, extraido });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao processar texto" });
  }
});

// POST /api/consultas - marcar consulta manualmente
router.post("/", async (req, res) => {
  try {
    const {
      pacienteId,
      tipoConsulta,
      origemSolicitacao = "painel_manual",
      status = "agendada",
      prioridade,
      dataAgendada,
      dataAtendimento,
    } = req.body;

    if (!pacienteId || !tipoConsulta) {
      return res
        .status(400)
        .json({ error: "pacienteId e tipoConsulta são obrigatórios" });
    }

    const consulta = await prisma.consulta.create({
      data: {
        pacienteId,
        tipoConsulta,
        origemSolicitacao,
        status,
        prioridade: prioridade || null,
        dataSolicitacao: new Date(),
        dataAgendada: dataAgendada ? new Date(dataAgendada) : null,
        dataAtendimento: dataAtendimento ? new Date(dataAtendimento) : null,
      },
    });

    res.status(201).json({ consulta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar consulta" });
  }
});

// GET /api/consultas - listar
router.get("/", async (req, res) => {
  try {
    const { pacienteId } = req.query;
    const where = pacienteId ? { pacienteId: Number(pacienteId) } : {};
    const consultas = await prisma.consulta.findMany({
      where,
      orderBy: { dataSolicitacao: "desc" },
    });
    res.json({ consultas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar consultas" });
  }
});

// GET /api/consultas/:id - detalhes
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const consulta = await prisma.consulta.findUnique({ where: { id } });
    if (!consulta)
      return res.status(404).json({ error: "Consulta não encontrada" });
    res.json({ consulta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar consulta" });
  }
});

// PATCH /api/consultas/:id - atualizar status/datas
router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, prioridade, dataAgendada, dataAtendimento } = req.body;

    const consulta = await prisma.consulta.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(prioridade && { prioridade }),
        ...(dataAgendada && { dataAgendada: new Date(dataAgendada) }),
        ...(dataAtendimento && { dataAtendimento: new Date(dataAtendimento) }),
      },
    });

    res.json({ consulta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar consulta" });
  }
});

module.exports = router;
