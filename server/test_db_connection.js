const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('Testing database connection...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Database connection successful!');

        const [rows] = await connection.execute('SELECT DATABASE() as db');
        console.log('Connected to database:', rows[0].db);

        await connection.end();
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('\nTrying without password...');

        try {
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                database: process.env.DB_NAME
            });

            console.log('✅ Connection successful WITHOUT password!');
            console.log('Please update .env to remove or correct the password.');
            await connection.end();
        } catch (err2) {
            console.error('❌ Connection also failed without password:', err2.message);
        }
    }
}

testConnection();
