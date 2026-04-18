# Project Feature Audit (April 18, 2026)

## Scope and method
This assessment is based on:
- Product intent in `README.md`
- Implemented frontend pages/routes and state stores
- Implemented backend routes/controllers/models/middleware

Classification used per feature:
- **MVP**: core value delivery for daily productivity loop.
- **General**: extension/polish/advanced capability beyond strict MVP.

## Feature inventory and classification

| Feature | What exists today | Classification | Why |
|---|---|---|---|
| Authentication (Google OAuth + JWT) | Google sign-in endpoint, token issuance, protected routes, auth status endpoint | **MVP** | Required to isolate user data and enable personalized planning workflows |
| Daily planner and task execution | Daily entry generation, task toggle, add/edit/delete extra tasks, completion percentage, day closure and reopen support | **MVP** | Core user value: planning + execution + completion tracking |
| Carry-over / end-of-day flow | Move unfinished tasks to next day or delete on day close | **MVP** | Fundamental to continuity in a daily productivity product |
| Personal tasks + daily templates + routines | Persistent personal tasks and templates/routines used in day generation | **General** | Useful structure, but app can function without full template/routine layer in first launch |
| Weekly plan management | Weekly tasks CRUD with completion tracking | **General** | Strategic planning layer that sits above daily core |
| Goals system (monthly/six-month) + milestones + archive | Goal tracking with progress and milestone editing | **General** | Longer-horizon planning is valuable but not required for first-loop task completion product |
| Goal change history | Goal history model + endpoint support for change tracking | **General** | Audit/history is advanced quality-of-life functionality |
| Analytics dashboard | Daily trend, weekly trend, composition, streak/summary metrics + charts | **General** | Insight layer adds decision support after core data capture exists |
| Time metadata on tasks | Scheduled time, estimated duration, actual timing fields, logging hooks | **General** | Optimization capability beyond baseline task completion loop |
| Toasts / inline editing UX | Fast interaction patterns and visual feedback across pages | **General** | Improves usability, but not foundational for first value |

## Current weaknesses (persisting issues)

### 1) Security middleware is present but not wired into runtime
- `securityHeaders`, `rateLimiter`, and `errorHandler` middleware are implemented but not connected in `server/src/server.js` or route setup.
- This leaves security posture and abuse controls weaker than intended.

### 2) No request validation path for live APIs
- Joi validation schemas exist but are not integrated into route handlers.
- This increases risk of malformed payloads and inconsistent data shape reaching controllers.

### 3) No automated test harness
- Neither `client/package.json` nor `server/package.json` defines unit/integration/e2e test scripts.
- Regression risk is high as feature set grows (daily, weekly, goals, analytics, auth).

### 4) Auth token storage in `localStorage`
- Client auth state persists JWT in `localStorage`.
- This is common in MVPs but vulnerable to token theft under XSS conditions compared with `httpOnly` cookies.

### 5) Single-provider authentication
- Auth flow is tied to Google login only.
- This creates onboarding/access risk for users without/avoiding Google accounts.

### 6) Data/date handling complexity risk
- Business logic is highly date-driven (daily close, carry-over, weekly scoring, status calculations).
- Without automated tests and explicit timezone strategies, edge-case drift is likely (day boundaries, locale differences).

## Suggested priority order
1. Wire security middleware (`helmet`, rate limit, centralized error handling) into active request pipeline.
2. Add request validation middleware to all write endpoints.
3. Add server integration tests for daily close/carry-over/reopen and weekly score calculations.
4. Migrate auth token transport to secure cookie-based session/JWT strategy.
5. Add at least one backup auth path (email magic link or passwordless OTP).
