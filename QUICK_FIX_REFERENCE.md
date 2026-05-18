# Quick Fix Reference Card

## 🚨 App Stuck on "Connecting to database..."

### What Happened
The app now **automatically creates profiles** for new users, but they get the default `employee` role.

### What You Need to Do

1. **Let the user login** - The app will auto-create their profile
2. **Update their role in Supabase**:
   - Go to Supabase → SQL Editor
   - Run this (replace the email):

```sql
UPDATE profiles 
SET 
  role = 'admin',  -- or 'manager' or 'employee'
  full_name = 'Your Name',
  designation = 'Your Title',
  department_id = (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1)
WHERE email = 'your-email@example.com';
```

3. **User logs out and back in** - They'll see the correct dashboard

---

## 📋 Quick Commands

### Rebuild Frontend
```bash
cd frontend
npm run build
```

### Clear Browser Cache
Press `Ctrl + Shift + Delete` → Clear all data → Reload page

### Check Database Connection
In browser console:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 👥 User Setup Workflow

### For Each New User:

1. **Create in Supabase Auth**
   - Dashboard → Authentication → Users → Add user
   - Enter email and password

2. **User Logs In**
   - Profile auto-created with role = 'employee'

3. **Update Role (if needed)**
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
   ```

4. **User Logs Out & Back In**
   - Now sees correct dashboard

---

## 🔧 Common Issues

| Issue | Quick Fix |
|-------|-----------|
| Infinite loading | Clear browser cache, reload |
| Wrong dashboard | Update role in SQL, logout/login |
| 406 error | Already fixed in latest code |
| Can't login | Check user exists in Supabase Auth |
| Connection error | Check .env file has correct URL/key |

---

## 📁 Important Files

- `TROUBLESHOOTING.md` - Detailed troubleshooting guide
- `UPDATE_USER_ROLES.sql` - Template for updating user roles
- `QUICK_SETUP.md` - Initial setup instructions
- `SUPABASE_SETUP_GUIDE.md` - Database setup guide

---

## 🎯 Test Users Setup Example

```sql
-- Admin user
UPDATE profiles 
SET role = 'admin', full_name = 'Admin User', designation = 'Administrator'
WHERE email = 'admin@test.com';

-- Manager user
UPDATE profiles 
SET role = 'manager', full_name = 'Manager User', designation = 'Team Lead'
WHERE email = 'manager@test.com';

-- Employee user
UPDATE profiles 
SET role = 'employee', full_name = 'Employee User', designation = 'Developer'
WHERE email = 'employee@test.com';
```

---

## ✅ Verification Checklist

After fixing the stuck loading issue:

- [ ] User can login successfully
- [ ] Profile is created automatically
- [ ] Role updated in database
- [ ] User sees correct dashboard after re-login
- [ ] No console errors
- [ ] Navigation works properly

---

## 🆘 Still Stuck?

1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify migrations were applied
4. Try the "Clear Session & Retry" button
5. See `TROUBLESHOOTING.md` for detailed solutions
