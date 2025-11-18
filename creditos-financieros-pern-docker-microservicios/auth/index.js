const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, pool } = require("./models/User");
const { sendMailIfConfigured } = require('./utils/mailer');
require("dotenv").config();

const app = express();
app.use(express.json());

async function connectWithRetry(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query("SELECT NOW()");
      console.log(`✅ Conectado a ${process.env.DB_NAME}`);
      return;
    } catch (err) {
      console.log(`❌ Intento ${i + 1}/${retries} - Error conectando a BD. Reintentando en ${delay / 1000}s...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("No se pudo conectar a la base de datos después de varios intentos.");
}

connectWithRetry();

// Registro (usuarios de negocio)
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email y password son requeridos" });
    }
    
    // Validar si ya existe
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: "El nombre de usuario ya existe" });
    }
    
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create(username, email, hashed);

    // Enviar correo de bienvenida (si SMTP configurado, de lo contrario se simula)
    const subject = 'Cuenta creada correctamente';
    const text = `Hola ${username},\n\nTu cuenta ha sido creada correctamente.\nYa puedes iniciar sesión y continuar con tu solicitud o simulaciones.\n\nSaludos,\nEquipo de Créditos`;
    await sendMailIfConfigured({ to: email, subject, text });

    res.json({ message: "Usuario creado", userId: newUser.id });
  } catch (err) {
    console.error("/register error:", err);
    res.status(500).json({ error: "No se pudo crear el usuario" });
  }
});

// Login (por username)
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username y password son requeridos" });
    }
    
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Contraseña inválida" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    console.error("/login error:", err);
    res.status(500).json({ error: "No se pudo iniciar sesión" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

// === Helpers de autenticación/autorization ===
function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Token requerido" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

function verifyAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "No autorizado" });
  next();
}

// === Endpoint admin: listar usuarios ===
app.get("/users", verifyToken, verifyAdmin, async (_req, res) => {
  try {
    const result = await pool.query("SELECT id, username, email, role, created_at FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("/users error:", err);
    res.status(500).json({ error: "No se pudo listar usuarios" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth en puerto ${PORT}`));
