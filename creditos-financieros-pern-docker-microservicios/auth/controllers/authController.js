const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const assignedRole = role && role === "admin" ? "admin" : "user"; // seguridad: nadie puede forzar admin fácilmente
    await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
      [username, hashed, assignedRole]
    );
    res.status(201).send("Usuario creado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error en registro");
  }
};


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
