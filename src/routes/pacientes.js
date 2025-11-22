// src/routes/pacientes.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// POST /api/pacientes  -> cadastrar paciente
router.post("/", async (req, res) => {
  try {
    const {
      nome,
      dataNascimento,      // "YYYY-MM-DD"
      telefoneWhatsapp,
      bairro,
      cidade,
      estado,
      grupo_prioritario,   // se existir no seu schema
      sexo,                // idem
      cpf,                 // idem
      cns,                 // idem
      cep                  // idem
    } = req.body;

    if (!nome || !dataNascimento || !telefoneWhatsapp) {
      return res
        .status(400)
        .json({ error: "nome, dataNascimento e telefoneWhatsapp são obrigatórios" });
    }

    const paciente = await prisma.paciente.create({
      data: {
        nome,
        dataNascimento: new Date(dataNascimento),
        telefoneWhatsapp,
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
        // use só os campos que EXISTEM no seu schema:
        grupo_prioritario: grupo_prioritario || undefined,
        sexo: sexo || undefined,
        cpf: cpf || undefined,
        cns: cns || undefined,
        cep: cep || undefined,
      },
    });

    return res.status(201).json({ paciente });
  } catch (err) {
    console.error(err);
    // conflito de telefone único
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Já existe paciente com esse telefoneWhatsapp" });
    }
    res.status(500).json({ error: "Erro ao cadastrar paciente" });
  }
});

// GET /api/pacientes/:id/status  -> status resumido do paciente
router.get("/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const paciente = await prisma.paciente.findUnique({
      where: { id },
      include: {
        consultas: true,
        receitas: true,
        filaEntradas: true, // FilaEspera[]
      },
    });

    if (!paciente) {
      return res.status(404).json({ error: "Paciente não encontrado" });
    }

    // consultas futuras / pendentes
    const consultasPendentes = paciente.consultas.filter((c) =>
      ["solicitada", "agendada"].includes(c.status)
    );

    const ultimaConsulta = paciente.consultas
      .filter((c) => c.dataAtendimento)
      .sort(
        (a, b) =>
          new Date(b.dataAtendimento).getTime() -
          new Date(a.dataAtendimento).getTime()
      )[0] || null;

    const filaAtiva = paciente.filaEntradas.filter(
      (f) => f.status === "em_espera"
    );

    const receitasPendentes = paciente.receitas.filter(
      (r) => r.status === "pendente"
    );

    const statusResumo = {
      temConsultaPendente: consultasPendentes.length > 0,
      qtdConsultasPendentes: consultasPendentes.length,
      temFilaAtiva: filaAtiva.length > 0,
      qtdFilaAtiva: filaAtiva.length,
      temReceitaPendente: receitasPendentes.length > 0,
      qtdReceitasPendentes: receitasPendentes.length,
    };

    return res.json({
      paciente: {
        id: paciente.id,
        nome: paciente.nome,
        telefoneWhatsapp: paciente.telefoneWhatsapp,
        bairro: paciente.bairro,
        cidade: paciente.cidade,
        estado: paciente.estado,
        // ajuste se tiver mais campos
      },
      status: statusResumo,
      consultasPendentes,
      ultimaConsulta,
      filaAtiva,
      receitasPendentes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao consultar status do paciente" });
  }
});

module.exports = router;
