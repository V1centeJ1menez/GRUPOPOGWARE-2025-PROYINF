const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, pool } = require("./models/User");
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth en puerto ${PORT}`));
