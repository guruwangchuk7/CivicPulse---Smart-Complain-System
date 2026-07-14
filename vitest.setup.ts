// Runs before any test file is imported, so module-level fail-fast checks
// in lib/auth/jwt.ts and lib/auth/credentials.ts see valid env vars.
process.env.ADMIN_JWT_SECRET = 'test-secret-at-least-32-characters-long-000';
process.env.ADMIN_CREDENTIALS =
    'admin1@example.com:$2b$10$CwTycUXWue0Thq9StjUM0uJ8iZ2vv6L3XKQiSTMLmSNKZekg7NGDG,' +
    'admin2@example.com:$2b$10$CwTycUXWue0Thq9StjUM0uJ8iZ2vv6L3XKQiSTMLmSNKZekg7NGDG';
