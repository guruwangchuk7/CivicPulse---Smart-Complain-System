const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function testDatabase() {
    console.log('Connecting to MySQL database...');
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '9099',
        multipleStatements: true
    });

    console.log('Connected successfully!');

    try {
        console.log('Reading mysql_schema.sql...');
        const schemaPath = path.join(__dirname, 'mysql_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema initialization...');
        await connection.query(schemaSql);
        console.log('Database and tables initialized successfully!');

        // Switch to the database
        await connection.query('USE civic_pulse;');

        // 1. Insert test roles
        console.log('Seeding roles and permissions...');
        await connection.query(`
            INSERT INTO roles (name, description) VALUES 
            ('CITIZEN', 'Default public user with basic reporting and upvoting capabilities'),
            ('STAFF', 'Government personnel who update statuses and view analytics'),
            ('ADMIN', 'Super administrator with full system controls')
            ON DUPLICATE KEY UPDATE description=values(description);
        `);

        // 2. Insert test users
        console.log('Creating test users...');
        const citizenId = 'test-citizen-uuid-12345';
        const adminId = 'test-admin-uuid-67890';

        await connection.query(`
            INSERT INTO users (id, email, name, status, is_anonymous) VALUES
            (?, NULL, 'John Citizen', 'ACTIVE', 1),
            (?, 'admin@civicpulse.com', 'System Admin', 'ACTIVE', 0)
            ON DUPLICATE KEY UPDATE name=values(name);
        `, [citizenId, adminId]);

        // Assign role to admin
        await connection.query(`
            INSERT INTO user_roles (user_id, role_id) 
            SELECT ?, id FROM roles WHERE name = 'ADMIN'
            ON DUPLICATE KEY UPDATE user_id=user_id;
        `, [adminId]);

        // 3. Create a test report
        console.log('Creating a test report...');
        const reportId = 'test-report-uuid-99999';
        await connection.query(`
            INSERT INTO reports (id, user_id, category, description, lat, lng, status, department)
            VALUES (?, ?, 'POTHOLE', 'Deep pothole on Main Street near intersection.', 27.4712, 89.6386, 'OPEN', 'ROADS')
            ON DUPLICATE KEY UPDATE description=values(description);
        `, [reportId, citizenId]);

        // 4. Create a vote
        console.log('Adding an upvote...');
        const voteId = 'test-vote-uuid-11111';
        await connection.query(`
            INSERT INTO votes (id, report_id, user_id)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE report_id=report_id;
        `, [voteId, reportId, adminId]);

        // 5. Create a comment
        console.log('Adding a comment...');
        const commentId = 'test-comment-uuid-22222';
        await connection.query(`
            INSERT INTO comments (id, report_id, user_id, text)
            VALUES (?, ?, ?, 'Sent dispatch crew to check the location.')
            ON DUPLICATE KEY UPDATE text=values(text);
        `, [commentId, reportId, adminId]);

        // 6. Verification query
        console.log('\n--- VERIFICATION QUERY RESULTS ---');
        const [reports] = await connection.query(`
            SELECT 
                r.id, r.category, r.status, r.description,
                (SELECT COUNT(*) FROM votes WHERE report_id = r.id) as vote_count,
                (SELECT COUNT(*) FROM comments WHERE report_id = r.id) as comment_count
            FROM reports r WHERE r.id = ?
        `, [reportId]);
        console.log(JSON.stringify(reports, null, 2));

        console.log('\nAll database tests passed successfully! Cleaned and seeded.');

    } catch (err) {
        console.error('Error during database testing:', err);
    } finally {
        await connection.end();
    }
}

testDatabase();
