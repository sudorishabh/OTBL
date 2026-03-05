import { eq, and } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { publicProcedure } from "../../core";
import { handleMutation } from "../../helper/typed-handler";
import { z } from "zod";
import { fromDatabaseError } from "../../errors";
import { constants } from "@pkg/utils";
import {
  getSharePointConfig,
  isSharePointConfigured,
} from "../sharepoint/sharepoint.config";
import { createSharePointService } from "../sharepoint/sharepoint.service";

// Define schemas locally
const createSiteActivitySchema = z.object({
  work_order_site_id: z.number().positive(),
  activity: z.string().min(1).max(255),
});

const updateSiteActivitySchema = z.object({
  id: z.number().positive(),
  activity: z.string().min(1).max(255).optional(),
});

const deleteSiteActivitySchema = z.object({
  id: z.number().positive(),
});

// Schema for site documents
const createSiteDocumentSchema = z.object({
  work_order_site_id: z.number().positive(),
  document_url: z.string().min(1).max(255),
  document_id: z.string().min(1).max(255).optional(),
  type: z.enum([
    "sub_wo",
    "estimate",
    "completion",
    "measurement_sheet",
    "bills",
    "completion_certificate",
  ]),
});

const deleteSiteDocumentSchema = z.object({
  id: z.number().positive(),
});

// Phase Schemas
const saveActivityDataSchema = z.object({
  estimated_quantity: z.string(),
  amount: z.string().optional(),
  transportation_km: z.string().optional(),
});

type SaveActivityData = z.infer<typeof saveActivityDataSchema>;

const createBioSampleSchema = z.object({
  work_order_site_id: z.number().positive(),
  tph_document_url: z.string(),
  tph_value: z.string(),
  application_month: z.string(),
});

const createOilZappingSchema = z.object({
  work_order_site_id: z.number().positive(),
  document_url: z.string().min(1, "Document URL is required"),
  estimated_quantity: z.string().optional(),
});

const deleteRecordSchema = z.object({
  id: z.number().positive(),
});

const saveBioremediationPhaseSchema = z.object({
  work_order_site_id: z.number().positive(),
  phase: z.enum(["estimate_sub-wo", "completion"]),
  contaminated_soil: saveActivityDataSchema.optional(),
  // Keeping these optional arrays for backward compatibility or bulk updates if needed,
  // though we are moving to granular mutations for these.
  bio_samples: z
    .array(
      z.object({
        tph_document_url: z.string(),
        tph_value: z.string(),
        application_month: z.string(),
      }),
    )
    .optional(),
  oil_zapping: z
    .array(
      z.object({
        document_url: z.string(),
        estimated_quantity: z.string().optional(),
      }),
    )
    .optional(),
});

const saveRestorationPhaseSchema = z.object({
  work_order_site_id: z.number().positive(),
  phase: z.enum(["estimate_sub-wo", "completion"]),
  document_url: z.string().optional(),
  sub_wo_document_url: z.string().optional(),
  estimate_document_url: z.string().optional(),
  clean_soil_area: saveActivityDataSchema.optional(),
  lifting_oil_slush: saveActivityDataSchema.optional(),
  excav_cont_soil: saveActivityDataSchema.optional(),
  trans_cont_soil: saveActivityDataSchema.optional(),
  refill_excav_soil: saveActivityDataSchema.optional(),
});

