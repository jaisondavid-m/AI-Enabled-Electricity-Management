const express = require('express');
const {
  listDevices,
  addDevice,
  removeDevice,
  deleteAllDevices,
} = require('../controllers/deviceController');

const router = express.Router();

router.get('/', listDevices);
router.post('/', addDevice);
router.delete('/:id', removeDevice);
router.delete('/', deleteAllDevices);

module.exports = router;
