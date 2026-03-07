const { pool } = require('./db');

async function getAllDevices(usersId) {
  const [rows] = await pool.query(
    `SELECT id, users_id, name, category, watts, hours, days, time, kwhPerDay, co2PerDay, costPerMonth
     FROM devices
     WHERE users_id = ?
     ORDER BY id DESC`,
    [usersId]
  );
  return rows;
}

async function createDevice(device) {
  const [result] = await pool.query(
    `INSERT INTO devices (users_id, name, category, watts, hours, days, time, kwhPerDay, co2PerDay, costPerMonth)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      device.usersId,
      device.name,
      device.category,
      device.watts,
      device.hours,
      device.days,
      device.time || null,
      device.kwhPerDay,
      device.co2PerDay,
      device.costPerMonth,
    ]
  );

  const [rows] = await pool.query(
    `SELECT id, users_id, name, category, watts, hours, days, time, kwhPerDay, co2PerDay, costPerMonth
     FROM devices WHERE id = ?`,
    [result.insertId]
  );

  return rows[0];
}

async function deleteDeviceById(id, usersId) {
  const [result] = await pool.query('DELETE FROM devices WHERE id = ? AND users_id = ?', [id, usersId]);
  return result.affectedRows > 0;
}

async function clearDevices(usersId) {
  await pool.query('DELETE FROM devices WHERE users_id = ?', [usersId]);
}

module.exports = {
  getAllDevices,
  createDevice,
  deleteDeviceById,
  clearDevices,
};
