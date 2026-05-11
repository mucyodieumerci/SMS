const express          = require('express');
const router           = express.Router();
const { getAllStockIn, createStockIn } = require('../controllers/stockInController');
const { isAuthenticated }              = require('../middleware/authMiddleware');

// GET  /api/stock-in  – list all stock-in records
router.get('/',  isAuthenticated, getAllStockIn);

// POST /api/stock-in  – record new stock-in
router.post('/', isAuthenticated, createStockIn);

module.exports = router;
