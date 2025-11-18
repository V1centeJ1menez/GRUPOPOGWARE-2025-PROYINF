const nodemailer = require('nodemailer');

let transporter = null;

function buildTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host) return null;
  const base = { host, port, secure: port === 465 };
  if (user && pass) {
    return nodemailer.createTransport({ ...base, auth: { user, pass } });
  }
  // Sin auth (MailHog u otro relay local)
  return nodemailer.createTransport(base);
}

async function sendMailIfConfigured({ to, subject, text, html }) {
  try {
    if (!transporter) transporter = buildTransporter();
    if (!transporter) {
      console.log('[mailer] SMTP no configurado. Simulando envío:', { to, subject, text });
      return { simulated: true };
    }
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const info = await transporter.sendMail({ from, to, subject, text, html });
    return info;
  } catch (e) {
    console.warn('[mailer] Error al enviar correo:', e.message || e);
    return { error: true, message: e.message };
  }
}

module.exports = { sendMailIfConfigured };
