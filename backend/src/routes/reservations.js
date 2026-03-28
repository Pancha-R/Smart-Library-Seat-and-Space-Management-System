const express = require('express');
const router = express.Router();
const { createReservation, cancelReservation, getUserReservation } = require('../controllers/reservationController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createReservation);
router.delete('/:id', authMiddleware, cancelReservation);
router.get('/my', authMiddleware, getUserReservation);

module.exports = router;