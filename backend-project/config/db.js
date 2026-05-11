const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host            : process.env.DB_HOST     || 'localhost',
  user            : process.env.DB_USER     || 'root',
  password        : process.env.DB_PASSWORD || '',
  database        : process.env.DB_NAME     || 'SIMS',
  waitForConnections: true,
  connectionLimit : 10,
  queueLimit      : 0,
  charset         : 'utf8mb4',
});

// Verify connectivity at start-up
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log(`  → Database : Connected to "${process.env.DB_NAME || 'SIMS'}" successfully`);
    conn.release();
  } catch (err) {
    console.error('  ✗ Database connection failed:', err.message);
  }
})();

module.exports = pool;
