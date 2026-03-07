const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  decimalNumbers: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(191) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS devices (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      users_id BIGINT UNSIGNED NULL,
      name VARCHAR(120) NOT NULL,
      category VARCHAR(60) NOT NULL,
      watts DECIMAL(10,2) NOT NULL,
      hours DECIMAL(10,2) NOT NULL,
      days INT NOT NULL DEFAULT 7,
      time VARCHAR(200) DEFAULT NULL,
      kwhPerDay DECIMAL(12,3) NOT NULL,
      co2PerDay DECIMAL(12,3) NOT NULL,
      costPerMonth DECIMAL(12,1) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [columns] = await pool.query('SHOW COLUMNS FROM devices');
  const existing = new Set(columns.map((col) => String(col.Field).toLowerCase()));

  const columnDefinitions = [
    ['users_id', 'BIGINT UNSIGNED NULL'],
    ['name', 'VARCHAR(120) NOT NULL'],
    ['category', 'VARCHAR(60) NOT NULL'],
    ['watts', 'DECIMAL(10,2) NOT NULL'],
    ['hours', 'DECIMAL(10,2) NOT NULL'],
    ['days', 'INT NOT NULL DEFAULT 7'],
    ['time', 'VARCHAR(200) DEFAULT NULL'],
    ['kwhPerDay', 'DECIMAL(12,3) NOT NULL DEFAULT 0'],
    ['co2PerDay', 'DECIMAL(12,3) NOT NULL DEFAULT 0'],
    ['costPerMonth', 'DECIMAL(12,1) NOT NULL DEFAULT 0'],
  ];

  if (!existing.has('id')) {
    try {
      await pool.query(
        'ALTER TABLE devices ADD COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST'
      );
    } catch {
      await pool.query(
        'ALTER TABLE devices ADD COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE FIRST'
      );
    }
  }

  for (const [name, definition] of columnDefinitions) {
    if (!existing.has(name.toLowerCase())) {
      await pool.query(`ALTER TABLE devices ADD COLUMN ${name} ${definition}`);
    }
  }

  const [fkRows] = await pool.query('SHOW CREATE TABLE devices');
  const createSql = fkRows[0] && fkRows[0]['Create Table'] ? String(fkRows[0]['Create Table']) : '';
  if (!createSql.includes('fk_devices_users_id')) {
    await pool.query(`
      ALTER TABLE devices
      ADD CONSTRAINT fk_devices_users_id
      FOREIGN KEY (users_id) REFERENCES users(id)
      ON DELETE CASCADE
    `);
  }
}

module.exports = {
  pool,
  initializeDatabase,
};
