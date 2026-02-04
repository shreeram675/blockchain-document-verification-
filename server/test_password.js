const mysql = require('mysql2/promise');

async function testPassword() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '8296133675',
            database: 'doc_verify_db'
        });

        console.log('SUCCESS! Password works!');
        const [rows] = await connection.execute('SELECT DATABASE() as db');
        console.log('Connected to database:', rows[0].db);
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.log('FAILED:', error.message);
        process.exit(1);
    }
}

testPassword();
