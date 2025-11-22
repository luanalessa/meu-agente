-- CreateTable
CREATE TABLE "Paciente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "telefoneWhatsapp" TEXT NOT NULL,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consulta" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "tipoConsulta" TEXT NOT NULL,
    "origemSolicitacao" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "prioridade" TEXT,
    "dataSolicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAgendada" TIMESTAMP(3),
    "dataAtendimento" TIMESTAMP(3),

    CONSTRAINT "Consulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceitaMedica" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "consultaId" INTEGER,
    "dataEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "urlImagem" TEXT NOT NULL,
    "textoExtraido" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "ReceitaMedica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogInteracaoWhatsApp" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER,
    "telefone" TEXT NOT NULL,
    "tipoMensagem" TEXT NOT NULL,
    "intent" TEXT,
    "sucesso" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogInteracaoWhatsApp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_telefoneWhatsapp_key" ON "Paciente"("telefoneWhatsapp");

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceitaMedica" ADD CONSTRAINT "ReceitaMedica_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogInteracaoWhatsApp" ADD CONSTRAINT "LogInteracaoWhatsApp_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
