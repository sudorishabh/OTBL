# Activity Management System - Implementation Summary

## Overview

Implemented a comprehensive activity management system for work orders with support for in-situ activities including 0 Day Activity, 0 Day Sample, TPH Activity, and Oil Zapper Activity.

## Changes Made

### 1. Database Schema Updates (`server/src/db/schema.ts`)

#### Modified Tables:

- **`activities`**: Added `activity_type` and `activity_sub_type` columns
- **`work_order_sites`**: Added `activity_type` column
- **`site_activities`**: Made dates optional, added `activity_description` column

#### New Tables Created:

- **`zero_day_activities`**: Tracks measurement data (length, width, depth, volume)
- **`zero_day_samples`**: Tracks sample data with density calculations
- **`tph_activities`**: Tracks Total Petroleum Hydrocarbon testing
- **`oil_zapper_activities`**: Tracks oil zapper deployment and completion

### 2. Activity Schema Updates (`server/src/modules/activity/activity.schema.ts`)

Added schemas for:

- Adding and editing activities with type/sub-type
- Adding site activities to work order sites
- Activity-specific data (0 Day, TPH, Oil Zapper)
- Update schemas for all activity types

### 3. Activity Mutation Routes (`server/src/modules/activity/activity.mutation.routes.ts`)

Added mutations for:

- `addActivity`: Create activity templates with type/sub-type
- `editActivity`: Update activity templates
- `addSiteActivity`: Add activities to work order sites
- `addZeroDayActivityData`: Add 0 day activity measurements
- `addZeroDaySampleData`: Add 0 day sample data
- `addTphActivityData`: Add TPH testing data
- `addOilZapperActivityData`: Add oil zapper activity data
- Update mutations for all activity types

### 4. Activity Query Routes (`server/src/modules/activity/activity.query.routes.ts`)

Added queries for:

- `getActivities`: Get all activities
- `getActivitiesByType`: Filter activities by type (insitu/exsitu)
- `getSiteActivities`: Get activities for a work order site
- `getZeroDayActivityData`: Get 0 day activity measurements
- `getZeroDaySampleData`: Get 0 day sample data
- `getTphActivityData`: Get TPH activity data
- `getOilZapperActivityData`: Get oil zapper activity data

### 5. Work Order Integration (`server/src/modules/work-order/`)

#### Schema Updates (`work-order.schema.ts`):

- Added `siteActivitySchema` for selecting activities during WO creation
- Updated `workOrderSiteSchema` to include `activity_type` and `activities` array

#### Mutation Updates (`work-mutation.mutation.route.ts`):

- Updated `createWorkOrder` to handle activity selection for sites
- Activities are automatically created when work order sites are added

### 6. Database Migration (`server/migrations/add_activity_management.sql`)

SQL migration file to:

- Alter existing tables (activities, work_order_sites, site_activities)
- Create new activity-specific tables
- Set up foreign key relationships

### 7. Seed Script (`server/scripts/seed-default-activities.js`)

Script to seed 4 default in-situ activities:

1. 0 Day Activity
2. 0 Day Sample
3. TPH Activity
4. Oil Zapper Activity

### 8. Documentation

Created comprehensive guides:

- **`ACTIVITY_MANAGEMENT_GUIDE.md`**: Complete implementation guide
- **`ACTIVITY_QUICK_REFERENCE.md`**: Quick API reference with examples
- Updated **`web/src/app/dashboard/work-order/page.tsx`** with implementation notes

### 9. Frontend Example Components

Created example component:

- **`ZeroDayActivityForm.tsx`**: Example form component for 0 day activity data collection

## Setup Instructions

### 1. Run Database Migration

```bash
# Option 1: Using MySQL command line
mysql -u your_user -p your_database < server/migrations/add_activity_management.sql

# Option 2: Using your database client
# Copy and execute the SQL from server/migrations/add_activity_management.sql
```

### 2. Seed Default Activities

```bash
cd server
node scripts/seed-default-activities.js
```

### 3. Verify Implementation

```bash
# Start the server
cd server
pnpm dev

# Start the web client
cd web
pnpm dev
```

## API Usage Flow

### Creating Work Order with Activities

1. **Select Office** for the work order
2. **Add Sites** (existing or new)
3. **For each site**:
   - Select `activity_type` (insitu/exsitu)
   - Based on type, select default activities to add
   - System creates `site_activity` records

### Managing Activity Data

1. **Get site activities**: Query activities for a work order site
2. **Add activity-specific data**:
   - For 0 Day Activity: measurements and volume
   - For 0 Day Sample: sample data with calculations
   - For TPH Activity: lab testing information
   - For Oil Zapper: intimation and completion tracking
