const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'server/.env' });

async function run() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'doc_verify_db'
        });
        const targetHash = '6be1323f1aee859e7356dc8162697db36b0b001aa7d446cb1ea351533f2015ed';
        const [rows] = await db.query('SELECT * FROM verification_proofs WHERE proof_hash = ?', [targetHash]);

        if (rows.length > 0) {
            console.log('✅ Found proof in database:');
            console.log(JSON.stringify(rows[0], null, 2));
        } else {
            console.log('❌ Proof NOT found in database.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
