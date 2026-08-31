const express = require('express');
const router = express.Router();
const { verifyTokenLimiter } = require('../middlewares/rateLimiter');
const { verifyToken, logout } = require('../controllers/authController');

router.post('/verify-token', verifyTokenLimiter, verifyToken);
router.post('/logout', logout);

module.exports = router;