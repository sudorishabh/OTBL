# Activity Management System - Implementation Guide

## Overview

This implementation adds a comprehensive activity management system for work orders, specifically designed to handle in-situ activities with detailed tracking for different activity types.

## Database Schema Changes

### 1. Updated Tables

#### `activities` table

Added columns:

- `activity_type`: ENUM('insitu', 'exsitu', 'general') - Categorizes activities by type
- `activity_sub_type`: ENUM('zero_day_activity', 'zero_day_sample', 'tph_activity', 'oil_zapper_activity', 'other') - Specific activity sub-categories

#### `work_order_sites` table

Added column:

- `activity_type`: VARCHAR(50) - Specifies the type of activities for this site (insitu/exsitu)

#### `site_activities` table

Modified:

- `start_date`: Changed to nullable TIMESTAMP
- `end_date`: Changed to nullable TIMESTAMP
- Added `activity_description`: TEXT - Detailed description for this specific activity instance

### 2. New Tables

#### `zero_day_activities`

Tracks initial site measurements and documentation:

- `site_activity_id`: Foreign key to site_activities (unique)
- `length_metric`: DECIMAL(10, 2) - Length measurement
- `width_metric`: DECIMAL(10, 2) - Width measurement
- `depth_metric`: DECIMAL(10, 2) - Depth measurement
- `volume_informed`: DECIMAL(10, 2) - Calculated/informed volume
- `document_url`: TEXT - URL to uploaded documents

#### `zero_day_samples`

Tracks initial sample collection and calculations:

- `site_activity_id`: Foreign key to site_activities (unique)
- `length`: DECIMAL(10, 2)
- `width`: DECIMAL(10, 2)
- `height`: DECIMAL(10, 2)
- `volume_m3`: DECIMAL(10, 3) - A1 = L × W × H (in cubic meters)
- `density`: DECIMAL(10, 3) - A2 density measurement
- `final_value`: DECIMAL(10, 3) - A = A1 × A2
- `document_url`: TEXT

#### `tph_activities`

Tracks Total Petroleum Hydrocarbon testing:

- `site_activity_id`: Foreign key to site_activities (unique)
- `sample_collection_date`: TIMESTAMP - When sample was collected
- `sample_send_date`: TIMESTAMP - When sample was sent to lab
- `sample_report_received_date`: TIMESTAMP - When report was received
- `tph_value`: DECIMAL(10, 3) - TPH measurement value
- `lab_name`: VARCHAR(255) - Laboratory name
- `lab_contact`: VARCHAR(15) - Lab contact number
- `lab_address`: TEXT - Lab address
- `report_document_url`: TEXT - URL to lab report

#### `oil_zapper_activities`

Tracks oil zapper deployment and activities:

- `site_activity_id`: Foreign key to site_activities (unique)
- `first_intimation_date`: TIMESTAMP - When first intimation was raised
- `first_intimation_raised`: ENUM('yes', 'no') - Whether intimation was raised
- `intimation_document_url`: TEXT - Intimation document URL
- `activity_completed_date`: TIMESTAMP - When activity was completed
- `completion_notes`: TEXT - Completion notes
- `completion_document_url`: TEXT - Completion document URL

## API Endpoints

### Activity Mutations

#### `addActivity`

Create a new activity template.

```typescript
input: {
  name: string;
  description: string;
  activity_type: "insitu" | "exsitu" | "general";
  activity_sub_type?: "zero_day_activity" | "zero_day_sample" | "tph_activity" | "oil_zapper_activity" | "other";
}
```

#### `editActivity`

Update an existing activity template.

```typescript
input: {
  id: number;
  name: string;
  description: string;
  activity_type?: "insitu" | "exsitu" | "general";
  activity_sub_type?: string;
}
```

#### `addSiteActivity`

Add an activity to a specific work order site.

```typescript
input: {
  wo_site_id: number;
  activity_id: number;
  activity_description?: string;
  start_date?: string | Date;
  end_date?: string | Date;
  status?: "pending" | "completed" | "cancelled";
}
response: {
  success: boolean;
  siteActivityId: number;
}
```

#### Activity-Specific Data Mutations

##### `addZeroDayActivityData`

```typescript
input: {
  site_activity_id: number;
  length_metric?: number;
  width_metric?: number;
  depth_metric?: number;
  volume_informed?: number;
  document_url?: string;
}
```

##### `addZeroDaySampleData`

```typescript
input: {
  site_activity_id: number;
  length?: number;
  width?: number;
  height?: number;
  volume_m3?: number;
  density?: number;
  final_value?: number;
  document_url?: string;
}
```

##### `addTphActivityData`

```typescript
input: {
  site_activity_id: number;
  sample_collection_date?: string | Date;
  sample_send_date?: string | Date;
  sample_report_received_date?: string | Date;
  tph_value?: number;
  lab_name?: string;
  lab_contact?: string;
  lab_address?: string;
  report_document_url?: string;
}
```

##### `addOilZapperActivityData`

```typescript
input: {
  site_activity_id: number;
  first_intimation_date?: string | Date;
  first_intimation_raised?: "yes" | "no";
  intimation_document_url?: string;
  activity_completed_date?: string | Date;
  completion_notes?: string;
  completion_document_url?: string;
}
```

