const express          = require('express');
const router           = express.Router();
const { getDailyStockStatus, getDailyStockOut } = require('../controllers/reportController');
const { isAuthenticated }                       = require('../middleware/authMiddleware');

// GET /api/reports/daily-stock-status?date=YYYY-MM-DD
router.get('/daily-stock-status', isAuthenticated, getDailyStockStatus);

// GET /api/reports/daily-stock-out?date=YYYY-MM-DD
router.get('/daily-stock-out',    isAuthenticated, getDailyStockOut);

module.exports = router;
