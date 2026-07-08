const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },
});

// Optional: test connection (helps debugging on Render)
(async () => {
  try {
    const conn = await db.getConnection();
    console.log("✅ Connected to MySQL (TiDB Cloud)");
    conn.release();
  } catch (err) {
    console.error("❌ DB Connection Failed:", err.message);
  }
})();

module.exports = db;
