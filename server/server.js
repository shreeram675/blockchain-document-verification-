const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const fs = require("fs");
const path = require("path");

// ✅ Use SAME db everywhere
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const institutionRoutes = require("./routes/institutionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const documentRoutes = require("./routes/documentRoutes");
const certificateRoutes = require("./routes/certificateRoutes");

const app = express();

// ✅ Resolve schema path safely (works on Render + local)
const resolveSchemaPath = () => {
  const candidates = [
    path.join(__dirname, "database", "schema.sql"), // if database/ is beside server.js
    path.join(__dirname, "..", "database", "schema.sql"), // if server.js is inside /server
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      console.log("📄 Using schema at:", p);
      return p;
    }
  }
  throw new Error("schema.sql not found in expected locations");
};

// ✅ Initialize DB + Seed
const initDB = async () => {
  try {
    console.log("🔄 Initializing database...");

    const schemaPath = resolveSchemaPath();
    let schema = fs.readFileSync(schemaPath, "utf8");

    // Remove DB-specific lines (Railway already has DB)
    schema = schema.replace(/CREATE DATABASE.*;/gi, "");
    schema = schema.replace(/USE .*;/gi, "");

    const queries = schema
      .split(";")
      .map((q) => q.trim())
      .filter((q) => q.length);

    for (const query of queries) {
      try {
        await db.query(query);
      } catch (err) {
        console.log("⚠️ Skipped:", err.message);
      }
    }

    console.log("✅ Tables ensured");

    // ✅ Seed admin safely
    await db.query(`
      INSERT INTO users (name, email, password_hash, role)
      SELECT 'System Admin', 'admin@example.com',
      '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
      'admin'
      WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE email = 'admin@example.com'
      );
    `);

    console.log("✅ Admin user ready");
  } catch (err) {
    console.error("❌ DB Init Error:", err.message);
  }
};

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/certificates", certificateRoutes);

// Health
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

const PORT = Number(process.env.PORT) || 5000;

// 🚀 Start AFTER DB init
const startServer = async () => {
  await initDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
