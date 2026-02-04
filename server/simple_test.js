const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '',
            database: 'doc_verify_db'
        });

        console.log('SUCCESS: Connected to database!');
        const [rows] = await connection.execute('SELECT DATABASE() as db');
        console.log('Database:', rows[0].db);
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.log('FAILED:', error.message);
        process.exit(1);
    }
}

testConnection();
