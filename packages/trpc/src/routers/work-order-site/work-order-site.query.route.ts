import { eq } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { publicProcedure } from "../../core";
import { handleQuery } from "../../helper/typed-handler";
import { z } from "zod";
import { fromDatabaseError } from "../../errors";

// Define schemas locally
const getWorkOrderSiteDetailsSchema = z.object({
  work_order_site_id: z.number().positive(),
});

const getSiteActivitiesSchema = z.object({
  work_order_site_id: z.number().positive(),
});

const getSiteDocumentsSchema = z.object({
  work_order_site_id: z.number().positive(),
});

const {
  workOrderSiteTable,
  siteTable,
  workOrderTable,
  siteActivityTable,
  workOrderSiteDocsTable,
  bioremediationContSoilTable,
  bioSampleTable,
  bioOilZappingTable,
  cleaningUpSoilAreaTable,
  liftingRecoveryOilSlushTable,
  excavationContSoilTable,
  transportationContSoilTable,
  refillingExcavatedContSoilTable,
} = schema;

export const workOrderSiteQueryRouter = router({
  // Get work order site details with all information
  getWorkOrderSiteDetails: publicProcedure
    .input(getWorkOrderSiteDetailsSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { work_order_site_id } = input;

        try {
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
            .where(
              eq(siteActivityTable.work_order_site_id, work_order_site_id),
            );

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
        } catch (error) {
          throw fromDatabaseError(error, "Fetching work order site details");
        }
      }),
    ),

  // Get site activities for a work order site
  getSiteActivities: publicProcedure.input(getSiteActivitiesSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { work_order_site_id } = input;

      try {
        const activities = await ctx.db
          .select()
          .from(siteActivityTable)
          .where(eq(siteActivityTable.work_order_site_id, work_order_site_id));

        return activities;
      } catch (error) {
        throw fromDatabaseError(error, "Fetching site activities");
      }
    }),
  ),

  // Get site documents for a work order site
  getSiteDocuments: publicProcedure.input(getSiteDocumentsSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { work_order_site_id } = input;

      try {
        const documents = await ctx.db
          .select()
          .from(workOrderSiteDocsTable)
          .where(
            eq(workOrderSiteDocsTable.work_order_site_id, work_order_site_id),
          );

        return documents;
      } catch (error) {
        throw fromDatabaseError(error, "Fetching site documents");
      }
    }),
  ),

  // Get bioremediation data for a work order site
  getBioremediationData: publicProcedure
    .input(
      z.object({
        work_order_site_id: z.number().positive(),
      }),
    )
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { work_order_site_id } = input;

        try {
          // Get contaminated soil entries
          const contaminatedSoil = await ctx.db
            .select()
            .from(bioremediationContSoilTable)
            .where(
              eq(
                bioremediationContSoilTable.work_order_site_id,
                work_order_site_id,
              ),
            );

          // Get bio samples
          const bioSamples = await ctx.db
            .select()
            .from(bioSampleTable)
            .where(eq(bioSampleTable.work_order_site_id, work_order_site_id));

          // Get oil zapping entries
          const oilZapping = await ctx.db
            .select()
            .from(bioOilZappingTable)
            .where(
              eq(bioOilZappingTable.work_order_site_id, work_order_site_id),
            );

          return {
            contaminatedSoil,
            bioSamples,
            oilZapping,
          };
        } catch (error) {
          throw fromDatabaseError(error, "Fetching bioremediation data");
        }
      }),
    ),

  // Get restoration data for a work order site
  getRestorationData: publicProcedure
    .input(
      z.object({
        work_order_site_id: z.number().positive(),
      }),
    )
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { work_order_site_id } = input;

        try {
          const cleaningUpSoilArea = await ctx.db
            .select()
            .from(cleaningUpSoilAreaTable)
            .where(
              eq(
                cleaningUpSoilAreaTable.work_order_site_id,
                work_order_site_id,
              ),
            );

          const liftingRecoveryOilSlush = await ctx.db
            .select()
            .from(liftingRecoveryOilSlushTable)
            .where(
              eq(
                liftingRecoveryOilSlushTable.work_order_site_id,
                work_order_site_id,
              ),
            );

          const excavationContSoil = await ctx.db
            .select()
            .from(excavationContSoilTable)
            .where(
              eq(
                excavationContSoilTable.work_order_site_id,
                work_order_site_id,
              ),
            );

          const transportationContSoil = await ctx.db
            .select()
            .from(transportationContSoilTable)
            .where(
              eq(
                transportationContSoilTable.work_order_site_id,
                work_order_site_id,
              ),
            );

          const refillingExcavatedContSoil = await ctx.db
            .select()
            .from(refillingExcavatedContSoilTable)
            .where(
              eq(
                refillingExcavatedContSoilTable.work_order_site_id,
                work_order_site_id,
              ),
            );

          return {
            cleaningUpSoilArea,
            liftingRecoveryOilSlush,
            excavationContSoil,
            transportationContSoil,
            refillingExcavatedContSoil,
          };
        } catch (error) {
          throw fromDatabaseError(error, "Fetching restoration data");
        }
      }),
    ),
});
