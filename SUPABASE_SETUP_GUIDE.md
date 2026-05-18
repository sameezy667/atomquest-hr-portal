# 🚀 Supabase Cloud Setup Guide

## Your Supabase Project Details

- **Project URL**: https://juzewsgnulxpxjhqsnji.supabase.co
- **Project Ref**: `juzewsgnulxpxjhqsnji`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## Step-by-Step Setup (15 minutes)

### Step 1: Access SQL Editor (1 minute)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/juzewsgnulxpxjhqsnji
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**

### Step 2: Apply Migrations (10 minutes)

Run each migration file **in order**. Copy the entire content of each file and click **"Run"**.

#### Migration 1: Schema (2 minutes)

1. Open file: `supabase/migrations/001_schema.sql`
2. Copy **entire content**
3. Paste in SQL Editor
4. Click **"Run"** (bottom right)
5. Wait for "Success" message

#### Migration 2: RLS Policies (2 minutes)

1. Open file: `supabase/migrations/002_rls.sql`
2. Copy **entire content**
3. Paste in SQL Editor (new query)
4. Click **"Run"**
5. Wait for "Success"

#### Migration 3: Functions & Triggers (3 minutes)

1. Open file: `supabase/migrations/003_functions.sql`
2. Copy **entire content**
3. Paste in SQL Editor (new query)
4. Click **"Run"**
5. Wait for "Success"

#### Migration 4: Email Notifications (2 minutes)

1. Open file: `supabase/migrations/004_email_notifications.sql`
2. Copy **entire content**
3. Paste in SQL Editor (new query)
4. Click **"Run"**
5. Wait for "Success"

### Step 3: Apply Seed Data (5 minutes) - OPTIONAL

Seed data creates demo users and sample goals. **Recommended for testing**.

Run each seed file **in order**:

1. `supabase/seed/001_users.sql` - Creates demo users
2. `supabase/seed/002_departments_cycles.sql` - Creates departments and cycles
3. `supabase/seed/003_goal_sheets.sql` - Creates goal sheets
4. `supabase/seed/004_goals.sql` - Creates goals
5. `supabase/seed/005_shared_goals.sql` - Creates shared goals
6. `supabase/seed/006_achievements.sql` - Creates achievements
7. `supabase/seed/007_checkins.sql` - Creates check-ins
8. `supabase/seed/008_audit_logs.sql` - Creates audit logs

For each file:
- Copy entire content
- Paste in SQL Editor (new query)
- Click "Run"
- Wait for "Success"

### Step 4: Verify Setup (2 minutes)

1. Go to **"Table Editor"** in left sidebar
2. You should see these tables:
   - profiles
   - departments
   - goal_cycles
   - goal_sheets
   - goals
   - shared_goal_groups
   - shared_goal_members
   - quarterly_achievements
   - manager_checkins
   - audit_logs
   - notifications

3. Click on **"profiles"** table
4. You should see 7 demo users (if you ran seed data)

---

## Demo Credentials (After Seed Data)

| Email | Password | Role |
|-------|----------|------|
| arun.m@atomq.com | AtomQ@2026 | Employee |
| meera.k@atomq.com | AtomQ@2026 | Manager |
| admin@atomq.com | AtomQ@2026 | Admin |

---

## Troubleshooting

### Error: "relation already exists"

**Solution**: Tables already exist. Skip that migration or drop tables first:

```sql
-- Only if you need to start fresh
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then re-run all migrations.

### Error: "permission denied"

**Solution**: You're logged in as the wrong user. Make sure you're using the project owner account.

### Error: "syntax error"

**Solution**: Make sure you copied the **entire** file content, including the first line.

---

## Next Steps

After database setup is complete:

1. ✅ Database schema applied
2. ✅ RLS policies active
3. ✅ Functions and triggers working
4. ✅ Seed data loaded (optional)

**Now you can**:
- Deploy frontend to Vercel
- Test the application
- Create demo video

---

## Quick Verification Query

Run this to verify everything is set up:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check demo users (if seed data applied)
SELECT full_name, email, role 
FROM profiles 
ORDER BY role, full_name;

-- Check goal cycles
SELECT name, cycle_type, start_date, end_date, is_active 
FROM goal_cycles 
ORDER BY cycle_year, cycle_type;
```

Expected results:
- 11 tables
- 7 users (if seeded)
- 5 goal cycles (if seeded)

---

## All Set! 🎉

Your Supabase database is now ready for production use!

**Project URL**: https://juzewsgnulxpxjhqsnji.supabase.co
**Status**: ✅ Ready for Vercel deployment
