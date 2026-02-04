const mysql = require('mysql2/promise');
require('dotenv').config();

// Helper to safely delete file with retries (borrowed from controller, simplified for script)
const fs = require('fs');

async function createCertificatesTable() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Connected to database');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS verification_certificates (
                id INT PRIMARY KEY AUTO_INCREMENT,
                certificate_id VARCHAR(255) UNIQUE,
                document_id INT,
                document_hash VARCHAR(255),
                tx_hash VARCHAR(255),
                block_number INT,
                institution_id INT,
                status ENUM('VALID','INVALID'),
                issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                pdf_path VARCHAR(255),
                qr_url VARCHAR(255),
                FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
                FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE SET NULL
            );
        `;

        await connection.execute(createTableQuery);
        console.log('✅ verification_certificates table created successfully.');

        // Create 'certificates' directory if it doesn't exist
        const certDir = './certificates';
        if (!fs.existsSync(certDir)) {
            fs.mkdirSync(certDir);
            console.log('✅ Created /server/certificates directory');
        }

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating table:', error.message);
        process.exit(1);
    }
}

createCertificatesTable();
