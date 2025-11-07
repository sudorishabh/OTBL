# Quick Setup - Run These Commands

## 1. Apply Database Migration

Run this command in your terminal:

```bash
cd server
pnpm db:migrate
```

If that doesn't work, use Drizzle push:

```bash
cd server
pnpm drizzle-kit push
```

## 2. Seed Default Activities

```bash
cd server
node scripts/seed-default-activities.js
```

## 3. Restart Server

```bash
cd server
pnpm dev
```

## 4. Test Creating Work Order with Activities

Now you can create a work order with activities! Example:

```typescript
{
  code: "WO-001",
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
  workOrderSites: [{
    site_id: 1,
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    activity_type: "insitu",  // ← Add this
    activities: [              // ← Add this
      {
        activity_id: 1,  // 0 Day Activity
        activity_description: "Initial site measurement"
      }
    ]
  }]
}
```

## Verify It Worked

Check your database:

```sql
-- See the new activity tables
SHOW TABLES;

-- See default activities
SELECT * FROM activities;

-- After creating a work order, check site activities
SELECT * FROM site_activities ORDER BY id DESC LIMIT 5;
```

That's it! Your activity management system is now ready to use.
