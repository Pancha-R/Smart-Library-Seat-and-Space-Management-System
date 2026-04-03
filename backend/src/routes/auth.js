const express = require('express');
const router = express.Router();
const { register, login, deleteAccount } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.delete('/delete', authMiddleware, deleteAccount);
router.post('/register', register);
router.post('/login', login);

module.exports = router;