/**
 * SmartPark SIMS – Admin User Seeder
 * Usage: npm run seed
 * Creates / updates the default admin account with a bcrypt-hashed password.
 */
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

async function seedAdmin() {
  console.log("");
  console.log("  SmartPark SIMS – Admin User Setup");
  console.log("  ===================================");

  const username = "admin";
  const password = "admin123";

  try {
    console.log("  Hashing password (salt rounds: 12)…");
    const hashed = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO Users (Username, Password) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE Password = VALUES(Password)`,
      [username, hashed],
    );

    console.log("");
    console.log("  ✓ Admin user created / updated successfully!");
    console.log("");
    console.log("  ┌──────────────────────────────┐");
    console.log(`  │  Username : ${username.padEnd(18)} │`);
    console.log(`  │  Password : ${password.padEnd(18)} │`);
    console.log("  └──────────────────────────────┘");
    console.log("");
    console.log("  ⚠  Change the password after first login.");
    console.log("");
    process.exit(0);
  } catch (err) {
    console.error("  ✗ Seeding failed:", err.message);
    process.exit(1);
  }
}

seedAdmin();
