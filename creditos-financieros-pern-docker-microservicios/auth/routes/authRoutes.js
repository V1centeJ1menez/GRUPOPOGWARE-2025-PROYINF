const express = require("express");
const router = express.Router();
const { register, login, listUsers } = require("../controllers/authController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);

// Rutas protegidas
router.get("/profile", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

router.get("/admin/data", verifyToken, verifyAdmin, (req, res) => {
  res.json({ message: "Solo visible para administradores" });
});

// Administración de usuarios
router.get("/users", verifyToken, verifyAdmin, listUsers);

module.exports = router;
