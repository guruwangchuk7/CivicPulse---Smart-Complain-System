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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

    try {
        const connection = await db.getConnection();
        await connection.query(createReportsTable);
        await connection.query(createVotesTable);
        console.log('Tables initialized successfully');
        connection.release();
    } catch (error) {
        console.error('Error initializing tables:', error);
    }
}
