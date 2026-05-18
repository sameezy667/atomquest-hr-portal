# 🚨 IMMEDIATE FIX STEPS - Deployed Version Stuck on Loading

## Current Status
✅ Code fix pushed to GitHub (commit: 34a7037)
⏳ Vercel is automatically deploying the new version
⚠️ You may also need to fix database RLS policies

---

## Step 1: Wait for Vercel Deployment (2-3 minutes)

### Check Deployment Status:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project: `atomquest-hr-portal`
3. Look for the latest deployment (should show "Building..." or "Ready")
4. Wait until it shows **"Ready"** with a green checkmark

### If Deployment is Stuck:
- Click on the deployment
- Check the build logs for errors
- If it fails, the error will be shown in the logs

---

## Step 2: Fix Database RLS Policies (CRITICAL)

The app can't create profiles if RLS policies block INSERT operations.

### Run This in Supabase SQL Editor:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `atomquest-hr-portal`
3. Click **SQL Editor** in the left sidebar
4. Click **"New query"**
5. Copy and paste this SQL:

```sql
-- Allow authenticated users to INSERT their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Verify it worked
SELECT 'RLS policy created successfully!' as status;
```

6. Click **"Run"** (or press Ctrl+Enter)
7. You should see: `RLS policy created successfully!`

**Alternative**: Run the complete `FIX_PROFILE_RLS.sql` file from the project root.

---

## Step 3: Test the Deployed App

### After Vercel deployment completes:

1. **Clear Browser Cache**:
   - Press `Ctrl + Shift + Delete`
   - Select "All time"
   - Check "Cached images and files" and "Cookies and site data"
   - Click "Clear data"

2. **Open Deployed App**:
   - Go to your Vercel URL (e.g., `https://your-app.vercel.app`)
   - Or check the URL in Vercel dashboard

3. **Try Logging In**:
   - Use your credentials
   - The app should now:
     - ✅ Authenticate successfully
     - ✅ Auto-create a profile (if it doesn't exist)
     - ✅ Load the dashboard (with default 'employee' role)

4. **Check Browser Console**:
   - Press `F12` to open DevTools
   - Go to "Console" tab
   - You should see:
     ```
     ✅ Profile created: [your-email-prefix]
     ✅ Profile loaded: [your-email-prefix]
     ```

---

## Step 4: Update User Role (If Needed)

If you logged in successfully but have the wrong role:

1. Go to Supabase SQL Editor
2. Run this (replace with your email):

```sql
UPDATE profiles 
SET 
  role = 'admin',  -- Change to 'admin', 'manager', or 'employee'
  full_name = 'Your Full Name',
  designation = 'Your Job Title',
  department_id = (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1)
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT email, full_name, role, designation FROM profiles WHERE email = 'your-email@example.com';
```

3. Log out and log back in to see the correct dashboard

---

## Step 5: Verify Everything Works

Test these features:
- [ ] Login works without infinite loading
- [ ] Dashboard loads correctly
- [ ] Navigation works
- [ ] Can create goals (if employee/manager)
- [ ] Can view analytics
- [ ] Settings page loads

---

## Troubleshooting

### Still Stuck on Loading?

**Check Console Errors**:
1. Press `F12` → Console tab
2. Look for red error messages
3. Common errors and fixes:

| Error | Fix |
|-------|-----|
| `406 Not Acceptable` | Run `FIX_PROFILE_RLS.sql` in Supabase |
| `Cannot coerce to single JSON` | Already fixed in new deployment |
| `Profile not found, signing out` | RLS policy blocking INSERT - run SQL fix |
| `Failed to fetch` | Check Supabase project is active |

**Check Network Tab**:
1. Press `F12` → Network tab
2. Reload the page
3. Look for failed requests (red)
4. Click on failed request to see details

### Vercel Deployment Failed?

1. Go to Vercel dashboard → Your project
2. Click on the failed deployment
3. Read the build logs
4. Common issues:
   - **Missing dependencies**: Run `npm install` in frontend folder
   - **TypeScript errors**: Check the error and fix the code
   - **Environment variables**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel

### Database Connection Error?

1. Check Supabase project is active (not paused)
2. Verify environment variables in Vercel:
   - Go to Vercel → Project → Settings → Environment Variables
   - Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
3. If you changed them, redeploy:
   - Go to Vercel → Project → Deployments
   - Click "..." on latest deployment → "Redeploy"

---

## Quick Reference

### Vercel Dashboard
https://vercel.com/dashboard

### Supabase Dashboard
https://supabase.com/dashboard

### GitHub Repository
https://github.com/sameezy667/atomquest-hr-portal

### Key Files
- `FIX_PROFILE_RLS.sql` - Fix database policies
- `UPDATE_USER_ROLES.sql` - Update user roles
- `TROUBLESHOOTING.md` - Detailed troubleshooting

---

## Expected Timeline

- **0-3 minutes**: Vercel builds and deploys new version
- **3-5 minutes**: Clear cache and test login
- **5-10 minutes**: Fix RLS policies if needed
- **10-15 minutes**: Update user roles and verify

**Total time to fix**: ~15 minutes maximum

---

## Success Indicators

You'll know it's fixed when:
- ✅ Login completes in 2-3 seconds (no infinite loading)
- ✅ Dashboard loads immediately after login
- ✅ Console shows: `✅ Profile loaded: [name]`
- ✅ No red errors in console
- ✅ Navigation works smoothly

---

## Need Help?

1. Check `TROUBLESHOOTING.md` for detailed solutions
2. Check browser console for specific error messages
3. Check Vercel build logs if deployment failed
4. Check Supabase logs in dashboard → Logs

**Remember**: The fix is already in the code and pushed to GitHub. Vercel is deploying it now. You just need to wait for the deployment and possibly fix the RLS policies!
