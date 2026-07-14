# TODOS

## P2 — Rate-limit public report-submission endpoints
**What:** Add rate limiting to the public report-submission API routes (not just admin login).
**Why:** Once a real pilot gewog has real residents submitting reports, an unprotected public endpoint is abusable (spam, volume-based DoS) with zero protection today.
**Context:** Surfaced during the 2026-07-14 CEO security review alongside the admin-login rate limiter (which IS in scope for that PR). This item covers the citizen-facing submission endpoints instead.
**Effort:** S (human: ~1-2h / CC: ~15min)
**Priority:** P2 — relevant once the office-hours pilot outreach lands a real gewog and public traffic becomes real; not urgent at today's zero-traffic stage.
**Depends on:** A real pilot gewog actually going live (see office-hours design doc, `dell2-main-design-20260714-191258.md`).

## P1 (gated) — Real production deployment infrastructure
**What:** Hosted MySQL instance, Dockerfile/Vercel config, secrets manager, CI/CD.
**Why:** The app currently only runs against `localhost` MySQL with zero deploy config — this blocks ever running CivicPulse for a real pilot.
**Context:** Explicitly deferred in the 2026-07-14 CEO security review (Approach B chosen over Approach C) — validate demand via the office-hours design doc's outreach assignment BEFORE building this, not before.
**Effort:** M (human: ~1-2 weeks / CC: ~1 day)
**Priority:** P1, but gated — do NOT start until a real gewog/Thromde official confirms interest.
**Depends on:** office-hours design doc's outreach assignment succeeding.

## P1 (gated) — Persistent-store rate limiter before serverless deploy
**What:** Replace the in-memory login rate limiter with a shared/persistent store (Redis, or a MySQL table).
**Why:** In-memory counters don't survive across serverless invocations (e.g. Vercel). The rate limiter would silently stop limiting anything the moment this app deploys to a serverless platform.
**Context:** Surfaced by the outside voice during the 2026-07-14 eng review. The in-memory limiter is fine for now since nothing is deployed, but this must land before any real serverless deployment happens.
**Effort:** M (human: ~1 day / CC: ~1-2h)
**Priority:** P1, gated — same trigger as the hosted-infra TODO below.
**Depends on:** Hosted deployment infra TODO (below) actually starting.

## P2 — Fix the 65 pre-existing ESLint errors, then wire lint into the build
**What:** Fix all 65 real ESLint errors found by `npm run lint` (mostly `no-explicit-any` in `components/CreateReportModal.tsx`/`Map.tsx`, `require()` imports in `query_db.js`/`test_db.js`, unescaped entities, plus one real `react-hooks/set-state-in-effect` bug in `MapHome.tsx`). Once clean, chain `eslint .` into the `build` script (e.g. `"build": "eslint . && next build"`) or add a CI lint step, so lint is actually enforced going forward.
**Why:** During the 2026-07-14 eng review, removing `eslint.ignoreDuringBuilds` from `next.config.ts` turned out to be a no-op — **Next.js 16 removed built-in `next lint` integration from `next build` entirely**, regardless of that config key (TypeScript checking still works via `typescript.ignoreBuildErrors`; ESLint does not). `npm run lint` correctly surfaces all 65 errors today, but nothing currently forces it to run before a build or deploy. Chaining it into `build` today would break `npm run build` immediately for everyone, which is why this is deferred rather than done inline with the security PR.
**Context:** Confirmed via direct web research on Next.js 16's Turbopack/flat-config changes. This is a real, unrelated-to-auth gap the security PR surfaced but didn't cause.
**Effort:** S-M (human: ~3-5h / CC: ~45-60min) to fix the 65 errors; trivial to wire once clean.
**Priority:** P2 — real lint enforcement is currently a no-op despite `next.config.ts` implying otherwise; worth closing reasonably soon, not urgent today.
**Depends on:** Nothing — can start anytime.

## P3 — Migrate admin auth from hand-rolled JWT to real Supabase Auth
**What:** Replace the hand-rolled signed-JWT admin session (chosen 2026-07-14 as option 1A) with real Supabase Auth via the already-installed `@supabase/ssr`.
**Why:** 1A is right-sized for 3 hardcoded admins today. It won't scale cleanly to multiple departments, roles, or SSO if the pilot succeeds and the admin pool grows.
**Context:** Documented tradeoff from the 2026-07-14 CEO security review's auth-architecture decision (Section 1). Revisit deliberately, not by accident, if/when admin count or role complexity grows.
**Effort:** M (human: ~1-2 days / CC: ~2-3h)
**Priority:** P3 — only relevant if/when scale actually demands it.
**Depends on:** Admin pool growing past ~5 people, or a need for SSO/multi-department roles.
