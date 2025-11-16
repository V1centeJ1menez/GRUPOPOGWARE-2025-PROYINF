const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { pool } = require("./db");
const solicitudRoutes = require("./routes/solicitudRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "solicitud" });
});

app.get("/", (req, res) => {
  res.send("Servicio Solicitud funcionando 🚀");
});

app.use("/api", solicitudRoutes);

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => console.log(`✅ Solicitud escuchando en puerto ${PORT}`));
