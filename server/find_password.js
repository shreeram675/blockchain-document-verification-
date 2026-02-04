const mysql = require('mysql2/promise');

const passwords = ['', 'root', 'password', 'admin', 'rootpassword', '12345678', 'mysql'];

async function testPasswords() {
    for (const pwd of passwords) {
        try {
            const connection = await mysql.createConnection({
                host: 'localhost',
                port: 3306,
                user: 'root',
                password: pwd,
                database: 'doc_verify_db'
            });

            console.log(`SUCCESS! Password is: "${pwd}"`);
            await connection.end();
            process.exit(0);
        } catch (error) {
            console.log(`Failed with password "${pwd}"`);
        }
    }
    console.log('\nNone of the common passwords worked.');
    console.log('Please check your MySQL installation or reset the root password.');
    process.exit(1);
}

testPasswords();
