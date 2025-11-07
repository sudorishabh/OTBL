# Debugging: Can't Add Activities to Sites

## Step 1: Verify Database Schema

Run these SQL queries in your database:

```sql
-- Check if activity columns exist
DESCRIBE activities;
-- Should show: activity_type, activity_sub_type columns

-- Check if work_order_sites has activity_type
DESCRIBE work_order_sites;
-- Should show: activity_type column

-- Check if site_activities has activity_description
DESCRIBE site_activities;
-- Should show: activity_description column (and nullable dates)

-- Check if new tables exist
SHOW TABLES LIKE '%day%';
SHOW TABLES LIKE '%tph%';
SHOW TABLES LIKE '%zapper%';
-- Should show: zero_day_activities, zero_day_samples, tph_activities, oil_zapper_activities
```

**If any of these are missing**, run:

```bash
cd server
pnpm db:migrate
```

## Step 2: Verify Activities Exist

```sql
SELECT * FROM activities;
```

**If no activities found**, run:

```bash
cd server
node scripts/seed-default-activities.js
```

## Step 3: Test Direct Database Insert

Run the test script:

```bash
cd server
node scripts/test-work-order-with-activities.js
```

This will:

- Check if activities exist
- Create a test work order
- Create a work order site
- Add an activity to the site
- Verify it was created

**If this works**, the database is fine and the issue is in the API.
**If this fails**, there's a database schema issue.

## Step 4: Check Server Logs

Restart your server with the debugging logs:

```bash
cd server
pnpm dev
```

When you try to create a work order with activities, you should see:

```
🚀 Creating work order with input: { ... }
📋 Creating X activities for site Y
✅ Successfully created X site activities
```

**If you don't see these logs**, the activities aren't reaching the server.

## Step 5: Common Issues & Fixes

### Issue 1: "activities is undefined"

**Check your request payload:**

```javascript
workOrderSites: [
  {
    site_id: 1,
    activities: [
      // ← Make sure this exists
      { activity_id: 1 },
    ],
  },
];
```

### Issue 2: "activity_id doesn't exist"

**Verify activity IDs:**

```sql
SELECT id, name FROM activities;
```

Use the correct ID from this query.

### Issue 3: "Foreign key constraint fails"

**Make sure wo_site_id exists:**
The work order site must be created before activities can be added.

### Issue 4: "Column 'activity_description' doesn't exist"

**Migration didn't run:**

```bash
cd server
pnpm db:migrate
```

### Issue 5: Activities array is empty

**Check your frontend code:**

```typescript
// Make sure you're actually adding activities
const activities = selectedActivities.map((actId) => ({
  activity_id: actId,
  activity_description: "...",
}));

workOrderSites: [
  {
    activities: activities, // ← Should not be empty
  },
];
```

## Step 6: Enable Full Debugging

Add this to your frontend when calling the API:

```typescript
try {
  const result = await trpc.workOrder.createWorkOrder.mutate(workOrderData);
  console.log("✅ Success:", result);
} catch (error) {
  console.error("❌ Error:", error);
  console.error("Error message:", error.message);
  console.error("Error data:", error.data);
}
```

## Step 7: Check Network Request

In browser DevTools:

1. Open Network tab
2. Create work order with activities
3. Find the request to `createWorkOrder`
4. Check the request payload
5. Check the response

**Request should include:**

```json
{
  "workOrderSites": [
    {
      "site_id": 1,
      "activity_type": "insitu",
      "activities": [
        {
          "activity_id": 1,
          "activity_description": "..."
        }
      ]
    }
  ]
}
```

## Step 8: Verify the Exact Error

What error are you getting?

- **No error, but activities not created** → Check database after creation
- **"Column doesn't exist"** → Run migration
- **"Foreign key constraint"** → Check activity_id exists
- **"Cannot read property 'length'"** → Activities array not being passed
- **Silent failure** → Check server logs

## Quick Test Commands

```bash
# 1. Run migration
cd server && pnpm db:migrate

# 2. Seed activities
node scripts/seed-default-activities.js

# 3. Test database directly
node scripts/test-work-order-with-activities.js

# 4. Restart server
pnpm dev
```

## What to Share for Help

If still not working, please provide:

1. Error message (exact text)
2. Server console output
3. Result of: `DESCRIBE site_activities;`
4. Result of: `SELECT * FROM activities;`
5. The exact JSON you're sending to create work order
