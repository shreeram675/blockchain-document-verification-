const mysql = require('mysql2/promise');
require('dotenv').config();

async function createProofsTable() {
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
            CREATE TABLE IF NOT EXISTS verification_proofs (
                id INT PRIMARY KEY AUTO_INCREMENT,
                verification_id INT NOT NULL,
                proof_hash VARCHAR(64) UNIQUE NOT NULL,
                proof_object JSON NOT NULL,
                blockchain_tx_hash VARCHAR(66) NULL,
                blockchain_block_number BIGINT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (verification_id) REFERENCES verifications(id) ON DELETE CASCADE
            );
        `;

        await connection.execute(createTableQuery);
        console.log('✅ verification_proofs table created successfully.');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating table:', error.message);
        process.exit(1);
    }
}

createProofsTable();
