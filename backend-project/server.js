const express = require("express");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

// ── Route imports ────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const sparePartRoutes = require("./routes/sparePartRoutes");
const stockInRoutes = require("./routes/stockInRoutes");
const stockOutRoutes = require("./routes/stockOutRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Session ───────────────────────────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || "smartpark-sims-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set true when using HTTPS in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/spare-parts", sparePartRoutes);
app.use("/api/stock-in", stockInRoutes);
app.use("/api/stock-out", stockOutRoutes);
app.use("/api/reports", reportRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "SmartPark SIMS API is running",
    company: "SmartPark – Rubavu District, Rwanda",
    timestamp: new Date().toISOString(),
  });
});

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("");
  console.log("  ╔══════════════════════════════════════════╗");
  console.log("  ║   SmartPark SIMS – Backend API Server    ║");
  console.log("  ╚══════════════════════════════════════════╝");
  console.log(`  \u2192 Running  : http://localhost:${PORT}`);
  console.log(`  \u2192 Health   : http://localhost:${PORT}/api/health`);
  console.log("");
});

module.exports = app;
