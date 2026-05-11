const pool = require('../config/db');

// ── GET /api/stock-in ─────────────────────────────────────────────────────────
const getAllStockIn = async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        si.StockInID,
        si.SparePartID,
        sp.Name     AS SparePartName,
        sp.Category,
        si.StockInQuantity,
        si.StockInDate,
        si.CreatedAt
      FROM  Stock_In   si
      JOIN  Spare_Part sp ON si.SparePartID = sp.SparePartID
      ORDER BY si.StockInDate DESC, si.CreatedAt DESC
    `);
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('getAllStockIn error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── POST /api/stock-in ────────────────────────────────────────────────────────
const createStockIn = async (req, res) => {
  const { sparePartId, stockInQuantity, stockInDate } = req.body;

  if (!sparePartId || !stockInQuantity || !stockInDate) {
    return res.status(400).json({
      success: false,
      message: 'sparePartId, stockInQuantity, and stockInDate are required.',
    });
  }
  if (parseInt(stockInQuantity) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Stock-in quantity must be greater than 0.',
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verify spare part exists
    const [parts] = await conn.query(
      'SELECT SparePartID, Name FROM Spare_Part WHERE SparePartID = ?',
      [sparePartId],
    );
    if (parts.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Spare part not found.' });
    }

    // Insert stock-in record
    const [result] = await conn.query(
      'INSERT INTO Stock_In (SparePartID, StockInQuantity, StockInDate) VALUES (?, ?, ?)',
      [sparePartId, parseInt(stockInQuantity), stockInDate],
    );

    // Increment spare part stock
    await conn.query(
      'UPDATE Spare_Part SET Quantity = Quantity + ? WHERE SparePartID = ?',
      [parseInt(stockInQuantity), sparePartId],
    );

    await conn.commit();
    return res.status(201).json({
      success   : true,
      message   : `Stock-in recorded for "${parts[0].Name}".`,
      stockInId : result.insertId,
    });
  } catch (err) {
    await conn.rollback();
    console.error('createStockIn error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
};

module.exports = { getAllStockIn, createStockIn };
