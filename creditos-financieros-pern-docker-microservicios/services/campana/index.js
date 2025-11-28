const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

// Ruta base de prueba
app.get("/", (req, res) => {
  res.send("Servicio Campaña funcionando 🚀");
});

//  IMPORTAR RUTAS (SIN PASAR pool)
const campanaRoutes = require("./routes/campanaRoutes");
app.use("/campana", campanaRoutes());

// Health check (útil para Docker)
app.get("/health", (req, res) =>
  res.status(200).json({ status: "OK", service: "campana" })
);

// Iniciar servidor
app.listen(process.env.PORT, () =>
  console.log(`Campaña escuchando en puerto ${process.env.PORT}`)
);
