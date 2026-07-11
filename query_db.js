const mysql = require('mysql2/promise');

async function queryDB() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '9099',
        database: 'civic_pulse'
    });

    try {
        console.log('--- TABLES IN DATABASE ---');
        const [tables] = await connection.query('SHOW TABLES');
        console.log(tables);

        console.log('\n--- REPORTS COUNT ---');
        const [reportsCount] = await connection.query('SELECT COUNT(*) as count FROM reports');
        console.log(reportsCount);

        console.log('\n--- VOTES COUNT ---');
        const [votesCount] = await connection.query('SELECT COUNT(*) as count FROM votes');
        console.log(votesCount);

        console.log('\n--- COMMENTS COUNT ---');
        const [commentsCount] = await connection.query('SELECT COUNT(*) as count FROM comments');
        console.log(commentsCount);

        console.log('\n--- LATEST 5 REPORTS ---');
        const [reports] = await connection.query('SELECT id, category, status, description, priority_score, department FROM reports ORDER BY created_at DESC LIMIT 5');
        console.log(reports);

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

queryDB();
