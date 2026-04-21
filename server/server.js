const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const path = require("path");

// ✅ Use SAME db everywhere
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const institutionRoutes = require("./routes/institutionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const documentRoutes = require("./routes/documentRoutes");
const certificateRoutes = require("./routes/certificateRoutes");

const app = express();

// ✅ Initialize DB + Seed
const initDB = async () => {
  try {
    console.log("🔄 Initializing database (direct SQL)...");

    await db.query(`
      CREATE TABLE IF NOT EXISTS institutions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        status ENUM('active','inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin','uploader','verifier') NOT NULL,
        institution_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS institution_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uploader_id INT NOT NULL,
        institution_name VARCHAR(255) NOT NULL,
        institution_address TEXT NOT NULL,
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        reviewed_by INT NULL,
        reviewed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        rejection_reason TEXT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uploader_id INT NOT NULL,
        institution_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_hash CHAR(66) NOT NULL,
        tx_hash CHAR(66),
        block_number BIGINT,
        status ENUM('active','revoked') DEFAULT 'active',
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doc_id INT,
        verifier_id INT,
        uploaded_hash CHAR(66) NOT NULL,
        stored_hash CHAR(66),
        result ENUM('valid','invalid') NOT NULL,
        verifier_ip VARCHAR(45),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Core tables created");

    // ✅ Admin reset (dev purpose)
    const bcrypt = require("bcryptjs");

    await db.query(`DELETE FROM users WHERE email = 'admin@example.com'`);

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await db.query(
      `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('System Admin', 'admin@example.com', ?, 'admin')
    `,
      [hashedPassword],
    );

    console.log("✅ Admin user ready");
  } catch (err) {
    console.error("❌ DB Init Error:", err);
  }
};

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/certificates", certificateRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ✅ Serve Vite frontend (correct path)
const frontendPath = path.join(__dirname, "client", "dist");

app.use(express.static(frontendPath));

// ✅ SAFE fallback (no wildcard → no crash)
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
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

// Start server
const startServer = async () => {
  await initDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
