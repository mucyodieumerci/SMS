const express          = require('express');
const router           = express.Router();
const {
  getAllSpareParts,
  getSparePartById,
  createSparePart,
}                      = require('../controllers/sparePartController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// GET  /api/spare-parts       – list all spare parts
router.get('/',    isAuthenticated, getAllSpareParts);

// GET  /api/spare-parts/:id   – get single spare part
router.get('/:id', isAuthenticated, getSparePartById);

// POST /api/spare-parts       – create new spare part
router.post('/',   isAuthenticated, createSparePart);

module.exports = router;