const {
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

export const workOrderSiteMutationRouter = router({
  // Create a measurement sheet
  createMeasurementSheet: publicProcedure
    .input(
      z.object({
        work_order_site_id: z.number().positive(),
        document_url: z.string().min(1).max(255),
        document_id: z.string().min(1).max(255).optional(),
      }),
    )
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const { work_order_site_id, document_url, document_id } = input;

        try {
          const [result] = await ctx.db.insert(workOrderSiteDocsTable).values({
            work_order_site_id,
            document_url,
            document_id,
            type: "measurement_sheet",
          });

          return {
            success: true,
            id: Number(result.insertId),
            message: "Measurement sheet added successfully",
          };
        } catch (error) {
          throw fromDatabaseError(error, "Creating measurement sheet");
        }
      }),
    ),

  // Delete a measurement sheet
  deleteMeasurementSheet: publicProcedure
    .input(
      z.object({
        id: z.number().positive(),
      }),
    )
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        try {
          // 1. Get the document to find the document_id
          const docs = await ctx.db
            .select()
            .from(workOrderSiteDocsTable)
            .where(eq(workOrderSiteDocsTable.id, input.id))
            .limit(1);

          const doc = docs[0];

          if (doc && doc.document_id && isSharePointConfigured(ctx.appEnv)) {
            try {
              const config = getSharePointConfig(ctx.appEnv);
              const service = createSharePointService(config);
              await service.deleteFile(doc.document_id);
            } catch (spError) {
              console.error("Failed to delete from SharePoint:", spError);
              // We continue with DB deletion even if SP deletion fails
            }
          }

          await ctx.db
            .delete(workOrderSiteDocsTable)
            .where(eq(workOrderSiteDocsTable.id, input.id));

          return {
            success: true,
            message: "Measurement sheet deleted successfully",
          };
        } catch (error) {
          throw fromDatabaseError(error, "Deleting measurement sheet");
        }
      }),
    ),

  // Create a site activity
  // createSiteActivity  : publicProcedure.input(createSiteActivitySchema).mutation(
  //     handleMutation(async ({ input, ctx }) => {
  //       const { work_order_site_id, activity } = input;

  //       try {
  //         const [result] = await ctx.db.insert(siteActivityTable).values({
  //           work_order_site_id,
  //           activity,
  //           unit,
  //         });

  //         return {
  //           success: true,
  //           id: Number(result.insertId),
  //           message: "Activity created successfully",
  //         };
  //       } catch (error) {
  //         throw fromDatabaseError(error, "Creating site activity");
  //       }
  //     }),
  //   ),

  // Update a site activity
  updateSiteActivity: publicProcedure.input(updateSiteActivitySchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      try {
        await ctx.db
          .update(siteActivityTable)
          .set(updateData)
          .where(eq(siteActivityTable.id, id));

        return {
          success: true,
          message: "Activity updated successfully",
        };
      } catch (error) {
        throw fromDatabaseError(error, "Updating site activity");
      }
    }),
  ),

  // Delete a site activity
  deleteSiteActivity: publicProcedure.input(deleteSiteActivitySchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      try {
        await ctx.db
          .delete(siteActivityTable)
          .where(eq(siteActivityTable.id, input.id));

        return {
          success: true,
          message: "Activity deleted successfully",
        };
      } catch (error) {
        throw fromDatabaseError(error, "Deleting site activity");
      }
    }),
  ),

  // Create a site document
  createSiteDocument: publicProcedure.input(createSiteDocumentSchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      const { work_order_site_id, document_url, document_id, type } = input;

      try {
        const [result] = await ctx.db.insert(workOrderSiteDocsTable).values({
          work_order_site_id,
          document_url,
          document_id,
          type: type as any,
        } as any);

        return {
          success: true,
          id: Number(result.insertId),
          message: "Document uploaded successfully",
        };
      } catch (error) {
        throw fromDatabaseError(error, "Creating site document");
      }
    }),
  ),

  // Delete a site document
  deleteSiteDocument: publicProcedure.input(deleteSiteDocumentSchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      try {
        // 1. Get the document to find the document_id
        const docs = await ctx.db
          .select()
          .from(workOrderSiteDocsTable)
          .where(eq(workOrderSiteDocsTable.id, input.id))
          .limit(1);

        const doc = docs[0];

        if (doc && doc.document_id && isSharePointConfigured(ctx.appEnv)) {
          try {
            const config = getSharePointConfig(ctx.appEnv);
            const service = createSharePointService(config);
            await service.deleteFile(doc.document_id);
          } catch (spError) {
            console.error("Failed to delete from SharePoint:", spError);
            // We continue with DB deletion even if SP deletion fails
          }
        }

        await ctx.db
          .delete(workOrderSiteDocsTable)
          .where(eq(workOrderSiteDocsTable.id, input.id));

        return {
          success: true,
          message: "Document deleted successfully",
        };
      } catch (error) {
        throw fromDatabaseError(error, "Deleting site document");
      }
    }),
  ),

  // =====================================
  // NEW PHASE BASED MUTATIONS
  // =====================================

  saveContaminatedSoil: publicProcedure
    .input(
      z.object({
        work_order_site_id: z.number().positive(),
        phase: z.enum(["sub_wo", "estimate", "completion", "estimate_sub-wo"]),
        document_url: z.string().optional(),
        sub_wo_document_url: z.string().optional(),
        estimate_document_url: z.string().optional(),
        data: saveActivityDataSchema,
      }),
    )
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const {
          work_order_site_id,
          phase,
          data,
          document_url,
          sub_wo_document_url,
          estimate_document_url,
        } = input;
        try {
          const upsertDoc = async (url: string, type: string) => {
            const existingDoc = await ctx.db
              .select()
              .from(workOrderSiteDocsTable)
              .where(
                and(
                  eq(
                    workOrderSiteDocsTable.work_order_site_id,
                    work_order_site_id,
                  ),
                  eq(workOrderSiteDocsTable.type, type as any),
                ),
              );

            if (existingDoc.length > 0) {
              await ctx.db
                .update(workOrderSiteDocsTable)
                .set({ document_url: url })
                .where(eq(workOrderSiteDocsTable.id, existingDoc[0]!.id));
            } else {
              await ctx.db.insert(workOrderSiteDocsTable).values({
                work_order_site_id,
                type: type as any,
                document_url: url,
              });
            }
          };

          if (document_url && phase !== "estimate_sub-wo") {
            await upsertDoc(document_url, phase);
          }
          if (sub_wo_document_url) {
            await upsertDoc(sub_wo_document_url, "sub_wo");
          }
          if (estimate_document_url) {
            await upsertDoc(estimate_document_url, "estimate");
          }

          const activityType =
            phase === "completion" ? "completion" : "estimate_sub-wo";

          // Fetch site activity ID for bioremediation
          const siteActivities = await ctx.db
            .select()
            .from(siteActivityTable)
            .where(
              and(
                eq(siteActivityTable.work_order_site_id, work_order_site_id),
                eq(
                  siteActivityTable.activity,
                  constants.WO_ACTIVITIES.BIOREMEDIATION_OIL_CONTAMINATED_SOIL,
                ),
              ),
            );

          const siteActivityId = siteActivities[0]?.id;

          const existing = await ctx.db
            .select()
            .from(bioremediationContSoilTable)
            .where(
              and(
                eq(
                  bioremediationContSoilTable.work_order_site_id,
                  work_order_site_id,
                ),
                eq(bioremediationContSoilTable.type, activityType as any),
              ),
            );

          if (existing.length > 0) {
            await ctx.db
              .update(bioremediationContSoilTable)
              .set({ ...data, site_activity_id: siteActivityId })
              .where(eq(bioremediationContSoilTable.id, existing[0]!.id));
          } else {
            await ctx.db.insert(bioremediationContSoilTable).values({
              work_order_site_id,
              site_activity_id: siteActivityId,
              type: activityType as any,
              ...data,
            } as any);
          }
          return { success: true, message: "Contaminated Soil saved" };
        } catch (error) {
          throw fromDatabaseError(error, "Saving contaminated soil");
        }
      }),
    ),

  createBioSample: publicProcedure.input(createBioSampleSchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      try {
        const [result] = await ctx.db.insert(bioSampleTable).values({
          work_order_site_id: input.work_order_site_id,
          tph_document_url: input.tph_document_url,
          tph_value: input.tph_value,
          application_month: input.application_month,
        });
        return {
          success: true,
          message: "Bio sample added successfully",
          id: Number(result.insertId),
        };
      } catch (error) {
        throw fromDatabaseError(error, "Creating bio sample");
      }
    }),
  ),

  deleteBioSample: publicProcedure.input(deleteRecordSchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      try {
        await ctx.db
          .delete(bioSampleTable)
          .where(eq(bioSampleTable.id, input.id));
        return { success: true, message: "Bio sample deleted successfully" };
      } catch (error) {
        throw fromDatabaseError(error, "Deleting bio sample");
      }
    }),
  ),

  createOilZapping: publicProcedure.input(createOilZappingSchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      try {
        const [result] = await ctx.db.insert(bioOilZappingTable).values({
          work_order_site_id: input.work_order_site_id,
          document_url: input.document_url,
          estimated_quantity: input.estimated_quantity,
        });
        return {
          success: true,
          message: "Oil zapping entry added successfully",
          id: Number(result.insertId),
        };
      } catch (error) {
        throw fromDatabaseError(error, "Creating oil zapping entry");
      }
    }),
  ),

  deleteOilZapping: publicProcedure.input(deleteRecordSchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      try {
        await ctx.db
          .delete(bioOilZappingTable)
          .where(eq(bioOilZappingTable.id, input.id));
        return {
          success: true,
          message: "Oil zapping entry deleted successfully",
        };
      } catch (error) {
        throw fromDatabaseError(error, "Deleting oil zapping entry");
      }
    }),
  ),

  // Keeping the bulk save for backward compatibility or if needed later,
  // but the UI will switch to granular mutations.
  saveBioSamples: publicProcedure
    .input(
      z.object({
        work_order_site_id: z.number().positive(),
        data: z.array(
          z.object({
            tph_document_url: z.string(),
            tph_value: z.string(),
            application_month: z.string(),
          }),
        ),
      }),
    )
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const { work_order_site_id, data } = input;
        try {
          await ctx.db.transaction(async (tx) => {
            await tx
              .delete(bioSampleTable)
              .where(eq(bioSampleTable.work_order_site_id, work_order_site_id));

            if (data.length > 0) {
              await tx.insert(bioSampleTable).values(
                data.map((sample) => ({
                  work_order_site_id,
                  ...sample,
                })),
              );
            }
          });
          return { success: true, message: "Bio Samples saved" };
        } catch (error) {
          throw fromDatabaseError(error, "Saving bio samples");
        }
      }),
    ),

  saveOilZapping: publicProcedure
    .input(
      z.object({
        work_order_site_id: z.number().positive(),
        data: z.array(
          z.object({
            document_url: z.string(),
            estimated_quantity: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const { work_order_site_id, data } = input;
        try {
          await ctx.db.transaction(async (tx) => {
            await tx
              .delete(bioOilZappingTable)
              .where(
                eq(bioOilZappingTable.work_order_site_id, work_order_site_id),
              );

            if (data.length > 0) {
              await tx.insert(bioOilZappingTable).values(
                data.map((item) => ({
                  work_order_site_id,
                  document_url: item.document_url,
                  estimated_quantity: item.estimated_quantity,
                })),
              );
            }
          });
          return { success: true, message: "Oil Zapping saved" };
        } catch (error) {
          throw fromDatabaseError(error, "Saving oil zapping");
        }
      }),
    ),

  saveRestorationPhase: publicProcedure
    .input(saveRestorationPhaseSchema)
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const {
          work_order_site_id,
          phase,
          document_url,
          sub_wo_document_url,
          estimate_document_url,
          clean_soil_area,
          lifting_oil_slush,
          excav_cont_soil,
          trans_cont_soil,
          refill_excav_soil,
        } = input;

        const upsertDoc = async (tx: any, url: string, type: string) => {
          const existingDoc = await tx
            .select()
            .from(workOrderSiteDocsTable)
            .where(
              and(
                eq(
                  workOrderSiteDocsTable.work_order_site_id,
                  work_order_site_id,
                ),
                eq(workOrderSiteDocsTable.type, type as any),
              ),
            );

          if (existingDoc.length > 0) {
            await tx
              .update(workOrderSiteDocsTable)
              .set({ document_url: url })
              .where(eq(workOrderSiteDocsTable.id, existingDoc[0]!.id));
          } else {
            await tx.insert(workOrderSiteDocsTable).values({
              work_order_site_id,
              type: type as any,
              document_url: url,
            });
          }
        };

        const upsertActivity = async (
          tx: any,
          table: any,
          data: SaveActivityData | undefined,
          activityName: string,
        ) => {
          if (!data) return;

          // Find the site_activity_id for this activity
          const sa = await tx
            .select()
            .from(siteActivityTable)
            .where(
              and(
                eq(siteActivityTable.work_order_site_id, work_order_site_id),
                eq(siteActivityTable.activity, activityName),
              ),
            );

          const siteActivityId = sa[0]?.id;

          const activityType =
            phase === "completion" ? "completion" : "estimate_sub-wo";

          const existing = await tx
            .select()
            .from(table)
            .where(
              and(
                eq(table.work_order_site_id, work_order_site_id),
                eq(table.type, activityType),
              ),
            );

          if (existing.length > 0) {
            await tx
              .update(table)
              .set({
                estimated_quantity: data.estimated_quantity,
                amount: data.amount,
                transportation_km: data.transportation_km,
                site_activity_id: siteActivityId,
              })
              .where(eq(table.id, existing[0]!.id));
          } else {
            await tx.insert(table).values({
              work_order_site_id,
              site_activity_id: siteActivityId,
              type: activityType,
              estimated_quantity: data.estimated_quantity,
              amount: data.amount,
              transportation_km: data.transportation_km,
            });
          }
        };

        try {
          await ctx.db.transaction(async (tx) => {
            if (document_url && phase !== "estimate_sub-wo") {
              await upsertDoc(tx, document_url, phase);
            }
            if (sub_wo_document_url) {
              await upsertDoc(tx, sub_wo_document_url, "sub_wo");
            }
            if (estimate_document_url) {
              await upsertDoc(tx, estimate_document_url, "estimate");
            }

            await upsertActivity(
              tx,
              cleaningUpSoilAreaTable,
              clean_soil_area,
              "clean_soil_area",
            );
            await upsertActivity(
              tx,
              liftingRecoveryOilSlushTable,
              lifting_oil_slush,
              "lifting_oily_slush_or_recovery_of_oil",
            );
            await upsertActivity(
              tx,
              excavationContSoilTable,
              excav_cont_soil,
              "excavation_oil_contaminated_soil",
            );
            await upsertActivity(
              tx,
              transportationContSoilTable,
              trans_cont_soil,
              "transportation_contaminated_soil",
            );
            await upsertActivity(
              tx,
              refillingExcavatedContSoilTable,
              refill_excav_soil,
              "refilling_excavated_oil_contaminated_soil_land",
            );
          });

          return {
            success: true,
            message: "Restoration phase data saved successfully",
          };
        } catch (error) {
          throw fromDatabaseError(error, "Saving restoration phase data");
        }
      }),
    ),
});
