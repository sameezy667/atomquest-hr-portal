# Troubleshooting Guide

## Issue: App Stuck on "Connecting to database..."

### Symptoms
- Login page loads fine
- After entering credentials, app shows loading spinner indefinitely
- Console shows "Auth state changed: SIGNED_IN" but profile fetch fails

### Root Cause
The user authenticated successfully in Supabase Auth, but no corresponding profile record exists in the `profiles` table.

### Solution (Automatic - Already Fixed)
The app now automatically creates a profile when a user logs in for the first time. The profile will have:
- **Role**: `employee` (default)
- **Full Name**: Email prefix (before @)
- **Designation**: `Employee`
- **Department**: None (null)

### Manual Role Assignment
After first login, you need to assign proper roles to users:

1. Go to Supabase SQL Editor
2. Run the `UPDATE_USER_ROLES.sql` script
3. Replace the example emails with your actual user emails
4. Update the role, full_name, designation, and department_id as needed

Example:
```sql
UPDATE profiles 
SET 
  role = 'admin',
  full_name = 'John Doe',
  designation = 'System Administrator',
  department_id = (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1)
WHERE email = 'john@company.com';
```

---

## Issue: 406 Not Acceptable Error

### Symptoms
- Console shows: `GET .../profiles?... 406 (Not Acceptable)`
- Error message: `Cannot coerce the result to a single JSON object`

### Root Cause
Using `.single()` on a query that returns no results throws an error.

### Solution
Already fixed - the app now uses `.maybeSingle()` which returns `null` instead of throwing an error when no profile exists.

---

## Issue: Profile Not Found After Login

### Symptoms
- User can authenticate but gets signed out immediately
- Console shows: "Profile not found, signing out..."

### Solution
This should no longer happen with the auto-create fix. If it does:

1. Check if the `profiles` table exists:
```sql
SELECT * FROM profiles LIMIT 1;
```

2. Check if RLS policies allow INSERT:
```sql
-- Run this to allow authenticated users to create their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

3. Manually create the profile:
```sql
INSERT INTO profiles (id, email, full_name, role, designation)
VALUES (
  'USER_ID_FROM_AUTH',
  'user@example.com',
  'User Name',
  'employee',
  'Employee'
);
```

---

## Issue: Cannot Login - Invalid Credentials

### Symptoms
- Login form shows "Invalid email or password"
- Credentials are correct

### Solution
1. Verify the user exists in Supabase Auth:
   - Go to Supabase Dashboard → Authentication → Users
   - Check if the user is listed

2. If user doesn't exist, create them:
   - Click "Add user" → "Create new user"
   - Enter email and password
   - Confirm the user

3. After creating the user, they should be able to login and a profile will be auto-created

---

## Issue: Wrong Role After Login

### Symptoms
- User logs in but sees wrong dashboard (e.g., employee instead of admin)

### Solution
Update the user's role in the database:

```sql
UPDATE profiles 
SET role = 'admin'  -- or 'manager' or 'employee'
WHERE email = 'user@example.com';
```

Then have the user log out and log back in.

---

## Issue: Database Connection Error

### Symptoms
- Red error screen: "Database Connection Error"
- Cannot connect to Supabase

### Solution
1. Check your `.env` file in the `frontend` folder:
```env
VITE_SUPABASE_URL=https://juzewsgnulxpxjhqsnji.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Verify the Supabase project is active:
   - Go to https://supabase.com/dashboard
   - Check if the project is running (not paused)

3. Clear browser cache and try again:
   - Click "Clear Session & Retry" button
   - Or manually: Clear browser cache, localStorage, and reload

---

## Issue: Build Errors

### Symptoms
- `npm run build` fails
- TypeScript errors

### Solution
1. Clean install dependencies:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

2. Check Node.js version (should be 18+):
```bash
node --version
```

3. Try building again:
```bash
npm run build
```

---

## Issue: Dev Server Won't Start

### Symptoms
- `npm run dev` fails or hangs

### Solution
1. Check if port 5173 is already in use:
```bash
# Windows
netstat -ano | findstr :5173

# Kill the process if needed
taskkill /PID <process_id> /F
```

2. Try a different port:
```bash
npm run dev -- --port 3000
```

---

## Quick Fixes

### Clear Everything and Start Fresh
```bash
# Frontend
cd frontend
rm -rf node_modules package-lock.json dist
npm install
npm run build

# Clear browser data
# In browser: Ctrl+Shift+Delete → Clear all data
```

### Reset Auth State
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Check Supabase Connection
```javascript
// In browser console
const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log('Connection test:', { data, error });
```

---

## Getting Help

If none of these solutions work:

1. Check the browser console for detailed error messages
2. Check the Supabase logs in the dashboard
3. Verify all migrations were applied correctly
4. Ensure RLS policies are set up properly

For more help, check:
- `QUICK_SETUP.md` - Setup instructions
- `SUPABASE_SETUP_GUIDE.md` - Database setup
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
