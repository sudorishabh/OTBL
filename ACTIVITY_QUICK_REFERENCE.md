# Activity Management - Quick Reference

## Database Migration Steps

1. **Run the migration SQL**

   ```bash
   cd server
   # Connect to your MySQL database and run the migration file
   mysql -u your_user -p your_database < migrations/add_activity_management.sql
   ```

2. **Seed default activities**
   ```bash
   node scripts/seed-default-activities.js
   ```

## API Quick Reference

### Creating a Work Order with Activities

```typescript
const workOrderData = {
  code: "WO-2024-001",
  title: "Site Remediation Project",
  office_id: 1,
  client_id: 5,
  start_date: "2024-01-01",
  end_date: "2024-12-31",
  handing_over_date: "2025-01-15",
  agreement_number: "AGR-2024-001",
  description: "Complete site remediation",
  budget_amount: 1000000,

  existingSiteIds: [10, 11],

  workOrderSites: [
    {
      site_id: 10,
      start_date: "2024-01-01",
      end_date: "2024-06-30",
      activity_type: "insitu", // Select activity type
      budget_amount: 500000,

      // Select default activities to add
      activities: [
        {
          activity_id: 1, // 0 Day Activity
          activity_description: "Initial site measurement",
        },
        {
          activity_id: 2, // 0 Day Sample
          activity_description: "Collect samples for analysis",
        },
        {
          activity_id: 3, // TPH Activity
          activity_description: "TPH testing and analysis",
        },
      ],
    },
    {
      site_id: 11,
      start_date: "2024-07-01",
      end_date: "2024-12-31",
      activity_type: "insitu",
      budget_amount: 500000,

      activities: [
        {
          activity_id: 1, // 0 Day Activity
        },
        {
          activity_id: 4, // Oil Zapper Activity
          activity_description: "Deploy oil zapper",
        },
      ],
    },
  ],
};

// Call the mutation
const result = await trpc.workOrder.createWorkOrder.mutate(workOrderData);
```

### Getting Activities by Type

```typescript
// Get all insitu activities
const insituActivities = await trpc.activity.getActivitiesByType.query({
  activity_type: "insitu",
});
// Returns: [
//   { id: 1, name: "0 Day Activity", activity_sub_type: "zero_day_activity", ... },
//   { id: 2, name: "0 Day Sample", activity_sub_type: "zero_day_sample", ... },
//   { id: 3, name: "TPH Activity", activity_sub_type: "tph_activity", ... },
//   { id: 4, name: "Oil Zapper Activity", activity_sub_type: "oil_zapper_activity", ... }
// ]
```

### Getting Site Activities

```typescript
// Get all activities for a specific work order site
const siteActivities = await trpc.activity.getSiteActivities.query({
  wo_site_id: 15,
});
```

### Adding Activity-Specific Data

#### 0 Day Activity

```typescript
// After site activity is created, add measurements
await trpc.activity.addZeroDayActivityData.mutate({
  site_activity_id: 101,
  length_metric: 10.5,
  width_metric: 8.2,
  depth_metric: 2.0,
  volume_informed: 172.2,
  document_url: "https://storage.example.com/measurements.pdf",
});
```

#### 0 Day Sample

```typescript
await trpc.activity.addZeroDaySampleData.mutate({
  site_activity_id: 102,
  length: 5.0,
  width: 4.0,
  height: 2.0,
  volume_m3: 40.0, // A1 = 5 × 4 × 2
  density: 1.5, // A2
  final_value: 60.0, // A = 40 × 1.5
  document_url: "https://storage.example.com/sample-report.pdf",
});
```

#### TPH Activity

```typescript
await trpc.activity.addTphActivityData.mutate({
  site_activity_id: 103,
  sample_collection_date: "2024-01-15",
  sample_send_date: "2024-01-16",
  sample_report_received_date: "2024-01-25",
  tph_value: 450.5,
  lab_name: "Environmental Testing Lab",
  lab_contact: "+91-9876543210",
  lab_address: "123 Lab Street, City",
  report_document_url: "https://storage.example.com/tph-report.pdf",
});
```

#### Oil Zapper Activity

```typescript
await trpc.activity.addOilZapperActivityData.mutate({
  site_activity_id: 104,
  first_intimation_date: "2024-01-10",
  first_intimation_raised: "yes",
  intimation_document_url: "https://storage.example.com/intimation.pdf",
  activity_completed_date: "2024-01-20",
  completion_notes: "Oil zapper successfully deployed and operational",
  completion_document_url: "https://storage.example.com/completion.pdf",
});
```

### Updating Activity Data

```typescript
// Update 0 Day Activity measurements
await trpc.activity.updateZeroDayActivityData.mutate({
  id: 5, // zero_day_activities table ID
  volume_informed: 180.5, // Updated volume
  document_url: "https://storage.example.com/updated-measurements.pdf",
});

// Update TPH results
await trpc.activity.updateTphActivityData.mutate({
  id: 3,
  sample_report_received_date: "2024-01-26",
  tph_value: 455.2,
  report_document_url: "https://storage.example.com/final-tph-report.pdf",
});
```

## Activity Sub-Types

| Sub-Type              | Activity Name       | Use Case                                    |
| --------------------- | ------------------- | ------------------------------------------- |
| `zero_day_activity`   | 0 Day Activity      | Initial site measurements (L×W×D, volume)   |
| `zero_day_sample`     | 0 Day Sample        | Sample collection with density calculations |
| `tph_activity`        | TPH Activity        | Total Petroleum Hydrocarbon lab testing     |
| `oil_zapper_activity` | Oil Zapper Activity | Oil zapper deployment tracking              |

## Frontend Form Fields

### 0 Day Activity Form

- Length (metric)
- Width (metric)
- Depth (metric)
- Volume Informed (calculated or manual)
- Document Upload

### 0 Day Sample Form

- Length
- Width
- Height
- Volume (A1 = L × W × H) - auto-calculated
- Density (A2)
- Final Value (A = A1 × A2) - auto-calculated
- Status selector
- Document Upload

### TPH Activity Form

- Sample Collection Date
- Sample Send Date
- Sample Report Received Date
- TPH Value (from lab report)
- Lab Name
- Lab Contact
- Lab Address
- Report Upload

### Oil Zapper Activity Form

- First Intimation Date
- First Intimation Raised (Yes/No)
- Intimation Document Upload
- Activity Completed Date
- Completion Notes
- Completion Document Upload

## Status Flow

```
Site Activity: pending → in progress → completed
                                     ↘ cancelled
```

Update site activity status as data is filled and verified.
