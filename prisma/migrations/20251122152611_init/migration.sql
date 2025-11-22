-- CreateTable
CREATE TABLE "FilaEspera" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "tipoServico" TEXT NOT NULL,
    "especialidade" TEXT,
    "dataEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataSaida" TIMESTAMP(3),
    "motivoSaida" TEXT,
    "prioridade" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "FilaEspera_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FilaEspera" ADD CONSTRAINT "FilaEspera_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
