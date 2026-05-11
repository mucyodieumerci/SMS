const pool = require('../config/db');

// ── GET /api/stock-out ────────────────────────────────────────────────────────
const getAllStockOut = async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        so.StockOutID,
        so.SparePartID,
        sp.Name              AS SparePartName,
        sp.Category,
        so.StockOutQuantity,
        so.StockOutUnitPrice,
        so.StockOutTotalPrice,
        so.StockOutDate,
        so.CreatedAt
      FROM  Stock_Out  so
      JOIN  Spare_Part sp ON so.SparePartID = sp.SparePartID
      ORDER BY so.StockOutDate DESC, so.CreatedAt DESC
    `);
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('getAllStockOut error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/stock-out/:id ────────────────────────────────────────────────────
const getStockOutById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT so.*, sp.Name AS SparePartName, sp.Category
      FROM  Stock_Out  so
      JOIN  Spare_Part sp ON so.SparePartID = sp.SparePartID
      WHERE so.StockOutID = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock-out record not found.' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getStockOutById error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── POST /api/stock-out ───────────────────────────────────────────────────────
const createStockOut = async (req, res) => {
  const { sparePartId, stockOutQuantity, stockOutUnitPrice, stockOutDate } = req.body;

  if (!sparePartId || !stockOutQuantity || !stockOutUnitPrice || !stockOutDate) {
    return res.status(400).json({
      success: false,
      message: 'sparePartId, stockOutQuantity, stockOutUnitPrice, and stockOutDate are required.',
    });
  }
  if (parseInt(stockOutQuantity) <= 0) {
    return res.status(400).json({ success: false, message: 'Quantity must be > 0.' });
  }
  if (parseFloat(stockOutUnitPrice) <= 0) {
    return res.status(400).json({ success: false, message: 'Unit price must be > 0.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Validate part & check available stock
    const [parts] = await conn.query(
      'SELECT SparePartID, Name, Quantity FROM Spare_Part WHERE SparePartID = ?',
      [sparePartId],
    );
    if (parts.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Spare part not found.' });
    }
    const part = parts[0];
    if (part.Quantity < parseInt(stockOutQuantity)) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message : `Insufficient stock for "${part.Name}". Available: ${part.Quantity} unit(s).`,
      });
    }

    // Insert record
    const [result] = await conn.query(
      `INSERT INTO Stock_Out
         (SparePartID, StockOutQuantity, StockOutUnitPrice, StockOutDate)
       VALUES (?, ?, ?, ?)`,
      [sparePartId, parseInt(stockOutQuantity), parseFloat(stockOutUnitPrice), stockOutDate],
    );

    // Decrement spare part stock
    await conn.query(
      'UPDATE Spare_Part SET Quantity = Quantity - ? WHERE SparePartID = ?',
      [parseInt(stockOutQuantity), sparePartId],
    );

    await conn.commit();
    return res.status(201).json({
      success    : true,
      message    : `Stock-out recorded for "${part.Name}".`,
      stockOutId : result.insertId,
    });
  } catch (err) {
    await conn.rollback();
    console.error('createStockOut error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
};

// ── PUT /api/stock-out/:id ────────────────────────────────────────────────────
const updateStockOut = async (req, res) => {
  const { id } = req.params;
  const { stockOutQuantity, stockOutUnitPrice, stockOutDate } = req.body;

  if (!stockOutQuantity || !stockOutUnitPrice || !stockOutDate) {
    return res.status(400).json({
      success: false,
      message: 'stockOutQuantity, stockOutUnitPrice, and stockOutDate are required.',
    });
  }
  if (parseInt(stockOutQuantity) <= 0 || parseFloat(stockOutUnitPrice) <= 0) {
    return res.status(400).json({ success: false, message: 'Quantity and unit price must be > 0.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Fetch existing record
    const [oldRecs] = await conn.query(
      'SELECT * FROM Stock_Out WHERE StockOutID = ?',
      [id],
    );
    if (oldRecs.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Stock-out record not found.' });
    }

    const old     = oldRecs[0];
    const newQty  = parseInt(stockOutQuantity);
    const diff    = newQty - old.StockOutQuantity; // positive → need more stock

    if (diff > 0) {
      // Extra quantity being taken out – check availability
      const [parts] = await conn.query(
        'SELECT Quantity FROM Spare_Part WHERE SparePartID = ?',
        [old.SparePartID],
      );
      if (parts[0].Quantity < diff) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${parts[0].Quantity} additional unit(s) available.`,
        });
      }
    }

    // Apply update
    await conn.query(
      `UPDATE Stock_Out
       SET StockOutQuantity = ?, StockOutUnitPrice = ?, StockOutDate = ?
       WHERE StockOutID = ?`,
      [newQty, parseFloat(stockOutUnitPrice), stockOutDate, id],
    );

    // Adjust spare part quantity by the difference
    await conn.query(
      'UPDATE Spare_Part SET Quantity = Quantity - ? WHERE SparePartID = ?',
      [diff, old.SparePartID],
    );

    await conn.commit();
    return res.status(200).json({ success: true, message: 'Stock-out record updated.' });
  } catch (err) {
    await conn.rollback();
    console.error('updateStockOut error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
};

// ── DELETE /api/stock-out/:id ─────────────────────────────────────────────────
const deleteStockOut = async (req, res) => {
  const { id } = req.params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [recs] = await conn.query(
      'SELECT * FROM Stock_Out WHERE StockOutID = ?',
      [id],
    );
    if (recs.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Stock-out record not found.' });
    }

    const rec = recs[0];

    await conn.query('DELETE FROM Stock_Out WHERE StockOutID = ?', [id]);

    // Restore spare part quantity
    await conn.query(
      'UPDATE Spare_Part SET Quantity = Quantity + ? WHERE SparePartID = ?',
      [rec.StockOutQuantity, rec.SparePartID],
    );

    await conn.commit();
    return res.status(200).json({
      success: true,
      message: 'Stock-out record deleted and inventory quantity restored.',
    });
  } catch (err) {
    await conn.rollback();
    console.error('deleteStockOut error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
};

module.exports = {
  getAllStockOut,
  getStockOutById,
  createStockOut,
  updateStockOut,
  deleteStockOut,
};
