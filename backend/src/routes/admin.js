const express = require('express');
const router = express.Router();
const { getOverview } = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

router.get('/overview', authMiddleware, getOverview);

module.exports = router;