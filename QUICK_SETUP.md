# ⚡ QUICK SETUP - Easiest Way (10 Minutes)

## Skip the Seed Data - Create Users Manually Instead!

The seed data requires auth users to exist first. **It's easier to create users manually.**

---

## Step 1: Apply Migrations Only (5 minutes)

In Supabase SQL Editor, run these 4 files **in order**:

1. ✅ `supabase/migrations/001_schema.sql` - Copy/paste → Run
2. ✅ `supabase/migrations/002_rls.sql` - Copy/paste → Run
3. ✅ `supabase/migrations/003_functions.sql` - Copy/paste → Run
4. ✅ `supabase/migrations/004_email_notifications.sql` - Copy/paste → Run

**Then run this simple seed:**

5. ✅ `EASY_SEED_DATA.sql` - Copy/paste → Run (just created this file)

---

## Step 2: Create Demo Users Manually (3 minutes)

Go to **Authentication** → **Users** → **Add user** (green button)

Create these 3 users:

### User 1: Employee
- **Email**: `arun.m@atomq.com`
- **Password**: `AtomQ@2026`
- **Auto Confirm**: ✅ Yes

### User 2: Manager
- **Email**: `meera.k@atomq.com`
- **Password**: `AtomQ@2026`
- **Auto Confirm**: ✅ Yes

### User 3: Admin
- **Email**: `admin@atomq.com`
- **Password**: `AtomQ@2026`
- **Auto Confirm**: ✅ Yes

---

## Step 3: Update User Profiles (2 minutes)

After creating the auth users, go to **SQL Editor** and run:

```sql
-- Update the profiles that were auto-created
UPDATE profiles SET 
  full_name = 'Arun Mehta',
  role = 'employee',
  designation = 'Senior Software Engineer',
  department_id = 'd0000000-0000-0000-0000-000000000001'
WHERE email = 'arun.m@atomq.com';

UPDATE profiles SET 
  full_name = 'Meera Kumar',
  role = 'manager',
  designation = 'Engineering Manager',
  department_id = 'd0000000-0000-0000-0000-000000000001'
WHERE email = 'meera.k@atomq.com';

UPDATE profiles SET 
  full_name = 'Admin User',
  role = 'admin',
  designation = 'HR Administrator',
  department_id = NULL
WHERE email = 'admin@atomq.com';

-- Set Arun's manager to Meera
UPDATE profiles SET 
  manager_id = (SELECT id FROM profiles WHERE email = 'meera.k@atomq.com')
WHERE email = 'arun.m@atomq.com';
```

---

## ✅ Done! That's It!

Your database is now ready with:
- ✅ All tables and functions
- ✅ 3 demo users (employee, manager, admin)
- ✅ Departments and goal cycles
- ✅ Ready for testing

---

## Test Login

Go to your app and login with:
- **Employee**: `arun.m@atomq.com` / `AtomQ@2026`
- **Manager**: `meera.k@atomq.com` / `AtomQ@2026`
- **Admin**: `admin@atomq.com` / `AtomQ@2026`

---

## Next: Deploy to Vercel

Now you can deploy your frontend to Vercel!

1. Go to [vercel.com](https://vercel.com)
2. Import: `sameezy667/atomquest-hr-portal`
3. Root Directory: `frontend`
4. Add environment variables:
   ```
   VITE_SUPABASE_URL=https://juzewsgnulxpxjhqsnji.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1emV3c2dudWx4cHhqaHFzbmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDkzNjAsImV4cCI6MjA5NDY4NTM2MH0.6852LsYpqBBpvCkwlcxkr0FgqC9SxvWQrpk8UahXQvY
   ```
5. Deploy!

---

## 🎉 You're Almost Done!

**Total time**: ~10 minutes
**What's left**: Deploy to Vercel, test, record demo

**You got this!** 🚀
