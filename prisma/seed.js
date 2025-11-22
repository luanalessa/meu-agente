const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // ------------------------
  // UNIDADES DE SAÚDE
  // ------------------------
  const u1 = await prisma.unidadeSaude.create({
    data: {
      nome: "UBS Santana",
      tipo: "UBS",
      bairro: "Santana",
      cidade: "Fortaleza",
      estado: "CE",
      cep: "60000000"
    }
  });

  const u2 = await prisma.unidadeSaude.create({
    data: {
      nome: "Policlínica Messejana",
      tipo: "Policlinica",
      bairro: "Messejana",
      cidade: "Fortaleza",
      estado: "CE",
      cep: "60800000"
    }
  });

  // ------------------------
  // AGENTES
  // ------------------------
  const agente1 = await prisma.agenteSaude.create({
    data: {
      nome: "Maria José da Silva",
      tipo: "ACS",
      id_unidade: u1.id_unidade,
      area_cobertura: "Rua A, B e C — Santana",
      ativo: true,
      data_inicio: new Date("2023-01-10")
    }
  });

  const agente2 = await prisma.agenteSaude.create({
    data: {
      nome: "Carlos Henrique",
      tipo: "Enfermeiro",
      id_unidade: u2.id_unidade,
      area_cobertura: "Área 20 — Messejana",
      ativo: true,
      data_inicio: new Date("2024-04-02")
    }
  });

  // ------------------------
  // PACIENTES
  // ------------------------
  const p1 = await prisma.paciente.create({
    data: {
      nome: "Dona Irene Oliveira",
      dataNascimento: new Date("1954-10-02"),
      telefoneWhatsapp: "5588991400000",
      bairro: "Santana",
      cidade: "Fortaleza",
      estado: "CE",
      grupo_prioritario: "60+"
    }
  });

  const p2 = await prisma.paciente.create({
    data: {
      nome: "João Santos",
      dataNascimento: new Date("1988-12-10"),
      telefoneWhatsapp: "5588991500000",
      bairro: "Messejana",
      cidade: "Fortaleza",
      estado: "CE",
      grupo_prioritario: "nenhum"
    }
  });

  const p3 = await prisma.paciente.create({
    data: {
      nome: "Ana Costa",
      dataNascimento: new Date("1948-05-15"),
      telefoneWhatsapp: "5588991600000",
      bairro: "Centro",
      cidade: "Fortaleza",
      estado: "CE",
      grupo_prioritario: "60+"
    }
  });

  // ------------------------
  // CONSULTAS
  // ------------------------
  await prisma.consulta.createMany({
    data: [
      {
        pacienteId: p1.id,
        id_unidade: u1.id_unidade,
        id_profissional: agente1.id_agente,
        tipoConsulta: "Cardiologia",
        origemSolicitacao: "whatsapp",
        status: "agendada",
        prioridade: "normal",
        dataSolicitacao: new Date(),
        dataAgendada: new Date("2025-01-14T10:00:00")
      },
      {
        pacienteId: p2.id,
        id_unidade: u2.id_unidade,
        id_profissional: agente2.id_agente,
        tipoConsulta: "Ortopedia",
        origemSolicitacao: "presencial",
        status: "solicitada",
        prioridade: "urgencia",
        dataSolicitacao: new Date()
      },
      {
        pacienteId: p3.id,
        id_unidade: u1.id_unidade,
        id_profissional: agente1.id_agente,
        tipoConsulta: "Neurologia",
        origemSolicitacao: "visita domiciliar",
        status: "atendida",
        prioridade: "normal",
        dataSolicitacao: new Date(),
        dataAgendada: new Date("2025-01-10T09:00:00"),
        dataAtendimento: new Date("2025-01-10T09:20:00")
      }
    ]
  });

  // ------------------------
  // RECEITAS
  // ------------------------
  await prisma.receitaMedica.createMany({
    data: [
      {
        pacienteId: p1.id,
        dataEnvio: new Date(),
        caminho_imagem: "/uploads/receitas/r1.png",
        texto_extraido: "Losartana 50mg – tomar 1 comprimido às 8h.",
        status: "validada"
      },
      {
        pacienteId: p3.id,
        dataEnvio: new Date(),
        caminho_imagem: "/uploads/receitas/r2.png",
        texto_extraido: null,
        status: "pendente"
      }
    ]
  });

  // ------------------------
  // FILA
  // ------------------------
  await prisma.filaEspera.createMany({
    data: [
      {
        pacienteId: p1.id,
        id_unidade: u1.id_unidade,
        tipo_servico: "Consulta",
        especialidade: "Cardiologia",
        data_entrada_fila: new Date("2025-01-01"),
        posicao_atual: 17,
        prioridade: "normal"
      },
      {
        pacienteId: p2.id,
        id_unidade: u2.id_unidade,
        tipo_servico: "Consulta",
        especialidade: "Ortopedia",
        data_entrada_fila: new Date("2025-01-05"),
        posicao_atual: 32,
        prioridade: "urgencia"
      },
      {
        pacienteId: p3.id,
        id_unidade: u1.id_unidade,
        tipo_servico: "Consulta",
        especialidade: "Neurologia",
        data_entrada_fila: new Date("2025-01-02"),
        posicao_atual: 52,
        prioridade: "normal"
      }
    ]
  });

  console.log("🌿 Seed finalizado com sucesso!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
