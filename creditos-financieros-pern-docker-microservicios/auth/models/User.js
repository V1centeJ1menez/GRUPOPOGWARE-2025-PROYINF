const { Pool } = require("pg");
require("dotenv").config();

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
const pool = new Pool({ connectionString });

/**
 * User model
 * Campos: id, username, email, password, role, created_at
 */
class User {
  /**
   * Crea un nuevo usuario
   * @param {string} username 
   * @param {string} email 
   * @param {string} hashedPassword 
   * @param {string} role - 'user' o 'admin'
   * @returns {Promise<object>}
   */
  static async create(username, email, hashedPassword, role = "user") {
    const query = `
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, role, created_at
    `;
    const result = await pool.query(query, [username, email, hashedPassword, role]);
    return result.rows[0];
  }

  /**
   * Encuentra un usuario por username
   * @param {string} username 
   * @returns {Promise<object|null>}
   */
  static async findByUsername(username) {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    return result.rows[0] || null;
  }

  /**
   * Encuentra un usuario por email
   * @param {string} email 
   * @returns {Promise<object|null>}
   */
  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] || null;
  }

  /**
   * Encuentra un usuario por ID
   * @param {number} id 
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  }
}

module.exports = { User, pool };
