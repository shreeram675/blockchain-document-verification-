const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const path = require("path");

// DB
const db = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const institutionRoutes = require("./routes/institutionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const documentRoutes = require("./routes/documentRoutes");
const certificateRoutes = require("./routes/certificateRoutes");

// ✅ CREATE APP FIRST
const app = express();

/* =========================
   DATABASE INIT
========================= */
const initDB = async () => {
  try {
    console.log("🔄 Initializing database...");

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

    // Add missing tables for certificates/proofs
    await db.query(`
      CREATE TABLE IF NOT EXISTS verification_proofs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        verification_id INT NOT NULL,
        proof_hash CHAR(64) NOT NULL UNIQUE,
        proof_object JSON NOT NULL,
        blockchain_tx_hash VARCHAR(66) NULL,
        blockchain_block_number BIGINT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (verification_id) REFERENCES verifications(id) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS verification_certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        certificate_id VARCHAR(255) UNIQUE,
        document_id INT NULL,
        document_hash VARCHAR(255) NOT NULL,
        tx_hash VARCHAR(255) NULL,
        block_number BIGINT NULL,
        institution_id INT NULL,
        status ENUM('VALID', 'INVALID') NOT NULL,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        pdf_path VARCHAR(255) NULL,
        qr_url VARCHAR(255) NULL,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
        FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE SET NULL
      )
    `);

    console.log("✅ All tables ready (incl. proofs/certificates)");

    const bcrypt = require("bcryptjs");

    await db.query(`DELETE FROM users WHERE email = 'admin@example.com'`);

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ('System Admin', 'admin@example.com', ?, 'admin')`,
      [hashedPassword],
    );

    console.log("✅ Admin user ready");
  } catch (err) {
    console.error("❌ DB Init Error:", err);
  }
};

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(helmet()); // ✅ ONLY ONCE HERE
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   STATIC FILES (optional public)
========================= */
app.use(express.static("public"));

/* =========================
   API ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/certificates", certificateRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =========================
   FRONTEND SERVING
========================= */
const frontendPath = path.join(__dirname, "..", "client", "dist");

app.use(express.static(frontendPath));

app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.stack);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

/* =========================
   START SERVER
========================= */
const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  await initDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
