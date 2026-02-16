import { eq, and } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { publicProcedure } from "../../core";
import { handleMutation } from "../../helper/typed-handler";
import { z } from "zod";
import { fromDatabaseError } from "../../errors";

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
  type: z.enum(["sub_wo", "estimate", "expense", "measurement_sheet"]),
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

const saveBioremediationPhaseSchema = z.object({
  work_order_site_id: z.number().positive(),
  phase: z.enum(["sub_wo", "estimate", "expense"]),
  contaminated_soil: saveActivityDataSchema.optional(),
  bio_samples: z
    .array(
      z.object({
        tph_document_url: z.string(),
        tph_value: z.string(),
        estimated_quantity: z.string(),
      }),
    )
    .optional(),
  oil_zapping: z
    .array(
      z.object({
        estimated_quantity: z.string(),
        intended_quantity: z.string(),
      }),
    )
    .optional(),
});

const saveRestorationPhaseSchema = z.object({
  work_order_site_id: z.number().positive(),
  phase: z.enum(["sub_wo", "estimate", "expense"]),
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
  // Create a site activity
  createSiteActivity: publicProcedure.input(createSiteActivitySchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      const { work_order_site_id, activity } = input;

      try {
        const [result] = await ctx.db.insert(siteActivityTable).values({
          work_order_site_id,
          activity,
        });

        return {
          success: true,
          id: Number(result.insertId),
          message: "Activity created successfully",
        };
      } catch (error) {
        throw fromDatabaseError(error, "Creating site activity");
      }
    }),
  ),

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
      const { work_order_site_id, document_url, type } = input;

      try {
        const [result] = await ctx.db.insert(workOrderSiteDocsTable).values({
          work_order_site_id,
          document_url,
          type,
        });

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
        phase: z.enum(["sub_wo", "estimate", "expense"]),
        data: saveActivityDataSchema,
      }),
    )
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const { work_order_site_id, phase, data } = input;
        try {
          const existing = await ctx.db
            .select()
            .from(bioremediationContSoilTable)
            .where(
              and(
                eq(
                  bioremediationContSoilTable.work_order_site_id,
                  work_order_site_id,
                ),
                eq(bioremediationContSoilTable.type, phase),
              ),
            );

          if (existing.length > 0) {
            await ctx.db
              .update(bioremediationContSoilTable)
              .set(data)
              .where(eq(bioremediationContSoilTable.id, existing[0]!.id));
          } else {
            await ctx.db.insert(bioremediationContSoilTable).values({
              work_order_site_id,
              type: phase,
              ...data,
            });
          }
          return { success: true, message: "Contaminated Soil saved" };
        } catch (error) {
          throw fromDatabaseError(error, "Saving contaminated soil");
        }
      }),
    ),

  saveBioSamples: publicProcedure
    .input(
      z.object({
        work_order_site_id: z.number().positive(),
        data: z.array(
          z.object({
            tph_document_url: z.string(),
            tph_value: z.string(),
            estimated_quantity: z.string(),
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
            estimated_quantity: z.string(),
            intended_quantity: z.string(),
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
                  ...item,
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
          clean_soil_area,
          lifting_oil_slush,
          excav_cont_soil,
          trans_cont_soil,
          refill_excav_soil,
        } = input;

        const upsertActivity = async (
          table: any,
          data: SaveActivityData | undefined,
        ) => {
          if (!data) return;

          const existing = await ctx.db
            .select()
            .from(table)
            .where(
              and(
                eq(table.work_order_site_id, work_order_site_id),
                eq(table.type, phase),
              ),
            );

          if (existing.length > 0) {
            await ctx.db
              .update(table)
              .set({
                estimated_quantity: data.estimated_quantity,
                amount: data.amount,
                transportation_km: data.transportation_km,
              })
              .where(eq(table.id, existing[0]!.id));
          } else {
            await ctx.db.insert(table).values({
              work_order_site_id,
              type: phase,
              estimated_quantity: data.estimated_quantity,
              amount: data.amount,
              transportation_km: data.transportation_km,
            });
          }
        };

        try {
          await ctx.db.transaction(async (tx) => {
            await upsertActivity(cleaningUpSoilAreaTable, clean_soil_area);
            await upsertActivity(
              liftingRecoveryOilSlushTable,
              lifting_oil_slush,
            );
            await upsertActivity(excavationContSoilTable, excav_cont_soil);
            await upsertActivity(transportationContSoilTable, trans_cont_soil);
            await upsertActivity(
              refillingExcavatedContSoilTable,
              refill_excav_soil,
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
