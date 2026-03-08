import mysql from 'mysql2/promise';

export const db = mysql.createPool({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: '9099', // Replace with your MySQL password
    database: 'civic_pulse', // Replace with your DB name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
