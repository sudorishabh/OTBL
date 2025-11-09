"use client";

import React from "react";

/**
 * Work Order Management Page
 *
 * This page will handle:
 * 1. Viewing all work orders for an office
 * 2. Creating new work orders with sites and activities
 * 3. Managing site activities (0 Day Activity, 0 Day Sample, TPH, Oil Zapper)
 *
 * Implementation Guide:
 *
 * ## Creating a Work Order with Activities
 *
 * When creating a work order, for each site you can:
 * 1. Select activity_type: "insitu" or "exsitu"
 * 2. Based on activity_type, select default activities to add
 * 3. For "insitu" type, you can select from:
 *    - 0 Day Activity (measurements and volume)
 *    - 0 Day Sample (sample collection with density)
 *    - TPH Activity (lab testing for petroleum hydrocarbons)
 *    - Oil Zapper Activity (oil zapper deployment)
 *
 * ## Activity Data Collection
 *
 * After work order creation, you'll need to collect activity-specific data:
 *
 * ### 0 Day Activity
 * Fields: length_metric, width_metric, depth_metric, volume_informed, document upload
 *
 * ### 0 Day Sample
 * Fields: length, width, height, volume_m3 (auto-calc), density, final_value (auto-calc), document upload
 *
 * ### TPH Activity
 * Fields: sample_collection_date, sample_send_date, report_received_date, tph_value, lab info, document upload
 *
 * ### Oil Zapper Activity
 * Fields: intimation_date, intimation_raised, intimation_doc, completion_date, completion_notes, completion_doc
 *
 * ## TRPC Endpoints to Use
 *
 * ### Queries
 * - trpc.workOrder.getWorkOrdersByOffice.query({ office_id: number })
 * - trpc.activity.getActivitiesByType.query({ activity_type: "insitu" | "exsitu" })
 * - trpc.activity.getSiteActivities.query({ wo_site_id: number })
 * - trpc.activity.getZeroDayActivityData.query({ site_activity_id: number })
 * - trpc.activity.getZeroDaySampleData.query({ site_activity_id: number })
 * - trpc.activity.getTphActivityData.query({ site_activity_id: number })
 * - trpc.activity.getOilZapperActivityData.query({ site_activity_id: number })
 *
 * ### Mutations
 * - trpc.workOrder.createWorkOrder.mutate({ ...workOrderData, workOrderSites: [{ activities: [...] }] })
 * - trpc.activity.addSiteActivity.mutate({ wo_site_id, activity_id, ... })
 * - trpc.activity.addZeroDayActivityData.mutate({ site_activity_id, length_metric, ... })
 * - trpc.activity.addZeroDaySampleData.mutate({ site_activity_id, length, width, ... })
 * - trpc.activity.addTphActivityData.mutate({ site_activity_id, sample_collection_date, ... })
 * - trpc.activity.addOilZapperActivityData.mutate({ site_activity_id, first_intimation_date, ... })
 *
 * ## Recommended Component Structure
 *
 * 1. WorkOrderList - Display all work orders
 * 2. CreateWorkOrderForm - Multi-step form for WO creation
 *    - Step 1: Basic WO info
 *    - Step 2: Select sites
 *    - Step 3: Configure each site (activity_type + select activities)
 *    - Step 4: Review and submit
 * 3. SiteActivityManager - Manage activities for a site
 * 4. ZeroDayActivityForm - Form for 0 day activity data
 * 5. ZeroDaySampleForm - Form for 0 day sample data
 * 6. TphActivityForm - Form for TPH activity data
 * 7. OilZapperActivityForm - Form for oil zapper activity data
 *
 * See ACTIVITY_MANAGEMENT_GUIDE.md for complete implementation details
 * See ACTIVITY_QUICK_REFERENCE.md for API usage examples
 */

const WorkOrderPage = () => {
  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Work Order Management</h1>
        <p className='text-gray-600 mt-2'>
          Create and manage work orders with site activities
        </p>
      </div>

      {/* <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
        <h2 className='font-semibold text-blue-900 mb-2'>
          Implementation Guide
        </h2>
        <p className='text-blue-800 text-sm mb-3'>
          This page needs to be implemented with the following components:
        </p>
        <ul className='list-disc list-inside text-blue-800 text-sm space-y-1'>
          <li>Work Order List with filtering</li>
          <li>Create Work Order Form (with site and activity selection)</li>
          <li>Site Activity Management interface</li>
          <li>Activity-specific data entry forms (0 Day, TPH, Oil Zapper)</li>
        </ul>
        <p className='text-blue-800 text-sm mt-3'>
          📚 See{" "}
          <code className='bg-blue-100 px-1'>ACTIVITY_MANAGEMENT_GUIDE.md</code>{" "}
          and{" "}
          <code className='bg-blue-100 px-1'>ACTIVITY_QUICK_REFERENCE.md</code>{" "}
          for details
        </p>
      </div> */}

      {/* Placeholder for Work Order components */}
      {/* <div className='grid gap-4'>
        <div className='border rounded-lg p-6 text-center text-gray-500'>
          <p>Work Order List Component - To be implemented</p>
        </div>
      </div> */}
    </div>
  );
};

export default WorkOrderPage;
