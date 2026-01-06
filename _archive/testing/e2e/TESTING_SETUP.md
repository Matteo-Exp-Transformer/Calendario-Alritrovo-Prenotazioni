# E2E Testing Setup Guide

## Admin User Setup (Required for Tests 2-6)

The E2E tests require an admin user to be created in Supabase. Follow these steps:

### Option 1: Manual SQL Setup (Recommended)

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/dphuttzgdcerexunebct
   - Navigate to: **SQL Editor**

2. **Run the setup SQL**
   - Open the file: `e2e/setup-admin.sql`
   - Copy the SQL content
   - Paste in SQL Editor
   - Click "Run"

3. **Verify admin user created**
   - Check that the query returns 1 row with email: `admin@alritrovo.com`

### Option 2: Using the Setup Script

The setup script has already created the **Auth user** successfully:
- Email: `admin@alritrovo.com`
- User ID: `f31bee11-78c8-4d57-8c55-45fa736850e8`

You just need to add this user to the `admin_users` table using the SQL in Option 1.

### Test Credentials

Once setup is complete, the E2E tests will use:
- **Email**: `admin@alritrovo.com`
- **Password**: `admin123`

---

## Running the Tests

### All Tests

```bash
npm run test:e2e
```

### Individual Tests

```bash
# Test 1: Booking flow (works without admin)
npx playwright test e2e/01-booking-flow.spec.ts

# Test 2: Accept booking (requires admin)
npx playwright test e2e/02-accept-booking.spec.ts

# Test 3: Reject booking (requires admin)
npx playwright test e2e/03-reject-booking.spec.ts

# Test 4: Edit booking (requires admin)
npx playwright test e2e/04-edit-booking-calendar.spec.ts

# Test 5: Delete booking (requires admin)
npx playwright test e2e/05-delete-booking-calendar.spec.ts

# Test 6: Archive filters (requires admin)
npx playwright test e2e/06-archive-filters.spec.ts
```

### With UI Mode

```bash
npm run test:e2e:ui
```

### Debug Mode

```bash
npm run test:e2e:debug
```

---

## Test Status

| Test | Description | Requires Admin | Status |
|------|-------------|----------------|---------|
| 01 | User booking flow | ❌ No | ✅ Passing |
| 02 | Accept booking + email | ✅ Yes | ⏳ Skipped (needs admin) |
| 03 | Reject booking | ✅ Yes | ⏳ Skipped (needs admin) |
| 04 | Edit booking from calendar | ✅ Yes | ⏳ Skipped (needs admin) |
| 05 | Delete booking from calendar | ✅ Yes | ⏳ Skipped (needs admin) |
| 06 | Archive filters | ✅ Yes | ⏳ Skipped (needs admin) |

---

## Current Test Results

### Test 1: ✅ PASSED
- User can submit booking form successfully
- Email: matteo.cavallaro.work@gmail.com
- Booking created in database

### Tests 2-6: ⏳ SKIPPED
- Waiting for admin user setup
- Once admin user is created, run tests again

---

## Next Steps

1. **Create admin user** using SQL from `e2e/setup-admin.sql`
2. **Run all tests**: `npm run test:e2e`
3. **View report**: `npm run test:report`

---

## Troubleshooting

### Login Fails
- Verify admin user exists in `admin_users` table
- Check credentials: `admin@alritrovo.com` / `admin123`
- Check Supabase Auth dashboard for the user

### RLS Policy Errors
- Admin user insert requires service role or manual SQL
- Use the SQL file provided to bypass RLS

### Email Tests Fail
- Email tests require `RESEND_API_KEY` configured in Supabase Edge Function secrets
- Tests will pass but note that emails aren't sent if not configured

---

## Generated Files

- `e2e/screenshots/` - Test screenshots
- `test-results/` - Detailed test results
- `playwright-report/` - HTML report (run `npm run test:report` to view)
