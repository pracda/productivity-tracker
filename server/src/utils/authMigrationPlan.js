/*
Step 14 migration plan for auth + multi-user support

1. Implement Google OAuth login
2. Create/find User on successful login
3. Attach req.user in auth middleware
4. Update all queries to filter by req.user._id
5. Create user-specific planner records:
   - PersonalTask
   - DailyTemplate
   - DailyEntry
   - WeeklyPlan
   - Goal
   - GoalHistory
6. Migrate legacy single-user records with userId: null
   - Option A: assign to first authenticated user
   - Option B: leave legacy data isolated and start fresh per user
7. Protect all planner routes with requireAuth
*/