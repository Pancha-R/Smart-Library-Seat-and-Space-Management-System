const express = require('express');
const router = express.Router();
const { checkIn } = require('../controllers/checkinController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, checkIn);

module.exports = router;