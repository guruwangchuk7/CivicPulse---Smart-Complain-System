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

    // Migration: add new columns to existing reports table if they don't exist
    const migrateReportsTable = `
        ALTER TABLE reports
            ADD COLUMN IF NOT EXISTS department ENUM('ROADS', 'SANITATION', 'EMERGENCY', 'GENERAL') DEFAULT 'GENERAL',
            ADD COLUMN IF NOT EXISTS priority_score INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP NULL,
            ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP NULL;
    `;

    try {
        const connection = await db.getConnection();
        await connection.query(createReportsTable);
        await connection.query(createVotesTable);
        await connection.query(createCommentsTable);
        // Run migration (safe, uses IF NOT EXISTS / IF EXISTS)
        try {
            await connection.query(migrateReportsTable);
        } catch {
            // Might fail on MySQL < 8 which doesn't support ADD COLUMN IF NOT EXISTS — ignore
        }
        console.log('Tables initialized successfully');
        connection.release();
    } catch (error) {
        console.error('Error initializing tables:', error);
    }
}
