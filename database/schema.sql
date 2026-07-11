-- =============================================================================
-- CivicPulse — Production MySQL Schema
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Target: MySQL 8.0+
--
-- Reverse-engineered from the actual application code (lib/db.ts, lib/init-db.ts,
-- app/api/**/route.ts, components/**). See ../DATABASE_DESIGN.md for the full
-- entity/relationship analysis, ER diagram, and rationale behind every table.
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. LOOKUP / REFERENCE TABLES
--    Normalize the ReportCategory / Department / ReportStatus string-unions
--    (types/index.ts) instead of hardcoding them as ENUMs or in TS switch
--    statements (see getDepartment() in app/api/reports/route.ts).
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS departments (
    id          TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    code        VARCHAR(20)  NOT NULL,
    label       VARCHAR(60)  NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_departments_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
    id                      TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    code                    VARCHAR(20)  NOT NULL,
    label                   VARCHAR(60)  NOT NULL,
    default_department_id  TINYINT UNSIGNED NOT NULL,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_categories_code (code),
    KEY idx_categories_department (default_department_id),
    CONSTRAINT fk_categories_department
        FOREIGN KEY (default_department_id) REFERENCES departments(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS report_statuses (
    id          TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    code        VARCHAR(20) NOT NULL,
    label       VARCHAR(60) NOT NULL,
    sort_order  TINYINT UNSIGNED NOT NULL DEFAULT 0,
    UNIQUE KEY uq_report_statuses_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. IDENTITY
-- -----------------------------------------------------------------------------

-- Citizens are NOT authenticated in the current code (lib/user.ts generates a
-- random UUID and stores it in localStorage). This table exists purely to give
-- referential integrity to that anonymous id — it is not a login system.
CREATE TABLE IF NOT EXISTS users (
    id            CHAR(36) PRIMARY KEY,
    display_name  VARCHAR(100) NULL,
    email         VARCHAR(255) NULL,
    avatar_url    VARCHAR(500) NULL,
    is_banned     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roles (
    id          INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(50) NOT NULL,
    description VARCHAR(255) NULL,
    UNIQUE KEY uq_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permissions (
    id          INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    code        VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    UNIQUE KEY uq_permissions_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       INT UNSIGNED NOT NULL,
    permission_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    KEY idx_role_permissions_permission (permission_id),
    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Replaces the hardcoded ADMIN_EMAILS array in lib/admin.ts. Supports today's
-- Supabase-magic-link/Google-OAuth flow (supabase_user_id, password_hash NULL)
-- as well as a fully self-hosted MySQL auth flow (password_hash populated,
-- auth_provider = 'LOCAL') if the app is ever decoupled from Supabase.
CREATE TABLE IF NOT EXISTS admin_users (
    id                INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    uuid              CHAR(36) NOT NULL DEFAULT (UUID()),
    email             VARCHAR(255) NOT NULL,
    password_hash     VARCHAR(255) NULL,
    full_name         VARCHAR(150) NULL,
    auth_provider     ENUM('SUPABASE_MAGIC_LINK','GOOGLE_OAUTH','LOCAL') NOT NULL DEFAULT 'SUPABASE_MAGIC_LINK',
    supabase_user_id  CHAR(36) NULL,
    role_id           INT UNSIGNED NOT NULL,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at     TIMESTAMP NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at        TIMESTAMP NULL,
    UNIQUE KEY uq_admin_users_email (email),
    UNIQUE KEY uq_admin_users_uuid (uuid),
    UNIQUE KEY uq_admin_users_supabase_id (supabase_user_id),
    KEY idx_admin_users_role (role_id),
    CONSTRAINT fk_admin_users_role
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Only needed if/when admin sessions are managed directly in MySQL instead of
-- delegating entirely to Supabase's own session cookies.
CREATE TABLE IF NOT EXISTS admin_sessions (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    admin_user_id   INT UNSIGNED NOT NULL,
    token_hash      VARCHAR(255) NOT NULL,
    ip_address      VARCHAR(45) NULL,
    user_agent      VARCHAR(255) NULL,
    expires_at      TIMESTAMP NOT NULL,
    revoked_at      TIMESTAMP NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_admin_sessions_token (token_hash),
    KEY idx_admin_sessions_admin_user (admin_user_id),
    CONSTRAINT fk_admin_sessions_admin
        FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    admin_user_id   INT UNSIGNED NOT NULL,
    token_hash      VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMP NOT NULL,
    used_at         TIMESTAMP NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_password_reset_token (token_hash),
    KEY idx_password_reset_admin_user (admin_user_id),
    CONSTRAINT fk_password_reset_admin
        FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    admin_user_id   INT UNSIGNED NOT NULL,
    token_hash      VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMP NOT NULL,
    verified_at     TIMESTAMP NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_email_verification_token (token_hash),
    KEY idx_email_verification_admin_user (admin_user_id),
    CONSTRAINT fk_email_verification_admin
        FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. CORE DOMAIN — REPORTS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reports (
    id             CHAR(36) PRIMARY KEY,
    user_id        CHAR(36) NULL,
    category_id    TINYINT UNSIGNED NOT NULL,
    department_id  TINYINT UNSIGNED NOT NULL,
    status_id      TINYINT UNSIGNED NOT NULL DEFAULT 1,
    description    TEXT NULL,
    lat            DECIMAL(10,7) NOT NULL,
    lng            DECIMAL(10,7) NOT NULL,
    photo_url      VARCHAR(500) NULL,
    assigned_at    TIMESTAMP NULL,
    resolved_at    TIMESTAMP NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at     TIMESTAMP NULL,
    CONSTRAINT chk_reports_lat CHECK (lat BETWEEN -90 AND 90),
    CONSTRAINT chk_reports_lng CHECK (lng BETWEEN -180 AND 180),
    KEY idx_reports_status (status_id),
    KEY idx_reports_category (category_id),
    KEY idx_reports_department (department_id),
    KEY idx_reports_user (user_id),
    KEY idx_reports_created_at (created_at),
    KEY idx_reports_lat_lng (lat, lng),
    KEY idx_reports_status_created (status_id, created_at),
    FULLTEXT KEY ftx_reports_description (description),
    CONSTRAINT fk_reports_user       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_reports_category   FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_reports_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_reports_status     FOREIGN KEY (status_id) REFERENCES report_statuses(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fills a real gap: today PATCH /api/reports/[id]/status overwrites the status
-- with no history. Auto-populated by trg_reports_status_change below.
CREATE TABLE IF NOT EXISTS report_status_history (
    id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    report_id           CHAR(36) NOT NULL,
    old_status_id       TINYINT UNSIGNED NULL,
    new_status_id       TINYINT UNSIGNED NOT NULL,
    changed_by_admin_id INT UNSIGNED NULL,
    changed_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_status_history_report (report_id, changed_at),
    CONSTRAINT fk_status_history_report     FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_status_history_old_status FOREIGN KEY (old_status_id) REFERENCES report_statuses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_status_history_new_status FOREIGN KEY (new_status_id) REFERENCES report_statuses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_status_history_admin      FOREIGN KEY (changed_by_admin_id) REFERENCES admin_users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS votes (
    id          CHAR(36) PRIMARY KEY,
    report_id   CHAR(36) NOT NULL,
    user_id     CHAR(36) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_votes_report_user (report_id, user_id),
    KEY idx_votes_user (user_id),
    CONSTRAINT fk_votes_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_votes_user   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
    id          CHAR(36) PRIMARY KEY,
    report_id   CHAR(36) NOT NULL,
    user_id     CHAR(36) NOT NULL,
    text        VARCHAR(500) NOT NULL,
    is_flagged  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP NULL,
    KEY idx_comments_report (report_id, created_at),
    KEY idx_comments_user (user_id),
    CONSTRAINT fk_comments_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_comments_user   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Not required by today's single-photo flow, but the correct home for photos
-- once CreateReportModal.tsx stops embedding base64 blobs (see DATABASE_DESIGN.md
-- "Missing Features / Suggested Improvements" #1) and/or a multi-photo feature ships.
CREATE TABLE IF NOT EXISTS attachments (
    id              CHAR(36) PRIMARY KEY,
    report_id       CHAR(36) NOT NULL,
    file_url        VARCHAR(500) NOT NULL,
    file_type       VARCHAR(50) NULL,
    file_size_bytes INT UNSIGNED NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_attachments_report (report_id),
    CONSTRAINT fk_attachments_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. FEEDBACK, CHAT, NOTIFICATIONS, AUDIT
-- -----------------------------------------------------------------------------

-- Backs the empty app/api/feedback/route.ts stub and the "Community Feedback"
-- nav item already present (but unwired) in app/admin/page.tsx.
CREATE TABLE IF NOT EXISTS feedback (
    id             CHAR(36) PRIMARY KEY,
    user_id        CHAR(36) NULL,
    report_id      CHAR(36) NULL,
    category       ENUM('BUG','FEATURE_REQUEST','COMPLAINT','PRAISE','OTHER') NOT NULL DEFAULT 'OTHER',
    message        TEXT NOT NULL,
    contact_email  VARCHAR(255) NULL,
    status         ENUM('NEW','REVIEWED','RESOLVED','DISMISSED') NOT NULL DEFAULT 'NEW',
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_feedback_status (status),
    KEY idx_feedback_user (user_id),
    CONSTRAINT fk_feedback_user   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_feedback_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: app/api/chat/route.ts currently answers from canned logic and
-- persists nothing. This gives the assistant a history / analytics trail and
-- is a drop-in target if the canned logic is later replaced by a real LLM.
CREATE TABLE IF NOT EXISTS chat_logs (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id     CHAR(36) NULL,
    message     TEXT NOT NULL,
    reply       TEXT NOT NULL,
    lat         DECIMAL(10,7) NULL,
    lng         DECIMAL(10,7) NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_chat_logs_user (user_id),
    CONSTRAINT fk_chat_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: backs the currently-decorative red notification dot in the admin
-- header (app/admin/page.tsx) which has no real data behind it today.
CREATE TABLE IF NOT EXISTS admin_notifications (
    id                BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    admin_user_id     INT UNSIGNED NULL,
    type              VARCHAR(50) NOT NULL,
    title             VARCHAR(150) NOT NULL,
    body              VARCHAR(500) NULL,
    related_report_id CHAR(36) NULL,
    is_read           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_admin_notifications_admin (admin_user_id, is_read),
    CONSTRAINT fk_admin_notifications_admin  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_admin_notifications_report FOREIGN KEY (related_report_id) REFERENCES reports(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
    id             BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    actor_type     ENUM('ADMIN','SYSTEM') NOT NULL DEFAULT 'ADMIN',
    admin_user_id  INT UNSIGNED NULL,
    action         VARCHAR(100) NOT NULL,
    entity_type    VARCHAR(50) NOT NULL,
    entity_id      VARCHAR(36) NULL,
    old_value      JSON NULL,
    new_value      JSON NULL,
    ip_address     VARCHAR(45) NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_audit_logs_entity (entity_type, entity_id),
    KEY idx_audit_logs_admin (admin_user_id),
    CONSTRAINT fk_audit_logs_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Generic key/value config store — moves magic numbers (vote weight, age cap,
-- leaderboard point values) out of TypeScript source and into data.
CREATE TABLE IF NOT EXISTS app_settings (
    setting_key    VARCHAR(100) PRIMARY KEY,
    setting_value  TEXT NULL,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 5. VIEWS — reproduce the exact enriched queries currently hand-written in
--    app/api/reports/route.ts and app/api/leaderboard/route.ts
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW v_report_vote_counts AS
SELECT report_id, COUNT(*) AS vote_count
FROM votes
GROUP BY report_id;

CREATE OR REPLACE VIEW v_reports_enriched AS
SELECT
    r.*,
    c.code AS category_code,
    d.code AS department_code,
    s.code AS status_code,
    COALESCE(v.vote_count, 0) AS vote_count,
    ROUND(
        COALESCE(v.vote_count, 0) * 3 +
        LEAST(TIMESTAMPDIFF(HOUR, r.created_at, NOW()) / 72.0, 1) * 30
    ) AS priority_score
FROM reports r
JOIN categories c              ON c.id = r.category_id
JOIN departments d             ON d.id = r.department_id
JOIN report_statuses s         ON s.id = r.status_id
LEFT JOIN v_report_vote_counts v ON v.report_id = r.id
WHERE r.deleted_at IS NULL;

CREATE OR REPLACE VIEW v_leaderboard AS
SELECT
    r.user_id,
    COUNT(DISTINCT r.id) AS report_count,
    COALESCE(SUM(vc.vote_count), 0) AS votes_received,
    (COUNT(DISTINCT r.id) * 10 + COALESCE(SUM(vc.vote_count), 0) * 3) AS score
FROM reports r
LEFT JOIN v_report_vote_counts vc ON vc.report_id = r.id
WHERE r.deleted_at IS NULL AND r.user_id IS NOT NULL
GROUP BY r.user_id
ORDER BY score DESC;

-- -----------------------------------------------------------------------------
-- 6. TRIGGERS — automatic status-change audit trail
-- -----------------------------------------------------------------------------

DELIMITER $$

CREATE TRIGGER trg_reports_status_change
AFTER UPDATE ON reports
FOR EACH ROW
BEGIN
    IF NOT (OLD.status_id <=> NEW.status_id) THEN
        INSERT INTO report_status_history (report_id, old_status_id, new_status_id)
        VALUES (NEW.id, OLD.status_id, NEW.status_id);
    END IF;
END$$

DELIMITER ;
