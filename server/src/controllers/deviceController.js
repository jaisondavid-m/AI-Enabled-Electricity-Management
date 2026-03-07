const {
  getAllDevices,
  createDevice,
  deleteDeviceById,
  clearDevices,
} = require('../models/deviceModel');

const CO2_FACTOR = 0.82;
const COST_PER_KWH = 7;

function getUsersId(req) {
  const id = Number(req.header('x-user-id'));
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
}

function buildCalculatedDevice(raw, usersId) {
  const watts = toNumber(raw.watts);
  const hours = toNumber(raw.hours);
  const days = raw.days === undefined ? 7 : toNumber(raw.days);

  if (!raw.name || !String(raw.name).trim()) {
    return { error: 'Device name is required' };
  }
  if (!raw.category || !String(raw.category).trim()) {
    return { error: 'Category is required' };
  }
  if (!(watts > 0)) {
    return { error: 'Watts must be a number greater than 0' };
  }
  if (!(hours > 0 && hours <= 24)) {
    return { error: 'Hours must be between 0 and 24' };
  }
  if (!(days >= 1 && days <= 7)) {
    return { error: 'Days must be between 1 and 7' };
  }

  const kwhPerDay = (watts / 1000) * hours * (days / 7);

  return {
    usersId,
    name: String(raw.name).trim(),
    category: String(raw.category).trim(),
    watts,
    hours,
    days,
    time: raw.time ? String(raw.time).trim() : null,
    kwhPerDay: Number(kwhPerDay.toFixed(3)),
    co2PerDay: Number((kwhPerDay * CO2_FACTOR).toFixed(3)),
    costPerMonth: Number((kwhPerDay * 30 * COST_PER_KWH).toFixed(1)),
  };
}

async function listDevices(_req, res, next) {
  try {
    const usersId = getUsersId(_req);
    if (!usersId) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }

    const devices = await getAllDevices(usersId);
    res.status(200).json(devices);
  } catch (error) {
    next(error);
  }
}

async function addDevice(req, res, next) {
  try {
    const usersId = getUsersId(req);
    if (!usersId) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }

    const payload = buildCalculatedDevice(req.body, usersId);

    if (payload.error) {
      return res.status(400).json({ message: payload.error });
    }

    const created = await createDevice(payload);
    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
}

async function removeDevice(req, res, next) {
  try {
    const usersId = getUsersId(req);
    if (!usersId) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }

    const id = String(req.params.id || '').trim();
    if (!id) {
      return res.status(400).json({ message: 'Invalid device id' });
    }

    const deleted = await deleteDeviceById(id, usersId);
    if (!deleted) {
      return res.status(404).json({ message: 'Device not found' });
    }

    return res.status(200).json({ message: 'Device deleted' });
  } catch (error) {
    return next(error);
  }
}

async function deleteAllDevices(_req, res, next) {
  try {
    const usersId = getUsersId(_req);
    if (!usersId) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }

    await clearDevices(usersId);
    res.status(200).json({ message: 'All devices removed' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listDevices,
  addDevice,
  removeDevice,
  deleteAllDevices,
};
