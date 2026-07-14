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

## P3 — Clean up remaining `any`/type-safety lint debt
**What:** Address any non-blocking `any`-typed lines left over after the security PR fixes only what's blocking the re-enabled build checks.
**Why:** 36 existing `any`/`as any` instances were found (0 `@ts-ignore`, so no hidden compile errors). The security PR only fixes what's actually blocking; some may remain as warnings.
**Context:** Surfaced by the outside voice during the 2026-07-14 eng review, verified by direct grep.
**Effort:** S-M (human: ~2-4h / CC: ~30-45min), depends on how many remain after the security PR.
**Priority:** P3 — code-quality cleanup, not security-critical.
**Depends on:** The security PR landing first (T3/item 25).

## P3 — Migrate admin auth from hand-rolled JWT to real Supabase Auth
**What:** Replace the hand-rolled signed-JWT admin session (chosen 2026-07-14 as option 1A) with real Supabase Auth via the already-installed `@supabase/ssr`.
**Why:** 1A is right-sized for 3 hardcoded admins today. It won't scale cleanly to multiple departments, roles, or SSO if the pilot succeeds and the admin pool grows.
**Context:** Documented tradeoff from the 2026-07-14 CEO security review's auth-architecture decision (Section 1). Revisit deliberately, not by accident, if/when admin count or role complexity grows.
**Effort:** M (human: ~1-2 days / CC: ~2-3h)
**Priority:** P3 — only relevant if/when scale actually demands it.
**Depends on:** Admin pool growing past ~5 people, or a need for SSO/multi-department roles.
