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
      user_id BIGINT UNSIGNED NULL,
      name VARCHAR(120) NOT NULL,
      category VARCHAR(60) NOT NULL,
      watts DECIMAL(10,2) NOT NULL,
      hours DECIMAL(10,2) NOT NULL,
      days INT NOT NULL DEFAULT 7,
      time VARCHAR(200) DEFAULT NULL,
      kwhPerDay DECIMAL(12,3) NOT NULL,
      co2PerDay DECIMAL(12,3) NOT NULL,
      costPerMonth DECIMAL(12,1) NOT NULL,
      created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [columns] = await pool.query('SHOW COLUMNS FROM devices');
  const existing = new Set(columns.map((col) => String(col.Field).toLowerCase()));

  if (!existing.has('user_id')) {
    await pool.query('ALTER TABLE devices ADD COLUMN user_id BIGINT UNSIGNED NULL FIRST');
  }

  if (existing.has('users_id')) {
    await pool.query('UPDATE devices SET user_id = COALESCE(user_id, users_id)');
  }

  if (!existing.has('name')) {
    await pool.query("ALTER TABLE devices ADD COLUMN name VARCHAR(120) NOT NULL DEFAULT ''");
  }
  if (!existing.has('category')) {
    await pool.query("ALTER TABLE devices ADD COLUMN category VARCHAR(60) NOT NULL DEFAULT ''");
  }
  if (!existing.has('watts')) {
    await pool.query('ALTER TABLE devices ADD COLUMN watts DECIMAL(10,2) NOT NULL DEFAULT 0');
  }
  if (!existing.has('hours')) {
    await pool.query('ALTER TABLE devices ADD COLUMN hours DECIMAL(10,2) NOT NULL DEFAULT 0');
  }
  if (!existing.has('days')) {
    await pool.query('ALTER TABLE devices ADD COLUMN days INT NOT NULL DEFAULT 7');
  }
  if (!existing.has('time')) {
    await pool.query('ALTER TABLE devices ADD COLUMN time VARCHAR(200) DEFAULT NULL');
  }
  if (!existing.has('kwhperday')) {
    await pool.query('ALTER TABLE devices ADD COLUMN kwhPerDay DECIMAL(12,3) NOT NULL DEFAULT 0');
  }
  if (!existing.has('co2perday')) {
    await pool.query('ALTER TABLE devices ADD COLUMN co2PerDay DECIMAL(12,3) NOT NULL DEFAULT 0');
  }
  if (!existing.has('costpermonth')) {
    await pool.query('ALTER TABLE devices ADD COLUMN costPerMonth DECIMAL(12,1) NOT NULL DEFAULT 0');
  }
  if (!existing.has('created_at')) {
    await pool.query('ALTER TABLE devices ADD COLUMN created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)');
  }

  await pool.query('ALTER TABLE devices MODIFY COLUMN created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)');

  const [fkConstraints] = await pool.query(`
    SELECT CONSTRAINT_NAME
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'devices'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
  `);

  for (const row of fkConstraints) {
    await pool.query(`ALTER TABLE devices DROP FOREIGN KEY ${row.CONSTRAINT_NAME}`);
  }

  const [indexRows] = await pool.query('SHOW INDEX FROM devices');
  const hasPrimary = indexRows.some((row) => row.Key_name === 'PRIMARY');
  if (hasPrimary) {
    await pool.query('ALTER TABLE devices DROP PRIMARY KEY');
  }

  if (existing.has('device_uid')) {
    await pool.query('ALTER TABLE devices DROP COLUMN device_uid');
  }
  if (existing.has('users_id')) {
    await pool.query('ALTER TABLE devices DROP COLUMN users_id');
  }
  if (existing.has('id')) {
    await pool.query('ALTER TABLE devices DROP COLUMN id');
  }
  if (existing.has('is_deleted')) {
    await pool.query('ALTER TABLE devices DROP COLUMN is_deleted');
  }

  await pool.query(`
    ALTER TABLE devices
    ADD CONSTRAINT fk_devices_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
  `).catch(() => {
    // Ignore if constraint already exists.
  });
}

module.exports = {
  pool,
  initializeDatabase,
};
