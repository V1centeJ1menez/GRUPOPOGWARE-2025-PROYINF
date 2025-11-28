const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

async function enviarCorreo(destinatario, asunto, mensajeHTML) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER || "preaprobacion@banco.com",
      to: destinatario,
      subject: asunto,
      html: mensajeHTML,
    });

    console.log("📩 Correo enviado:", info.messageId);
    return { success: true, message: "Correo enviado" };
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    return { success: false, error: error.message };
  }
}

module.exports = { enviarCorreo };
