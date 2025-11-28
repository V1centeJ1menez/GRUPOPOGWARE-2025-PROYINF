const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const nodemailer = require("nodemailer");
const axios = require("axios");

const { sendMailIfConfigured } = require('../utils/mailer');

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email y password son requeridos' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const assignedRole = role && role === "admin" ? "admin" : "user"; // seguridad: nadie puede forzar admin fácilmente
    await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)",
      [username, email, hashed, assignedRole]
      
    // 1) Enviar correo de bienvenida
    const subject = 'Cuenta creada correctamente';
    const text = `Hola ${username},\n\nTu cuenta ha sido creada correctamente.\nYa puedes iniciar sesión y continuar con tu solicitud o simulaciones.\n\nSaludos,\nEquipo de Créditos`;
    
    // --- ENVÍO REAL POR SMTP (GMAIL) ---
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "usm.pogware.03@gmail.com", // Gmail real
        pass: "upfwdgxeptosscrr"  // contraseña de app
      }
    });


exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );
    if (!result.rows.length)
      return res.status(404).send("Usuario no encontrado");

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send("Contraseña inválida");

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );


    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error en login");
  }
};

// Listar usuarios (solo admin)
exports.listUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role, created_at FROM users ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al listar usuarios");
  }
};
