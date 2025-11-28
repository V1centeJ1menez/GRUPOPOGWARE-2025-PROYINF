const { enviarCorreo } = require("../mail/emailService");
const Campana = require("../models/campanaModels");

// ============================
// ENVIAR BIENVENIDA
// (cuando se crea cuenta)
// ============================
async function enviarBienvenida(req, res) {
  try {
    const { nombre, email } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const html = `
      <h1>👋 ¡Bienvenido/a, ${nombre}!</h1>
      <p>Gracias por registrarte en nuestro sistema financiero.</p>
      <p>Pronto podrás simular tu crédito.</p>
    `;

    const resp = await enviarCorreo(email, "Bienvenida 🎉", html);

    return res.status(201).json({
      enviado: true,
      mensaje: "Correo de bienvenida enviado",
      info: resp
    });
  } catch (error) {
    return res.status(500).json({ error: "Error enviando bienvenida" });
  }
}

// ============================
// ENVIAR PRE APROBACIÓN(Primera simulacion)
// ============================
async function enviarPreAprobacion(req, res) {
  try {
    const { nombre, email, monto, rut } = req.body;

    if (!nombre || !email || !monto || !rut) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Guardar campaña en BD
    await Campana.crearCampana({ nombre, email, monto, rut });

    const html = `
      <h1>📢 ¡Oferta Pre-Aprobada!</h1>
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Tu crédito por <strong>$${monto}</strong> está PRE-APROBADO 🎉</p>
      <a href="http://localhost:5173/continuar">Continuar solicitud</a>
    `;

    const resp = await enviarCorreo(email, "Pre-Aprobación Lista 💳", html);

    return res.status(201).json({
      enviado: true,
      mensaje: "Campaña registrada y correo enviado",
      info: resp
    });
  } catch (error) {
    return res.status(500).json({ error: "Error enviando pre-aprobación" });
  }
}

module.exports = { enviarBienvenida, enviarPreAprobacion };
