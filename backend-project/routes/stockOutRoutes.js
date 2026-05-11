const express          = require('express');
const router           = express.Router();
const {
  getAllStockOut,
  getStockOutById,
  createStockOut,
  updateStockOut,
  deleteStockOut,
}                      = require('../controllers/stockOutController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// GET    /api/stock-out       – list all stock-out records
router.get('/',     isAuthenticated, getAllStockOut);

// GET    /api/stock-out/:id   – get single stock-out record
router.get('/:id',  isAuthenticated, getStockOutById);

// POST   /api/stock-out       – record new stock-out
router.post('/',    isAuthenticated, createStockOut);

// PUT    /api/stock-out/:id   – update stock-out record
router.put('/:id',  isAuthenticated, updateStockOut);

// DELETE /api/stock-out/:id   – delete stock-out record
router.delete('/:id', isAuthenticated, deleteStockOut);

module.exports = router;
