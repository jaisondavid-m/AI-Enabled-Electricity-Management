const { pool } = require('./db');

async function findUserByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

async function createUser({ name, email, passwordHash }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );

  const [rows] = await pool.query(
    'SELECT id, name, email FROM users WHERE id = ? LIMIT 1',
    [result.insertId]
  );

  return rows[0] || null;
}

module.exports = {
  findUserByEmail,
  createUser,
};
