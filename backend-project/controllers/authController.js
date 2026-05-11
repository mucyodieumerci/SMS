const bcrypt = require("bcryptjs");
const pool = require("../config/db");

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required.",
    });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM Users WHERE Username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // Persist authenticated session
    req.session.userId = user.UserID;
    req.session.username = user.Username;

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: { id: user.UserID, username: user.Username },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Error logging out." });
    }
    res.clearCookie("connect.sid");
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully." });
  });
};

// ── GET /api/auth/status ──────────────────────────────────────────────────────
const getStatus = (req, res) => {
  if (req.session && req.session.userId) {
    return res.status(200).json({
      authenticated: true,
      user: { id: req.session.userId, username: req.session.username },
    });
  }
  return res.status(200).json({ authenticated: false });
};

module.exports = { login, logout, getStatus };
