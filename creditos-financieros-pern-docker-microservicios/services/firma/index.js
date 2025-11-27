const express = require("express");
require("dotenv").config();

const app = express();

app.use((req, res, next) => {
  console.log(`Firma service request: ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Import and mount routes
const firmaRoutes = require('./routes/firmaRoutes');
app.use('/', firmaRoutes);

app.get("/", (req, res) => {
  res.send("Servicio Firma funcionando 🚀");
});

app.listen(process.env.PORT, () => console.log(`Firma escuchando en puerto ${process.env.PORT}`));