#### Update Mutations

Similar update mutations exist for all activity types:

- `updateZeroDayActivityData`
- `updateZeroDaySampleData`
- `updateTphActivityData`
- `updateOilZapperActivityData`

### Activity Queries

#### `getActivities`

Fetch all activities.

#### `getActivitiesByType`

```typescript
input: {
  activity_type: "insitu" | "exsitu" | "general";
}
```

#### `getSiteActivities`

```typescript
input: {
  wo_site_id: number;
}
```

#### Activity-Specific Data Queries

- `getZeroDayActivityData({ site_activity_id: number })`
- `getZeroDaySampleData({ site_activity_id: number })`
- `getTphActivityData({ site_activity_id: number })`
- `getOilZapperActivityData({ site_activity_id: number })`

## Work Order Integration

### Creating Work Orders with Activities

When creating a work order, you can now specify activities for each site:

```typescript
{
  // ... other work order fields
  workOrderSites: [
    {
      site_id: 1,
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      activity_type: "insitu", // NEW
      budgets: [...],
      activities: [ // NEW
        {
          activity_id: 1, // e.g., "0 Day Activity"
          activity_description: "Initial site measurement",
          start_date: "2024-01-01",
          end_date: "2024-01-02"
        },
        {
          activity_id: 2, // e.g., "0 Day Sample"
          activity_description: "Collect initial samples"
        }
      ]
    }
  ]
}
```

## Setup Instructions

### 1. Run Database Migration

```bash
cd server
pnpm db:migrate
```

Then manually run the migration file:

```sql
-- Run the SQL in: migrations/add_activity_management.sql
```

### 2. Seed Default Activities

```bash
node scripts/seed-default-activities.js
```

This will create 4 default insitu activities:

1. 0 Day Activity
2. 0 Day Sample
3. TPH Activity
4. Oil Zapper Activity

## Usage Workflow

### 1. Create Work Order with Activities

1. Select office for work order
2. Add sites to the work order
3. For each site, select `activity_type` (insitu/exsitu)
4. Based on activity type, select which default activities to include
5. The system will automatically create site_activity entries

### 2. Fill Activity-Specific Data

After creating the work order:

#### For 0 Day Activity:

1. Get the `site_activity_id` from `getSiteActivities`
2. Call `addZeroDayActivityData` with measurements
3. Upload document and include URL
4. Update as needed with `updateZeroDayActivityData`

#### For 0 Day Sample:

1. Record length, width, height measurements
2. Calculate or enter volume_m3 (A1 = L × W × H)
3. Enter density (A2)
4. Calculate final value (A = A1 × A2)
5. Upload supporting documents

#### For TPH Activity:

1. Record sample collection date
2. Update when sample is sent to lab
3. Record lab information
4. Update when report is received
5. Enter TPH value from lab report
6. Upload lab report document

#### For Oil Zapper Activity:

1. Set first intimation date
2. Mark intimation as raised
3. Upload intimation document
4. Update completion date when activity is done
5. Add completion notes and documents

## Frontend Implementation Notes

### Work Order Creation Form

Add to the site configuration section:

```tsx
<Select name='activity_type'>
  <option value='insitu'>In-Situ</option>
  <option value='exsitu'>Ex-Situ</option>
</Select>;

{
  activity_type === "insitu" && (
    <MultiSelect name='activities'>
      {/* Fetch activities where activity_type = "insitu" */}
      <option value='1'>0 Day Activity</option>
      <option value='2'>0 Day Sample</option>
      <option value='3'>TPH Activity</option>
      <option value='4'>Oil Zapper Activity</option>
    </MultiSelect>
  );
}
```

### Activity Detail Forms

Create separate form components for each activity type:

- `ZeroDayActivityForm.tsx`
- `ZeroDaySampleForm.tsx`
- `TphActivityForm.tsx`
- `OilZapperActivityForm.tsx`

Each form should:

1. Fetch existing data (if any)
2. Allow data entry/editing
3. Handle file uploads for documents
4. Calculate derived values (e.g., volume_m3, final_value)
5. Submit to appropriate mutation

## File Upload Handling

Document URLs can be:

- S3 URLs
- Cloud storage URLs
- Relative paths to server storage

Implement file upload separately and pass the resulting URL to the activity data mutations.

## Data Validation

All measurements and calculations should be validated on:

1. Frontend (immediate feedback)
2. Backend (security/integrity)

Example validations:

- Positive numbers for measurements
- Date logic (collection before sending before receiving)
- Required fields based on activity status

## Status Management

Activity status flows:

```
pending → completed
        ↓
      cancelled
```

Update site_activity status as activities progress:

- `pending`: Activity assigned but not started
- `completed`: All required data entered and verified
- `cancelled`: Activity cancelled with reason

## Error Handling

All mutations include try-catch blocks with appropriate error messages:

- `NOT_FOUND`: Resource doesn't exist
- `BAD_REQUEST`: Invalid input data
- `INTERNAL_SERVER_ERROR`: Database or server errors

Check mutation responses and handle errors in the UI.
