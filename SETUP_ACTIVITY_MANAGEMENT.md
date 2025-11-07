# Activity Management Setup Guide

## Problem

Cannot add activities to sites in work order creation.

## Solution

Run the database migration and seed default activities.

## Step-by-Step Instructions

### Step 1: Run Database Migration

**Option A: Using MySQL Command Line**

```bash
# Navigate to server directory
cd server

# Run migration (replace with your credentials)
mysql -u your_username -p your_database_name < migrations/0003_add_activity_management.sql
```

**Option B: Using Database Client (MySQL Workbench, DBeaver, etc.)**

1. Open your database client
2. Connect to your database
3. Open the file: `server/migrations/0003_add_activity_management.sql`
4. Execute the entire script

**Option C: Using Drizzle Kit (if configured)**

```bash
cd server
pnpm db:push
```

### Step 2: Verify Migration

Run this query in your database:

```sql
-- Check if new columns exist
DESCRIBE activities;
DESCRIBE work_order_sites;
DESCRIBE site_activities;

-- Check if new tables exist
SHOW TABLES LIKE '%day%';
SHOW TABLES LIKE '%tph%';
SHOW TABLES LIKE '%zapper%';
```

You should see:

- `activities` table has `activity_type` and `activity_sub_type` columns
- `work_order_sites` table has `activity_type` column
- `site_activities` table has `activity_description` column and nullable dates
- New tables: `zero_day_activities`, `zero_day_samples`, `tph_activities`, `oil_zapper_activities`

### Step 3: Seed Default Activities

```bash
cd server
node scripts/seed-default-activities.js
```

Expected output:

```
Starting to seed default insitu activities...
✓ Added activity: 0 Day Activity
✓ Added activity: 0 Day Sample
✓ Added activity: TPH Activity
✓ Added activity: Oil Zapper Activity

✅ Successfully seeded all default insitu activities!
```

### Step 4: Verify Seeded Data

Run this query:

```sql
SELECT id, name, activity_type, activity_sub_type FROM activities;
```

You should see 4 activities with `activity_type = 'insitu'`.

### Step 5: Test Creating Work Order with Activities

**Example API Request:**

```javascript
const workOrderData = {
  code: "WO-TEST-001",
  title: "Test Work Order",
  office_id: 1,
  client_id: 1,
  start_date: "2024-01-01",
  end_date: "2024-12-31",
  handing_over_date: "2025-01-15",
  agreement_number: "AGR-001",
  description: "Test",
  budget_amount: 100000,
  existingSiteIds: [1],
  workOrderSites: [
    {
      site_id: 1,
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      activity_type: "insitu",
      activities: [
        {
          activity_id: 1, // 0 Day Activity
          activity_description: "Initial measurements",
        },
        {
          activity_id: 2, // 0 Day Sample
          activity_description: "Sample collection",
        },
      ],
    },
  ],
};

// Using TRPC
await trpc.workOrder.createWorkOrder.mutate(workOrderData);
```

## Troubleshooting

### Error: "Table doesn't exist"

**Solution:** Migration hasn't run. Go back to Step 1.

### Error: "Column doesn't exist"

**Solution:**

```sql
-- Check what columns exist
DESCRIBE site_activities;

-- If activity_description is missing, run:
ALTER TABLE `site_activities` ADD COLUMN `activity_description` TEXT NULL;
```

### Error: "Foreign key constraint fails"

**Solution:** Make sure the `activity_id` you're using exists in the `activities` table.

```sql
SELECT id, name FROM activities WHERE activity_type = 'insitu';
```

### Activities not being inserted

**Check the mutation code is correct:**

```bash
# Search for the activities insertion code
grep -A 10 "Create site activities if provided" server/src/modules/work-order/work-mutation.mutation.route.ts
```

### Server won't start after migration

**Solution:** The schema.ts exports might not match your database. Restart the server:

```bash
cd server
pnpm dev
```

## Quick Test

After setup, test with this minimal work order:

```javascript
{
  code: "TEST-001",
  title: "Test",
  office_id: 1,
  client_id: 1,
  start_date: "2024-01-01",
  end_date: "2024-12-31",
  handing_over_date: "2025-01-01",
  agreement_number: "AGR-001",
  description: "Test",
  budget_amount: 100000,
  existingSiteIds: [1],
  workOrderSites: [{
    site_id: 1,
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    activity_type: "insitu",
    activities: [{ activity_id: 1 }]
  }]
}
```

## Verify It Worked

```sql
-- Check if site activities were created
SELECT
  sa.id,
  sa.wo_site_id,
  sa.activity_id,
  a.name as activity_name,
  sa.activity_description,
  sa.status
FROM site_activities sa
JOIN activities a ON sa.activity_id = a.id
ORDER BY sa.id DESC
LIMIT 5;
```

You should see your newly created site activities!

## Need Help?

1. Check server logs for error messages
2. Verify database connection is working
3. Ensure you have the latest code changes
4. Check `ACTIVITY_MANAGEMENT_GUIDE.md` for full documentation
