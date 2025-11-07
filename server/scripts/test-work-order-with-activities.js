// Test script to create a work order with activities
// Run with: node scripts/test-work-order-with-activities.js

import { db } from "../src/db/index.js";
import {
  workOrderTable,
  workOrderSiteTable,
  siteActivityTable,
  activityTable,
} from "../src/db/schema.js";
import { eq } from "drizzle-orm";

async function testWorkOrderWithActivities() {
  try {
    console.log("🧪 Testing Work Order Creation with Activities\n");

    // Step 1: Check if activities exist
    console.log("1️⃣ Checking for activities...");
    const activities = await db.select().from(activityTable);
    console.log(`   Found ${activities.length} activities`);

    if (activities.length === 0) {
      console.log(
        "❌ No activities found! Run: node scripts/seed-default-activities.js"
      );
      process.exit(1);
    }

    activities.forEach((act) => {
      console.log(`   - ${act.id}: ${act.name} (${act.activity_type})`);
    });

    // Step 2: Create a test work order
    console.log("\n2️⃣ Creating test work order...");
    const woResult = await db.insert(workOrderTable).values({
      code: `TEST-WO-${Date.now()}`,
      title: "Test Work Order with Activities",
      client_id: 1, // Update with valid client ID
      office_id: 1, // Update with valid office ID
      start_date: new Date("2024-01-01"),
      end_date: new Date("2024-12-31"),
      handing_over_date: new Date("2025-01-15"),
      agreement_number: "TEST-AGR-001",
      description: "Testing activity creation",
      budget_amount: "100000",
      expense_amount: "0",
      status: "pending",
    });

    const workOrderId = woResult[0].insertId;
    console.log(`   ✅ Work order created with ID: ${workOrderId}`);

    // Step 3: Create work order site
    console.log("\n3️⃣ Creating work order site...");
    const woSiteResult = await db.insert(workOrderSiteTable).values({
      work_order_id: workOrderId,
      site_id: 1, // Update with valid site ID
      start_date: new Date("2024-01-01"),
      end_date: new Date("2024-12-31"),
      activity_type: "insitu",
      status: "pending",
    });

    const woSiteId = woSiteResult[0].insertId;
    console.log(`   ✅ Work order site created with ID: ${woSiteId}`);

    // Step 4: Add activities to the site
    console.log("\n4️⃣ Adding activities to site...");
    const activityToAdd = activities[0]; // Use first activity

    const siteActivityResult = await db.insert(siteActivityTable).values({
      wo_site_id: woSiteId,
      activity_id: activityToAdd.id,
      activity_description: "Test activity description",
      start_date: new Date("2024-01-01"),
      end_date: new Date("2024-01-31"),
      status: "pending",
    });

    const siteActivityId = siteActivityResult[0].insertId;
    console.log(`   ✅ Site activity created with ID: ${siteActivityId}`);
    console.log(`   📋 Activity: ${activityToAdd.name}`);

    // Step 5: Verify creation
    console.log("\n5️⃣ Verifying site activities...");
    const siteActivities = await db
      .select()
      .from(siteActivityTable)
      .where(eq(siteActivityTable.wo_site_id, woSiteId));

    console.log(`   Found ${siteActivities.length} site activities`);
    siteActivities.forEach((sa) => {
      console.log(
        `   - Site Activity ID: ${sa.id}, Activity ID: ${sa.activity_id}, Status: ${sa.status}`
      );
    });

    console.log("\n✅ Test completed successfully!");
    console.log("\nNOTE: This test directly inserts into the database.");
    console.log(
      "If this works but your API doesn't, the issue is in the API layer.\n"
    );
  } catch (error) {
    console.error("\n❌ Test failed with error:");
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testWorkOrderWithActivities();
