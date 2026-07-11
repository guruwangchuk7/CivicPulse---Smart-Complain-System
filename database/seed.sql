-- =============================================================================
-- CivicPulse — Seed Data
-- Run after schema.sql. Populates lookup tables, RBAC defaults, the two
-- admin accounts currently hardcoded in lib/admin.ts, and the config values
-- currently hardcoded as magic numbers in the API routes.
-- =============================================================================

-- Departments (types/index.ts: Department)
INSERT INTO departments (code, label) VALUES
('ROADS',      'Roads Department'),
('SANITATION', 'Sanitation Department'),
('EMERGENCY',  'Emergency Services'),
('GENERAL',    'General Affairs');

-- Categories + their auto-assigned department (app/api/reports/route.ts: getDepartment())
INSERT INTO categories (code, label, default_department_id) VALUES
('POTHOLE', 'Pothole', (SELECT id FROM departments WHERE code = 'ROADS')),
('TRASH',   'Trash',   (SELECT id FROM departments WHERE code = 'SANITATION')),
('HAZARD',  'Hazard',  (SELECT id FROM departments WHERE code = 'EMERGENCY')),
('OTHER',   'Other',   (SELECT id FROM departments WHERE code = 'GENERAL'));

-- Report statuses (types/index.ts: ReportStatus, extended with two states the
-- admin dashboard will need once report moderation/dedup exists)
INSERT INTO report_statuses (code, label, sort_order) VALUES
('OPEN',        'Open',        1),
('IN_PROGRESS', 'In Progress', 2),
('RESOLVED',    'Resolved',    3),
('REJECTED',    'Rejected',    4),
('DUPLICATE',   'Duplicate',   5);

-- Roles
INSERT INTO roles (name, description) VALUES
('SUPER_ADMIN',      'Full access to all resources'),
('ADMIN',            'Manage reports, comments, and feedback'),
('DEPARTMENT_STAFF', 'View and update reports assigned to their department');

-- Permissions
INSERT INTO permissions (code, description) VALUES
('reports.view',          'View reports'),
('reports.update_status', 'Change report status'),
('reports.delete',        'Soft-delete a report'),
('comments.moderate',     'Hide or delete comments'),
('admins.manage',         'Create/update/deactivate admin accounts'),
('analytics.view',        'View analytics dashboard'),
('feedback.manage',       'Review and resolve feedback');

-- SUPER_ADMIN: every permission
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name = 'SUPER_ADMIN'), id FROM permissions;

-- ADMIN: everything except admin-account management
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name = 'ADMIN'), id
FROM permissions WHERE code <> 'admins.manage';

-- DEPARTMENT_STAFF: read + status updates + analytics only
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name = 'DEPARTMENT_STAFF'), id
FROM permissions WHERE code IN ('reports.view', 'reports.update_status', 'analytics.view');

-- Admin accounts — mirrors lib/admin.ts ADMIN_EMAILS exactly. Once admin_users
-- is wired up, that hardcoded array can be deleted and isAdmin() should query
-- this table instead (see DATABASE_DESIGN.md "Missing Features").
INSERT INTO admin_users (email, full_name, auth_provider, role_id) VALUES
('guruwangchuk1234@gmail.com', 'Guru Wangchuk', 'SUPABASE_MAGIC_LINK', (SELECT id FROM roles WHERE name = 'SUPER_ADMIN')),
('admin@civicpulse.com',       'Default Admin',  'SUPABASE_MAGIC_LINK', (SELECT id FROM roles WHERE name = 'SUPER_ADMIN'));

-- Config values — currently hardcoded magic numbers in:
--   app/api/reports/route.ts      (computePriority)
--   app/api/leaderboard/route.ts  (score formula)
INSERT INTO app_settings (setting_key, setting_value) VALUES
('priority_score.vote_weight',    '3'),
('priority_score.age_cap_hours',  '72'),
('priority_score.age_weight',     '30'),
('leaderboard.report_points',     '10'),
('leaderboard.vote_points',       '3');
