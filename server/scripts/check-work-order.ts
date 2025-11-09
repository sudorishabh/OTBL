import { db } from "../src/db";
import {
  workOrderTable,
  workOrderSiteTable,
  siteTable,
  siteActivityTable,
  activityTable,
} from "../src/db/schema";
import { eq } from "drizzle-orm";

async function checkWorkOrder() {
  try {
    console.log("📋 Finding which work order has site activity 8...\n");

    // Find the site activity
    const siteActivity = await db
      .select({
        id: siteActivityTable.id,
        wo_site_id: siteActivityTable.wo_site_id,
        activity_id: siteActivityTable.activity_id,
      })
      .from(siteActivityTable)
      .where(eq(siteActivityTable.id, 8));

    if (siteActivity.length === 0) {
      console.log("❌ Site activity 8 not found");
      process.exit(1);
    }

    const woSiteId = siteActivity[0].wo_site_id;
    console.log(`🔗 Site activity 8 belongs to wo_site_id: ${woSiteId}`);

    // Find the work order site
    const woSite = await db
      .select({
        id: workOrderSiteTable.id,
        work_order_id: workOrderSiteTable.work_order_id,
        site_id: workOrderSiteTable.site_id,
      })
      .from(workOrderSiteTable)
      .where(eq(workOrderSiteTable.id, woSiteId));

    if (woSite.length === 0) {
      console.log("❌ Work order site not found");
      process.exit(1);
    }

    const workOrderId = woSite[0].work_order_id;
    const siteId = woSite[0].site_id;

    console.log(`📍 Work Order ID: ${workOrderId}`);
    console.log(`🏢 Site ID: ${siteId}`);

    // Get work order details
    const workOrder = await db
      .select()
      .from(workOrderTable)
      .where(eq(workOrderTable.id, workOrderId));

    if (workOrder.length > 0) {
      console.log(`\n📊 Work Order Details:`);
      console.log(`   Code: ${workOrder[0].code}`);
      console.log(`   Title: ${workOrder[0].title}`);
    }

    // Get site details
    const site = await db
      .select()
      .from(siteTable)
      .where(eq(siteTable.id, siteId));

    if (site.length > 0) {
      console.log(`\n🏗️  Site Details:`);
      console.log(`   Name: ${site[0].name}`);
      console.log(`   City: ${site[0].city}`);
    }

    console.log(`\n✨ To see activity 8 with data:`);
    console.log(
      `   1. Go to: http://localhost:3000/dashboard/work-order/${workOrderId}`
    );
    console.log(`   2. Click on site: ${site[0]?.name || siteId}`);
    console.log(
      `   3. You should see the activity with the blue card showing the metrics`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkWorkOrder();
