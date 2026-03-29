import { eq, desc, and, inArray } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { protectedProcedure } from "../../core";
import {
  assertCanAccessWorkOrder,
  assertCanAccessWorkOrderSite,
  getAccessScope,
} from "../../access-scope";
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
  userTable,
  siteActivityTable,
  workOrderSiteDocsTable,
  workOrderSiteOperatorUploadTable,
  scheduleOfRatesTable,
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
  /** All operator uploads across every site row for this work order (for office/staff WO view). */
  getOperatorUploadsByWorkOrder: protectedProcedure
    .input(z.object({ work_order_id: z.number().positive() }))
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { work_order_id } = input;

        try {
          const scope = await getAccessScope(
            ctx.db,
            Number(ctx.user!.sub),
            ctx.user!.role,
          );
          await assertCanAccessWorkOrder(ctx.db, scope, work_order_id);

          const uploads = await ctx.db
            .select({
              id: workOrderSiteOperatorUploadTable.id,
              work_order_site_id:
                workOrderSiteOperatorUploadTable.work_order_site_id,
              site_name: siteTable.name,
              description: workOrderSiteOperatorUploadTable.description,
              file_name: workOrderSiteOperatorUploadTable.file_name,
              document_url: workOrderSiteOperatorUploadTable.document_url,
              document_id: workOrderSiteOperatorUploadTable.document_id,
              created_at: workOrderSiteOperatorUploadTable.created_at,
              uploaded_by_name: userTable.name,
            })
            .from(workOrderSiteOperatorUploadTable)
            .innerJoin(
              workOrderSiteTable,
              eq(
                workOrderSiteOperatorUploadTable.work_order_site_id,
                workOrderSiteTable.id,
              ),
            )
            .innerJoin(siteTable, eq(workOrderSiteTable.site_id, siteTable.id))
            .innerJoin(
              userTable,
              eq(
                workOrderSiteOperatorUploadTable.uploaded_by_user_id,
                userTable.id,
              ),
            )
            .where(eq(workOrderSiteTable.work_order_id, work_order_id))
            .orderBy(desc(workOrderSiteOperatorUploadTable.created_at));

          return uploads;
        } catch (error) {
          throw fromDatabaseError(
            error,
            "Fetching operator uploads for work order",
          );
        }
      }),
    ),

  getOperatorUploads: protectedProcedure
    .input(
      z.object({
        work_order_site_id: z.number().positive(),
      }),
    )
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { work_order_site_id } = input;

        try {
          const scope = await getAccessScope(
            ctx.db,
            Number(ctx.user!.sub),
            ctx.user!.role,
          );
          await assertCanAccessWorkOrderSite(
            ctx.db,
            scope,
            work_order_site_id,
          );

          const uploads = await ctx.db
            .select({
              id: workOrderSiteOperatorUploadTable.id,
              work_order_site_id:
                workOrderSiteOperatorUploadTable.work_order_site_id,
              description: workOrderSiteOperatorUploadTable.description,
              file_name: workOrderSiteOperatorUploadTable.file_name,
              document_url: workOrderSiteOperatorUploadTable.document_url,
              document_id: workOrderSiteOperatorUploadTable.document_id,
              created_at: workOrderSiteOperatorUploadTable.created_at,
              uploaded_by_name: userTable.name,
            })
            .from(workOrderSiteOperatorUploadTable)
            .innerJoin(
              userTable,
              eq(
                workOrderSiteOperatorUploadTable.uploaded_by_user_id,
                userTable.id,
              ),
            )
            .where(
              eq(
                workOrderSiteOperatorUploadTable.work_order_site_id,
                work_order_site_id,
              ),
            )
            .orderBy(desc(workOrderSiteOperatorUploadTable.created_at));

          return uploads;
        } catch (error) {
          throw fromDatabaseError(error, "Fetching operator uploads");
        }
      }),
    ),

  // Get measurement sheets for a work order site
  getMeasurementSheets: protectedProcedure
    .input(
      z.object({
        work_order_site_id: z.number().positive(),
      }),
    )
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { work_order_site_id } = input;

        try {
          const scope = await getAccessScope(
            ctx.db,
            Number(ctx.user!.sub),
            ctx.user!.role,
          );
          await assertCanAccessWorkOrderSite(ctx.db, scope, work_order_site_id);

          const sheets = await ctx.db
            .select()
            .from(workOrderSiteDocsTable)
            .where(
              and(
                eq(
                  workOrderSiteDocsTable.work_order_site_id,
                  work_order_site_id,
                ),
                eq(workOrderSiteDocsTable.type, "measurement_sheet"),
              ),
            );

          return sheets;
        } catch (error) {
          throw fromDatabaseError(error, "Fetching measurement sheets");
        }
      }),
    ),

  // Get work order site details with all information
  getWorkOrderSiteDetails: protectedProcedure
    .input(getWorkOrderSiteDetailsSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { work_order_site_id } = input;

        try {
          const scope = await getAccessScope(
            ctx.db,
            Number(ctx.user!.sub),
            ctx.user!.role,
          );
          await assertCanAccessWorkOrderSite(ctx.db, scope, work_order_site_id);

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
  getSiteActivities: protectedProcedure.input(getSiteActivitiesSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { work_order_site_id } = input;

      try {
        const scope = await getAccessScope(
          ctx.db,
          Number(ctx.user!.sub),
          ctx.user!.role,
        );
        await assertCanAccessWorkOrderSite(ctx.db, scope, work_order_site_id);

        const activities = await ctx.db
          .select({
            id: siteActivityTable.id,
            work_order_site_id: siteActivityTable.work_order_site_id,
            schedule_of_rates_id: siteActivityTable.schedule_of_rates_id,
            activity: siteActivityTable.activity,
            unit: siteActivityTable.unit,
            created_at: siteActivityTable.created_at,
            updated_at: siteActivityTable.updated_at,
            rate: scheduleOfRatesTable.unit_rate_inc_gst,
            sor_estimated_quantity: scheduleOfRatesTable.estimated_quantity,
          })
          .from(siteActivityTable)
          .leftJoin(
            scheduleOfRatesTable,
            eq(siteActivityTable.schedule_of_rates_id, scheduleOfRatesTable.id),
          )
          .where(eq(siteActivityTable.work_order_site_id, work_order_site_id));

        if (activities.length === 0) return [];

        const sorIds = activities
          .map((a: any) => a.schedule_of_rates_id)
          .filter(Boolean) as number[];

        // Get all site activity IDs for these SOR IDs
        const allSiteActivities = await ctx.db
          .select({
            id: siteActivityTable.id,
            schedule_of_rates_id: siteActivityTable.schedule_of_rates_id,
          })
          .from(siteActivityTable)
          .where(inArray(siteActivityTable.schedule_of_rates_id, sorIds));

        const saIds = allSiteActivities.map((sa: any) => sa.id);

        if (saIds.length > 0) {
          // Fetch all possible work order sites related to the same work order
          const relatedSites = await ctx.db
            .select({
              id: workOrderSiteTable.id,
            })
            .from(workOrderSiteTable)
            .where(
              inArray(
                workOrderSiteTable.work_order_id,
                ctx.db
                  .select({ id: workOrderTable.id })
                  .from(workOrderTable)
                  .where(
                    inArray(
                      workOrderTable.id,
                      ctx.db
                        .select({ id: scheduleOfRatesTable.work_order_id })
                        .from(scheduleOfRatesTable)
                        .where(inArray(scheduleOfRatesTable.id, sorIds)),
                    ),
                  ),
              ),
            );

          const siteIds = relatedSites.map((s: any) => s.id);

          // Fetch quantities from all child tables using site IDs
          const [q1, q2, q3, q4, q5, q6] = await Promise.all([
            ctx.db
              .select()
              .from(cleaningUpSoilAreaTable)
              .where(
                inArray(cleaningUpSoilAreaTable.work_order_site_id, siteIds),
              ),
            ctx.db
              .select()
              .from(liftingRecoveryOilSlushTable)
              .where(
                inArray(
                  liftingRecoveryOilSlushTable.work_order_site_id,
                  siteIds,
                ),
              ),
            ctx.db
              .select()
              .from(excavationContSoilTable)
              .where(
                inArray(excavationContSoilTable.work_order_site_id, siteIds),
              ),
            ctx.db
              .select()
              .from(transportationContSoilTable)
              .where(
                inArray(
                  transportationContSoilTable.work_order_site_id,
                  siteIds,
                ),
              ),
            ctx.db
              .select()
              .from(refillingExcavatedContSoilTable)
              .where(
                inArray(
                  refillingExcavatedContSoilTable.work_order_site_id,
                  siteIds,
                ),
              ),
            ctx.db
              .select()
              .from(bioremediationContSoilTable)
              .where(
                inArray(
                  bioremediationContSoilTable.work_order_site_id,
                  siteIds,
                ),
              ),
          ]);

          const entriesByTable = [
            {
              entries: q1,
              name: "clean_soil_area",
            },
            {
              entries: q2,
              name: "lifting_oily_slush_or_recovery_of_oil",
            },
            {
              entries: q3,
              name: "excavation_oil_contaminated_soil",
            },
            {
              entries: q4,
              name: "transportation_contaminated_soil",
            },
            {
              entries: q5,
              name: "refilling_excavated_oil_contaminated_soil_land",
            },
            {
              entries: q6,
              name: "bioremediation_oil_contaminated_soil",
            },
          ];

          // Also fetch oil zapping entries for all sites (source of truth for bioremediation qty)
          const allOilZappingEntries = await ctx.db
            .select()
            .from(bioOilZappingTable)
            .where(inArray(bioOilZappingTable.work_order_site_id, siteIds));

          // Build map: work_order_site_id -> total oil zapping qty for that site
          const oilZappingBySite = new Map<number, number>();
          for (const entry of allOilZappingEntries) {
            const current = oilZappingBySite.get(entry.work_order_site_id) || 0;
            oilZappingBySite.set(
              entry.work_order_site_id,
              current + parseFloat(entry.estimated_quantity || "0"),
            );
          }

          // For each SOR, sum up best quantity from each of its site_activity_items
          const utilizationMap = new Map<number, number>();
          const completionUtilizationMap = new Map<number, number>();

          for (const sorId of sorIds) {
            let totalUsed = 0;
            let totalCompletion = 0;
            const relatedSaEntries = await ctx.db
              .select()
              .from(siteActivityTable)
              .where(eq(siteActivityTable.schedule_of_rates_id, sorId));

            for (const sa of relatedSaEntries) {
              const isBioremActivity =
                sa.activity === "bioremediation_oil_contaminated_soil";

              if (isBioremActivity) {
                // For bioremediation totalUsed, use oil zapping totals as the best estimate
                const siteOilZappingQty =
                  oilZappingBySite.get(sa.work_order_site_id) || 0;
                totalUsed += siteOilZappingQty;

                // For totalCompletion, use actual completion phase entries from bioremediationContSoilTable
                const bioremEntries = entriesByTable
                  .find((t) => t.name === "bioremediation_oil_contaminated_soil")
                  ?.entries.filter(
                    (e: any) =>
                      e.work_order_site_id === sa.work_order_site_id &&
                      e.type === "completion",
                  ) || [];
                const bioremCompletionQty = bioremEntries.reduce(
                  (sum: number, e: any) =>
                    sum + parseFloat(e.estimated_quantity || "0"),
                  0,
                );
                totalCompletion += bioremCompletionQty;
                continue;
              }

              // Find entries for this specific site activity record by sa.id OR (site + name)
              const saEntries: any[] = [];
              for (const table of entriesByTable) {
                const matched = table.entries.filter(
                  (e: any) =>
                    e.site_activity_id === sa.id ||
                    (e.work_order_site_id === sa.work_order_site_id &&
                      table.name === sa.activity),
                );
                saEntries.push(...matched);
              }

              if (saEntries.length === 0) continue;

              const completion = saEntries.find((e: any) => e.type === "completion");
              const estimate = saEntries.find(
                (e: any) => e.type === "estimate_sub-wo",
              );

              const bestQty = parseFloat(
                (completion || estimate)?.estimated_quantity || "0",
              );
              totalUsed += bestQty;

              const completionQty = parseFloat(
                completion?.estimated_quantity || "0",
              );
              totalCompletion += completionQty;
            }
            utilizationMap.set(sorId, totalUsed);
            completionUtilizationMap.set(sorId, totalCompletion);
          }

          return activities.map((a: any) => ({
            ...a,
            total_used_quantity: (
              utilizationMap.get(a.schedule_of_rates_id!) || 0
            ).toFixed(2),
            total_completion_quantity: (
              completionUtilizationMap.get(a.schedule_of_rates_id!) || 0
            ).toFixed(2),
          }));
        }

        return activities.map((a: any) => ({
          ...a,
          total_used_quantity: "0.00",
          total_completion_quantity: "0.00",
        }));
      } catch (error) {
        throw fromDatabaseError(error, "Fetching site activities");
      }
    }),
  ),

  // Get site documents for a work order site
  getSiteDocuments: protectedProcedure.input(getSiteDocumentsSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { work_order_site_id } = input;

      try {
        const scope = await getAccessScope(
          ctx.db,
          Number(ctx.user!.sub),
          ctx.user!.role,
        );
        await assertCanAccessWorkOrderSite(ctx.db, scope, work_order_site_id);

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
  getBioremediationData: protectedProcedure
    .input(
      z.object({
        work_order_site_id: z.number().positive(),
      }),
    )
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { work_order_site_id } = input;

        try {
          const scope = await getAccessScope(
            ctx.db,
            Number(ctx.user!.sub),
            ctx.user!.role,
          );
          await assertCanAccessWorkOrderSite(ctx.db, scope, work_order_site_id);

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
            .where(eq(bioSampleTable.work_order_site_id, work_order_site_id))
            .orderBy(desc(bioSampleTable.id));

          // Get oil zapping entries
          const oilZapping = await ctx.db
            .select()
            .from(bioOilZappingTable)
            .where(
              eq(bioOilZappingTable.work_order_site_id, work_order_site_id),
            )
            .orderBy(desc(bioOilZappingTable.id));

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
  getRestorationData: protectedProcedure
    .input(
      z.object({
        work_order_site_id: z.number().positive(),
      }),
    )
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { work_order_site_id } = input;

        try {
          const scope = await getAccessScope(
            ctx.db,
            Number(ctx.user!.sub),
            ctx.user!.role,
          );
          await assertCanAccessWorkOrderSite(ctx.db, scope, work_order_site_id);

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
