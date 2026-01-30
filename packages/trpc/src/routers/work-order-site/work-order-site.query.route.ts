import { eq } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { publicProcedure } from "../../core";
import { handleQuery } from "../../helper/typed-handler";
import { z } from "zod";

// Define schemas locally
const getWorkOrderSiteDetailsSchema = z.object({
  work_order_site_id: z.number().positive(),
});

const getSiteActivitiesSchema = z.object({
  work_order_site_id: z.number().positive(),
});

const { workOrderSiteTable, siteTable, workOrderTable, siteActivityTable } =
  schema;

export const workOrderSiteQueryRouter = router({
  // Get work order site details with all information
  getWorkOrderSiteDetails: publicProcedure
    .input(getWorkOrderSiteDetailsSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { work_order_site_id } = input;

        // Get work order site with joined data
        const woSites = await ctx.db
          .select({
            id: workOrderSiteTable.id,
            work_order_id: workOrderSiteTable.work_order_id,
            client_id: workOrderSiteTable.client_id,
            site_id: workOrderSiteTable.site_id,
            date: workOrderSiteTable.date,
            end_date: workOrderSiteTable.end_date,
            process_type: workOrderSiteTable.process_type,
            job_number: workOrderSiteTable.job_number,
            area: workOrderSiteTable.area,
            installation_type: workOrderSiteTable.installation_type,
            joint_estimate_number: workOrderSiteTable.joint_estimate_number,
            land_owner_name: workOrderSiteTable.land_owner_name,
            remarks: workOrderSiteTable.remarks,
            status: workOrderSiteTable.status,
            created_at: workOrderSiteTable.created_at,
            updated_at: workOrderSiteTable.updated_at,
            // Site info
            site_name: siteTable.name,
            site_address: siteTable.address,
            site_city: siteTable.city,
            site_state: siteTable.state,
            site_pincode: siteTable.pincode,
            // Work order info
            wo_code: workOrderTable.code,
            wo_title: workOrderTable.title,
            wo_process_type: workOrderTable.process_type,
          })
          .from(workOrderSiteTable)
          .leftJoin(siteTable, eq(workOrderSiteTable.site_id, siteTable.id))
          .leftJoin(
            workOrderTable,
            eq(workOrderSiteTable.work_order_id, workOrderTable.id),
          )
          .where(eq(workOrderSiteTable.id, work_order_site_id));

        if (woSites.length === 0) {
          return null;
        }

        const woSite = woSites[0]!;

        // Get activities for this site
        const activities = await ctx.db
          .select()
          .from(siteActivityTable)
          .where(eq(siteActivityTable.work_order_site_id, work_order_site_id));

        return {
          id: woSite.id,
          work_order_id: woSite.work_order_id,
          client_id: woSite.client_id,
          site_id: woSite.site_id,
          date: woSite.date,
          end_date: woSite.end_date,
          process_type: woSite.process_type,
          job_number: woSite.job_number,
          area: woSite.area,
          installation_type: woSite.installation_type,
          joint_estimate_number: woSite.joint_estimate_number,
          land_owner_name: woSite.land_owner_name,
          remarks: woSite.remarks,
          status: woSite.status,
          created_at: woSite.created_at,
          updated_at: woSite.updated_at,
          site: {
            id: woSite.site_id,
            name: woSite.site_name,
            address: woSite.site_address,
            city: woSite.site_city,
            state: woSite.site_state,
            pincode: woSite.site_pincode,
          },
          work_order: {
            id: woSite.work_order_id,
            code: woSite.wo_code,
            title: woSite.wo_title,
            process_type: woSite.wo_process_type,
          },
          activities,
        };
      }),
    ),

  // Get site activities for a work order site
  getSiteActivities: publicProcedure.input(getSiteActivitiesSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { work_order_site_id } = input;

      const activities = await ctx.db
        .select()
        .from(siteActivityTable)
        .where(eq(siteActivityTable.work_order_site_id, work_order_site_id));

      return activities;
    }),
  ),
});
