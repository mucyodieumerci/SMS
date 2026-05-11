const pool = require('../config/db');

// ── GET /api/spare-parts ──────────────────────────────────────────────────────
const getAllSpareParts = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Spare_Part ORDER BY Name ASC',
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('getAllSpareParts error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/spare-parts/:id ──────────────────────────────────────────────────
const getSparePartById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Spare_Part WHERE SparePartID = ?',
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Spare part not found.' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getSparePartById error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── POST /api/spare-parts ─────────────────────────────────────────────────────
const createSparePart = async (req, res) => {
  const { name, category, quantity, unitPrice } = req.body;

  // Validation
  if (!name || !category || quantity === undefined || quantity === null || !unitPrice) {
    return res.status(400).json({
      success: false,
      message: 'All fields (name, category, quantity, unitPrice) are required.',
    });
  }
  if (parseFloat(quantity) < 0) {
    return res.status(400).json({ success: false, message: 'Quantity cannot be negative.' });
  }
  if (parseFloat(unitPrice) <= 0) {
    return res.status(400).json({ success: false, message: 'Unit price must be greater than 0.' });
  }

  try {
    // Duplicate name check
    const [existing] = await pool.query(
      'SELECT SparePartID FROM Spare_Part WHERE Name = ?',
      [name.trim()],
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `A spare part named "${name}" already exists.`,
      });
    }

    const [result] = await pool.query(
      'INSERT INTO Spare_Part (Name, Category, Quantity, UnitPrice) VALUES (?, ?, ?, ?)',
      [name.trim(), category.trim(), parseInt(quantity), parseFloat(unitPrice)],
    );

    const [newPart] = await pool.query(
      'SELECT * FROM Spare_Part WHERE SparePartID = ?',
      [result.insertId],
    );

    return res.status(201).json({
      success: true,
      message : 'Spare part created successfully.',
      data    : newPart[0],
    });
  } catch (err) {
    console.error('createSparePart error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllSpareParts, getSparePartById, createSparePart };
