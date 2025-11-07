const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

app.get("/", (req, res) => {
  res.send("Servicio Firma funcionando 🚀");
});

app.listen(process.env.PORT, () => console.log(`Firma escuchando en puerto ${process.env.PORT}`));
