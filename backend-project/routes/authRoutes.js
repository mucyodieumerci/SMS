const express              = require('express');
const router               = express.Router();
const { login, logout, getStatus } = require('../controllers/authController');

// POST /api/auth/login   – authenticate user
router.post('/login',  login);

// POST /api/auth/logout  – destroy session
router.post('/logout', logout);

// GET  /api/auth/status  – check if session is active (used by frontend on load)
router.get('/status',  getStatus);

module.exports = router;