3. **Update as needed**: Update activity data as information becomes available

## Key Features

### Activity Types

- **insitu**: Activities performed at the site
- **exsitu**: Activities performed off-site
- **general**: General activities

### Activity Sub-Types (for insitu)

- **zero_day_activity**: Initial measurements
- **zero_day_sample**: Sample collection
- **tph_activity**: TPH testing
- **oil_zapper_activity**: Oil zapper deployment

### Data Tracking

#### 0 Day Activity

- Measurements: length, width, depth (metric)
- Volume calculation
- Document upload support

#### 0 Day Sample

- Dimensions: length, width, height
- Calculated volume (A1 = L × W × H)
- Density measurement (A2)
- Final value (A = A1 × A2)
- Status tracking
- Document upload

#### TPH Activity

- Sample collection, send, and report dates
- TPH value from lab
- Lab information (name, contact, address)
- Lab report document upload

#### Oil Zapper Activity

- First intimation tracking
- Intimation document
- Activity completion tracking
- Completion notes and documents

## Frontend Implementation Notes

### Required Components

1. **WorkOrderList**: Display work orders
2. **CreateWorkOrderForm**: Multi-step form
   - Basic info
   - Site selection
   - Activity type & selection per site
   - Review & submit
3. **SiteActivityManager**: Manage site activities
4. **Activity Forms**: One for each activity type
   - ZeroDayActivityForm
   - ZeroDaySampleForm
   - TphActivityForm
   - OilZapperActivityForm

### TRPC Integration

All endpoints are accessible via TRPC:

- `trpc.activity.*` - Activity operations
- `trpc.workOrder.createWorkOrder` - Create WO with activities
- `trpc.workOrder.getWorkOrdersByOffice` - Get WOs

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Default activities are seeded
- [ ] Create work order with activities
- [ ] Add 0 Day Activity data
- [ ] Add 0 Day Sample data
- [ ] Add TPH Activity data
- [ ] Add Oil Zapper Activity data
- [ ] Update activity data
- [ ] Query site activities
- [ ] Query activity-specific data
- [ ] File upload integration
- [ ] Status updates

## Next Steps

1. **Implement Frontend Components**:

   - Create work order form with activity selection
   - Activity data entry forms
   - Activity list/management views

2. **File Upload System**:

   - Implement document upload (S3, cloud storage, etc.)
   - Generate and store document URLs
   - Document viewing/download functionality

3. **Validation & Business Logic**:

   - Date validations (collection before send before receive)
   - Required field validation based on status
   - Auto-calculation of derived values

4. **Reporting**:

   - Activity completion reports
   - Site progress tracking
   - Document management

5. **Permissions**:
   - Role-based access for activity management
   - Approval workflows if needed

## Files Modified/Created

### Backend (Server)

- ✅ `src/db/schema.ts` - Updated
- ✅ `src/modules/activity/activity.schema.ts` - Updated
- ✅ `src/modules/activity/activity.mutation.routes.ts` - Updated
- ✅ `src/modules/activity/activity.query.routes.ts` - Updated
- ✅ `src/modules/work-order/work-order.schema.ts` - Updated
- ✅ `src/modules/work-order/work-mutation.mutation.route.ts` - Updated
- ✅ `migrations/add_activity_management.sql` - Created
- ✅ `scripts/seed-default-activities.js` - Created

### Frontend (Web)

- ✅ `src/app/dashboard/work-order/page.tsx` - Updated with notes
- ✅ `src/app/dashboard/work-order/_components/ZeroDayActivityForm.tsx` - Created (example)

### Documentation

- ✅ `ACTIVITY_MANAGEMENT_GUIDE.md` - Created
- ✅ `ACTIVITY_QUICK_REFERENCE.md` - Created
- ✅ `ACTIVITY_IMPLEMENTATION_SUMMARY.md` - Created (this file)

## Support

For questions or issues:

1. Check `ACTIVITY_MANAGEMENT_GUIDE.md` for detailed documentation
2. Check `ACTIVITY_QUICK_REFERENCE.md` for API examples
3. Review example component in `ZeroDayActivityForm.tsx`
4. Check database schema in `server/src/db/schema.ts`

## Notes

- All activity-specific data tables have a 1:1 relationship with `site_activities`
- Document URLs need to be generated by your file upload system
- Calculations (volume, final_value) can be done on frontend or backend
- Status updates should follow the defined flow: pending → completed/cancelled
- All timestamps are nullable to allow progressive data entry
