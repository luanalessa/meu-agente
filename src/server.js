// src/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
require("dotenv").config();

const consultasRoutes = require("./routes/consultas");
const receitasRoutes = require("./routes/receitas");
const filaResumoRoutes = require("./routes/filaResumo");
const filaCrudRoutes = require("./routes/filaCrud");
const pacientesRoutes = require("./routes/pacientes"); // <- AQUI

const app = express();
app.use(cors());
app.use(express.json());

const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/pacientes", pacientesRoutes);   // <- AQUI
app.use("/api/consultas", consultasRoutes);
app.use("/api/receitas", receitasRoutes);
app.use("/api/fila", filaCrudRoutes);
app.use("/api/fila", filaResumoRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
  console.log(`Swagger: http://localhost:${port}/docs`);
});
