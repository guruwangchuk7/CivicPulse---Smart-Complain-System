export async function initDB() {
    const { db } = await import('@/lib/db');

    const createReportsTable = `
        CREATE TABLE IF NOT EXISTS reports (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL,
            description TEXT,
            lat DOUBLE NOT NULL,
            lng DOUBLE NOT NULL,
            photo_url LONGTEXT,
            status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'OPEN',
            department ENUM('ROADS', 'SANITATION', 'EMERGENCY', 'GENERAL') DEFAULT 'GENERAL',
            priority_score INT DEFAULT 0,
            assigned_at TIMESTAMP NULL,
            resolved_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_status (status),
            INDEX idx_created_at (created_at),
            INDEX idx_lat_lng (lat, lng)
        );
    `;

    const createVotesTable = `
        CREATE TABLE IF NOT EXISTS votes (
            id VARCHAR(36) PRIMARY KEY,
            report_id VARCHAR(36) NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_vote (user_id, report_id),
            FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
        );
    `;

    const createCommentsTable = `
        CREATE TABLE IF NOT EXISTS comments (
            id VARCHAR(36) PRIMARY KEY,
            report_id VARCHAR(36) NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
            INDEX idx_report_id (report_id)
        );
    `;

    try {
        const connection = await db.getConnection();
        await connection.query(createReportsTable);
        await connection.query(createVotesTable);
        await connection.query(createCommentsTable);

        // Robust Migration for all MySQL versions (Pre-8.0 compat)
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM information_schema.columns 
            WHERE table_name = 'reports' 
            AND table_schema = DATABASE()
        `) as [any[], any];

        const existingColumns = new Set(columns.map(c => c.COLUMN_NAME));

        if (!existingColumns.has('department')) {
            await connection.query("ALTER TABLE reports ADD COLUMN department ENUM('ROADS', 'SANITATION', 'EMERGENCY', 'GENERAL') DEFAULT 'GENERAL'");
        }
        if (!existingColumns.has('priority_score')) {
            await connection.query("ALTER TABLE reports ADD COLUMN priority_score INT DEFAULT 0");
        }
        if (!existingColumns.has('assigned_at')) {
            await connection.query("ALTER TABLE reports ADD COLUMN assigned_at TIMESTAMP NULL");
        }
        if (!existingColumns.has('resolved_at')) {
            await connection.query("ALTER TABLE reports ADD COLUMN resolved_at TIMESTAMP NULL");
        }

        console.log('Tables and migrations checked successfully');
        connection.release();
    } catch (error) {
        console.error('Error initializing tables:', error);
    }
}
