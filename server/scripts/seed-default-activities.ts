// Script to seed default activities (both insitu and exsitu)
import { db } from "../src/db/index";
import { activityTable } from "../src/db/schema";

const defaultActivities = [
  // In-Situ Activities
  {
    name: "0 Day Activity",
    description:
      "Initial measurement and documentation of site conditions including volume calculations and measurements",
    activity_type: "insitu" as const,
    activity_sub_type: "zero_day_activity" as const,
  },
  {
    name: "0 Day Sample",
    description:
      "Initial sample collection and density measurement for volume and mass calculations",
    activity_type: "insitu" as const,
    activity_sub_type: "zero_day_sample" as const,
  },
  {
    name: "TPH Activity",
    description:
      "Total Petroleum Hydrocarbon testing - sample collection, laboratory analysis, and reporting",
    activity_type: "insitu" as const,
    activity_sub_type: "tph_activity" as const,
  },
  {
    name: "Oil Zapper Activity",
    description:
      "Oil zapper deployment activity with intimation and completion tracking",
    activity_type: "insitu" as const,
    activity_sub_type: "oil_zapper_activity" as const,
  },
  // Ex-Situ Activities
  {
    name: "Soil Excavation",
    description:
      "Excavation and removal of contaminated soil from the site for off-site treatment",
    activity_type: "exsitu" as const,
    activity_sub_type: "other" as const,
  },
  {
    name: "Transportation",
    description:
      "Transportation of contaminated material to treatment facility",
    activity_type: "exsitu" as const,
    activity_sub_type: "other" as const,
  },
  {
    name: "Off-site Treatment",
    description:
      "Treatment of contaminated soil at off-site facility",
    activity_type: "exsitu" as const,
    activity_sub_type: "other" as const,
  },
  {
    name: "Disposal",
    description:
      "Final disposal of treated or untreatable contaminated material",
    activity_type: "exsitu" as const,
    activity_sub_type: "other" as const,
  },
];

async function seedActivities() {
  try {
    console.log("Starting to seed default activities...");

    for (const activity of defaultActivities) {
      try {
        await db.insert(activityTable).values(activity);
        console.log(`✓ Added activity: ${activity.name} (${activity.activity_type})`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠ Activity already exists: ${activity.name}`);
        } else {
          throw error;
        }
      }
    }

    console.log("\n✅ Successfully seeded all default activities!");
    console.log(`Total In-Situ activities: ${defaultActivities.filter(a => a.activity_type === 'insitu').length}`);
    console.log(`Total Ex-Situ activities: ${defaultActivities.filter(a => a.activity_type === 'exsitu').length}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding activities:", error);
    process.exit(1);
  }
}

seedActivities();
