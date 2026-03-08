const express = require('express');
const { sendReport } = require('../controllers/emailController');

const router = express.Router();

router.post('/send-report', sendReport);

module.exports = router;
