const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();


const app = express();
app.use(express.json());
// Habilitar CORS para el frontend

app.use(cors());

// Función auxiliar para proxy
const proxyRequest = (serviceUrl) => async (req, res) => {
  try {
    const url = `${serviceUrl}${req.url}`;
    // Copiar headers y eliminar los problemáticos para proxys
    const headers = { ...req.headers };
    delete headers["host"];
    delete headers["content-length"];
    delete headers["connection"];
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers,
      validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
    });
    if (response.status === 304) {
      // Respuesta no modificada: sin cuerpo
      // Propagar cabeceras relevantes si existen
      const passHeaders = ["etag", "last-modified", "cache-control", "expires"];
      passHeaders.forEach((h) => {
        if (response.headers?.[h]) res.setHeader(h, response.headers[h]);
      });
      return res.status(304).end();
    }
    res.status(response.status).json(response.data);
  } catch (error) {
    const isNetErr = [
      'ENOTFOUND', 'ECONNREFUSED', 'EAI_AGAIN', 'ETIMEDOUT', 'ECONNRESET'
    ].includes(error?.code);
    const target = serviceUrl || 'desconocido';
    console.error("[Gateway] Error proxying", req.method, req.originalUrl, {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      target,
    });
    if (isNetErr) {
      return res.status(503).json({ error: `Servicio no disponible: ${target}` });
    }
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: "Error en gateway" };
    res.status(status).json(data);
  }
};

// Rutas de servicios
app.use("/auth", proxyRequest(process.env.AUTH_URL));
app.use("/campana", proxyRequest(process.env.CAMPANA_URL));
app.use("/simulacion", proxyRequest(process.env.SIMULACION_URL));
app.use("/solicitud", proxyRequest(process.env.SOLICITUD_URL));
app.use("/evaluacion", proxyRequest(process.env.EVALUACION_URL));
app.use("/firma", proxyRequest(process.env.FIRMA_URL));
app.use("/desembolso", proxyRequest(process.env.DESEMBOLSO_URL));
app.use("/pago", proxyRequest(process.env.PAGO_URL));
app.use("/cobranza", proxyRequest(process.env.COBRANZA_URL));
app.use("/activacion", proxyRequest(process.env.ACTIVACION_URL));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.json({
    message: "🧭 API Gateway - Sistema de Créditos Financieros",
    services: [
      { name: "auth", url: "/auth" },
      { name: "campana", url: "/campana" },
      { name: "simulacion", url: "/simulacion" },
      { name: "solicitud", url: "/solicitud" },
      { name: "evaluacion", url: "/evaluacion" },
      { name: "firma", url: "/firma" },
      { name: "desembolso", url: "/desembolso" },
      { name: "pago", url: "/pago" },
      { name: "cobranza", url: "/cobranza" },
      { name: "activacion", url: "/activacion" }
    ]
  });
});

app.listen(process.env.PORT, () =>
  console.log(`🧭 Gateway escuchando en puerto ${process.env.PORT}`)
);
