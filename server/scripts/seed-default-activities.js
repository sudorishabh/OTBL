// Script to seed default insitu activities
import { db } from "../src/db/index.js";
import { activityTable } from "../src/db/schema.js";

const defaultInsituActivities = [
  {
    name: "0 Day Activity",
    description:
      "Initial measurement and documentation of site conditions including volume calculations and measurements",
    activity_type: "insitu",
    activity_sub_type: "zero_day_activity",
  },
  {
    name: "0 Day Sample",
    description:
      "Initial sample collection and density measurement for volume and mass calculations",
    activity_type: "insitu",
    activity_sub_type: "zero_day_sample",
  },
  {
    name: "TPH Activity",
    description:
      "Total Petroleum Hydrocarbon testing - sample collection, laboratory analysis, and reporting",
    activity_type: "insitu",
    activity_sub_type: "tph_activity",
  },
  {
    name: "Oil Zapper Activity",
    description:
      "Oil zapper deployment activity with intimation and completion tracking",
    activity_type: "insitu",
    activity_sub_type: "oil_zapper_activity",
  },
];

async function seedActivities() {
  try {
    console.log("Starting to seed default insitu activities...");

    for (const activity of defaultInsituActivities) {
      await db.insert(activityTable).values(activity);
      console.log(`✓ Added activity: ${activity.name}`);
    }

    console.log("\n✅ Successfully seeded all default insitu activities!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding activities:", error);
    process.exit(1);
  }
}

seedActivities();
