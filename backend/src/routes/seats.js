const express = require('express');
const router = express.Router();
const { getAllSeats, getSeatsByFloor, seedSeats } = require('../controllers/seatController');
const authMiddleware = require('../middleware/auth');

// PUBLIC - no auth needed
router.get('/seed', seedSeats);

// PROTECTED - auth required
router.get('/', authMiddleware, getAllSeats);
router.get('/:floor', authMiddleware, getSeatsByFloor);

module.exports = router;