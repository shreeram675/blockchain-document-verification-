const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTables() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Connected to database');

        const [rows] = await connection.execute("SHOW TABLES LIKE 'users'");
        if (rows.length > 0) {
            console.log('✅ Users table exists');
            const [userCount] = await connection.execute("SELECT COUNT(*) as count FROM users");
            console.log(`📊 Current user count: ${userCount[0].count}`);
        } else {
            console.log('❌ Users table does NOT exist');
        }

        await connection.end();
    } catch (error) {
        console.error('❌ Error checking tables:', error.message);
    }
}

checkTables();
