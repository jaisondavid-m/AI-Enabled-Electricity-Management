const { pool } = require('./db');

const DEVICE_TOKEN_EXPR = `LOWER(SHA2(CONCAT_WS('|', user_id, name, category, watts, hours, days, IFNULL(time, ''), kwhPerDay, co2PerDay, costPerMonth, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s.%f')), 256))`;

async function getAllDevices(usersId) {
  const [rows] = await pool.query(
    `SELECT ${DEVICE_TOKEN_EXPR} AS id, user_id, name, category, watts, hours, days, time, kwhPerDay, co2PerDay, costPerMonth, created_at
     FROM devices
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [usersId]
  );
  return rows;
}

async function createDevice(device) {
  await pool.query(
    `INSERT INTO devices (user_id, name, category, watts, hours, days, time, kwhPerDay, co2PerDay, costPerMonth)
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
    `SELECT ${DEVICE_TOKEN_EXPR} AS id, user_id, name, category, watts, hours, days, time, kwhPerDay, co2PerDay, costPerMonth, created_at
     FROM devices
     WHERE user_id = ?
       AND name = ?
       AND category = ?
       AND watts = ?
       AND hours = ?
       AND days = ?
       AND ((time IS NULL AND ? IS NULL) OR time = ?)
       AND kwhPerDay = ?
       AND co2PerDay = ?
       AND costPerMonth = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [
      device.usersId,
      device.name,
      device.category,
      device.watts,
      device.hours,
      device.days,
      device.time || null,
      device.time || null,
      device.kwhPerDay,
      device.co2PerDay,
      device.costPerMonth,
    ]
  );

  return rows[0];
}

async function deleteDeviceById(id, usersId) {
  const [result] = await pool.query(
    `DELETE FROM devices
     WHERE user_id = ?
       AND ${DEVICE_TOKEN_EXPR} = ?
     LIMIT 1`,
    [usersId, id]
  );
  return result.affectedRows > 0;
}

async function clearDevices(usersId) {
  await pool.query('DELETE FROM devices WHERE user_id = ?', [usersId]);
}

module.exports = {
  getAllDevices,
  createDevice,
  deleteDeviceById,
  clearDevices,
};
