const pool = require('../config/db');

// ── GET /api/reports/daily-stock-status?date=YYYY-MM-DD ──────────────────────
// Returns every spare part with today's stock-out quantity and remaining balance
const getDailyStockStatus = async (req, res) => {
  const { date } = req.query;
  const reportDate = date || new Date().toISOString().split('T')[0];

  try {
    const [rows] = await pool.query(`
      SELECT
        sp.SparePartID,
        sp.Name          AS SparePartName,
        sp.Category,
        sp.UnitPrice,
        sp.Quantity      AS StoredQuantity,
        COALESCE(
          (SELECT SUM(so.StockOutQuantity)
           FROM   Stock_Out so
           WHERE  so.SparePartID = sp.SparePartID
           AND    DATE(so.StockOutDate) = ?),
          0
        )                AS DailyStockOutQty,
        sp.Quantity - COALESCE(
          (SELECT SUM(so.StockOutQuantity)
           FROM   Stock_Out so
           WHERE  so.SparePartID = sp.SparePartID
           AND    DATE(so.StockOutDate) = ?),
          0
        )                AS RemainingQuantity,
        sp.TotalPrice    AS TotalStockValue
      FROM  Spare_Part sp
      ORDER BY sp.Name ASC
    `, [reportDate, reportDate]);

    return res.status(200).json({ success: true, date: reportDate, data: rows });
  } catch (err) {
    console.error('getDailyStockStatus error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/reports/daily-stock-out?date=YYYY-MM-DD ─────────────────────────
// Returns all stock-out transactions for a specific date
const getDailyStockOut = async (req, res) => {
  const { date } = req.query;
  const reportDate = date || new Date().toISOString().split('T')[0];

  try {
    const [rows] = await pool.query(`
      SELECT
        so.StockOutID,
        sp.Name               AS SparePartName,
        sp.Category,
        so.StockOutQuantity,
        so.StockOutUnitPrice,
        so.StockOutTotalPrice,
        so.StockOutDate
      FROM  Stock_Out  so
      JOIN  Spare_Part sp ON so.SparePartID = sp.SparePartID
      WHERE DATE(so.StockOutDate) = ?
      ORDER BY so.CreatedAt DESC
    `, [reportDate]);

    const totalAmount   = rows.reduce((s, r) => s + parseFloat(r.StockOutTotalPrice || 0), 0);
    const totalQuantity = rows.reduce((s, r) => s + parseInt(r.StockOutQuantity    || 0), 0);

    return res.status(200).json({
      success : true,
      date    : reportDate,
      data    : rows,
      summary : {
        totalTransactions : rows.length,
        totalQuantity,
        totalAmount       : totalAmount.toFixed(2),
      },
    });
  } catch (err) {
    console.error('getDailyStockOut error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getDailyStockStatus, getDailyStockOut };
