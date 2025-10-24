const mysql = require('mysql2/promise'); // Using the promise API

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bc',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// CRITICAL FIX: Export the 'pool' object directly, not wrapped in another object.
module.exports = pool;
