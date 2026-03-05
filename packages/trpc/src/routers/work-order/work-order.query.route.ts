import { and, asc, count, desc, eq, like, or, inArray } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { publicProcedure } from "../../core";
import { workOrderSchemas } from "@pkg/schema";

const {
  getWorkOrderSchema,
  getWorkOrdersByOfficeSchema,
  getWorkOrdersByClientSchema,
  getAllWorkOrdersPaginatedSchema,
} = workOrderSchemas;

import { notFound, fromDatabaseError } from "../../errors";
import { handleQuery } from "../../helper/typed-handler";

const {
  workOrderTable,
  workOrderSiteTable,
  workOrderSiteDocsTable,
  clientTable,
  officeTable,
  siteTable,
  siteUserTable,
  userTable,
  scheduleOfRatesTable,
  cleaningUpSoilAreaTable,
  liftingRecoveryOilSlushTable,
  excavationContSoilTable,
  transportationContSoilTable,
  refillingExcavatedContSoilTable,
  bioremediationContSoilTable,
} = schema;

export const workOrderQueryRouter = router({
  // Get all work orders with pagination, search, and filters
  getAll: publicProcedure.input(getAllWorkOrdersPaginatedSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { page, limit, searchQuery, status, office_id, workOrderOrder } =
        input;

      let conditions: any = undefined;

      if (status && status !== "all") {
        conditions = and(
          conditions,
          eq(
            workOrderTable.status,
            status as "pending" | "completed" | "cancelled",
          ),
        );
      }

      if (office_id) {
        conditions = and(conditions, eq(workOrderTable.office_id, office_id));
      }

      if (searchQuery && searchQuery.trim() !== "") {
        conditions = and(
          conditions,
          or(
            like(workOrderTable.code, `%${searchQuery}%`),
            like(workOrderTable.title, `%${searchQuery}%`),
            like(workOrderTable.agreement_number, `%${searchQuery}%`),
            like(clientTable.name, `%${searchQuery}%`),
            like(officeTable.name, `%${searchQuery}%`),
          ),
        );
      }

      const orderBy =
        workOrderOrder === "asc"
          ? asc(workOrderTable.title)
          : workOrderOrder === "desc"
            ? desc(workOrderTable.title)
            : workOrderOrder === "latest"
              ? desc(workOrderTable.created_at)
              : asc(workOrderTable.created_at);

      try {
        const [totalResult] = await ctx.db
          .select({ count: count() })
          .from(workOrderTable)
          .leftJoin(clientTable, eq(workOrderTable.client_id, clientTable.id))
          .leftJoin(officeTable, eq(workOrderTable.office_id, officeTable.id))
          .where(conditions);

        const total = totalResult?.count ?? 0;

        if (total === 0) {
          return {
            workOrders: [],
            pagination: {
              page,
              limit,
              total,
              hasMore: false,
              totalPages: 0,
            },
          };
        }

        const offset = (page - 1) * limit;

        const workOrders = await ctx.db
          .select({
            id: workOrderTable.id,
            code: workOrderTable.code,
            title: workOrderTable.title,
            client_id: workOrderTable.client_id,
            client_name: clientTable.name,
            office_id: workOrderTable.office_id,
            office_name: officeTable.name,
            start_date: workOrderTable.start_date,
            end_date: workOrderTable.end_date,
            handing_over_date: workOrderTable.handing_over_date,
            agreement_number: workOrderTable.agreement_number,
            status: workOrderTable.status,
            created_at: workOrderTable.created_at,
            updated_at: workOrderTable.updated_at,
          })
          .from(workOrderTable)
          .leftJoin(clientTable, eq(workOrderTable.client_id, clientTable.id))
          .leftJoin(officeTable, eq(workOrderTable.office_id, officeTable.id))
          .where(conditions)
          .limit(limit)
          .offset(offset)
          .orderBy(orderBy);

        const totalPages = Math.ceil(total / limit);
        const hasMore = offset + workOrders.length < total;

        return {
          workOrders,
          pagination: {
            page,
            limit,
            total,
            hasMore,
            totalPages,
          },
        };
      } catch (error) {
        throw fromDatabaseError(error, "Fetching work orders");
      }
    }),
  ),

  // Get all work orders (no pagination)
  getWorkOrders: publicProcedure.query(
    handleQuery(async ({ ctx }) => {
      try {
        return await ctx.db
          .select({
            id: workOrderTable.id,
            code: workOrderTable.code,
            title: workOrderTable.title,
            client_id: workOrderTable.client_id,
            client_name: clientTable.name,
            office_id: workOrderTable.office_id,
            office_name: officeTable.name,
            start_date: workOrderTable.start_date,
            end_date: workOrderTable.end_date,
            handing_over_date: workOrderTable.handing_over_date,
            agreement_number: workOrderTable.agreement_number,
            description: workOrderTable.description,
            status: workOrderTable.status,
            cancellation_reason: workOrderTable.cancellation_reason,
            created_at: workOrderTable.created_at,
            updated_at: workOrderTable.updated_at,
          })
          .from(workOrderTable)
          .leftJoin(clientTable, eq(workOrderTable.client_id, clientTable.id))
          .leftJoin(officeTable, eq(workOrderTable.office_id, officeTable.id));
      } catch (error) {
        throw fromDatabaseError(error, "Fetching all work orders");
      }
    }),
  ),

  // Get a single work order by ID with full details
  getWorkOrder: publicProcedure.input(getWorkOrderSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { id } = input;
      try {
        const workOrders = await ctx.db
          .select({
            id: workOrderTable.id,
            code: workOrderTable.code,
            title: workOrderTable.title,
            client_id: workOrderTable.client_id,
            client_name: clientTable.name,
            client_email: clientTable.email,
            client_contact: clientTable.contact_number,
            office_id: workOrderTable.office_id,
            office_name: officeTable.name,
            start_date: workOrderTable.start_date,
            end_date: workOrderTable.end_date,
            handing_over_date: workOrderTable.handing_over_date,
            agreement_number: workOrderTable.agreement_number,
            rate_contract_number: workOrderTable.rate_contract_number,
            document_key: workOrderTable.document_key,
            process_type: workOrderTable.process_type,
            proposal_id: workOrderTable.proposal_id,
            description: workOrderTable.description,
            status: workOrderTable.status,
            cancellation_reason: workOrderTable.cancellation_reason,
            created_at: workOrderTable.created_at,
            updated_at: workOrderTable.updated_at,
          })
          .from(workOrderTable)
          .leftJoin(clientTable, eq(workOrderTable.client_id, clientTable.id))
          .leftJoin(officeTable, eq(workOrderTable.office_id, officeTable.id))
          .where(eq(workOrderTable.id, id));

        if (workOrders.length === 0) {
          throw notFound("Work order", id);
        }
        return workOrders[0];
      } catch (error) {
        // Re-throw AppError instances
        if (error && typeof error === "object" && "errorCode" in error) {
          throw error;
        }
        throw fromDatabaseError(error, "Fetching work order details");
      }
    }),
  ),

  getWorkOrderSites: publicProcedure.input(getWorkOrderSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { id, limit, page, search, sort_by, sort_order } = input;

      try {
        // Calculate total count
        const [totalResult] = await ctx.db
          .select({ count: count() })
          .from(workOrderSiteTable)
          .leftJoin(siteTable, eq(workOrderSiteTable.site_id, siteTable.id))
          .where(eq(workOrderSiteTable.work_order_id, id));

        const total = totalResult?.count ?? 0;

        if (total === 0) {
          return {
            sites: [],
            pagination: {
              page,
              limit,
              total,
              hasMore: false,
              totalPages: 0,
            },
          };
        }

        const offset = (page - 1) * limit;

        const woSites = await ctx.db
          .select({
            id: workOrderSiteTable.id,
            site_id: workOrderSiteTable.site_id,
            site_name: siteTable.name,
            site_address: siteTable.address,
            site_city: siteTable.city,
            site_state: siteTable.state,
            site_pincode: siteTable.pincode,
            end_date: workOrderSiteTable.end_date,
            status: workOrderSiteTable.status,
            created_at: workOrderSiteTable.created_at,
          })
          .from(workOrderSiteTable)
          .leftJoin(siteTable, eq(workOrderSiteTable.site_id, siteTable.id))
          .where(eq(workOrderSiteTable.work_order_id, id))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(workOrderSiteTable.created_at));

        // Fetch users and measurement sheets for the fetched sites
        const [sitesUsers, sitesSheets] = await Promise.all([
          Promise.all(
            woSites.map((woSite) =>
              ctx.db
                .select({
                  site_id: siteUserTable.site_id,
                  user_id: siteUserTable.user_id,
                  user_name: userTable.name,
                  user_email: userTable.email,
                  user_contact_number: userTable.contact_number,
                  user_role: userTable.role,
                })
                .from(siteUserTable)
                .leftJoin(userTable, eq(siteUserTable.user_id, userTable.id))
                .where(eq(siteUserTable.site_id, woSite.site_id!)),
            ),
          ),
          Promise.all(
            woSites.map((woSite) =>
              ctx.db
                .select()
                .from(workOrderSiteDocsTable)
                .where(
                  and(
                    eq(workOrderSiteDocsTable.work_order_site_id, woSite.id),
                    eq(workOrderSiteDocsTable.type, "measurement_sheet"),
                  ),
                ),
            ),
          ),
        ]);

        const sitesWithDetails = woSites.map((woSite, index) => ({
          ...woSite,
          users: sitesUsers[index],
          measurement_sheets: sitesSheets[index],
        }));

        const totalPages = Math.ceil(total / limit);
        const hasMore = offset + sitesWithDetails.length < total;

        return {
          sites: sitesWithDetails,
          pagination: {
            page,
            limit,
            total,
            hasMore,
            totalPages,
          },
        };
      } catch (error) {
        // Re-throw AppError instances
        if (error && typeof error === "object" && "errorCode" in error) {
          throw error;
        }
        throw fromDatabaseError(error, "Fetching work order sites");
      }
    }),
  ),

  // Get work orders by office ID
  getWorkOrdersByOffice: publicProcedure
    .input(getWorkOrdersByOfficeSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { office_id } = input;

        try {
          return await ctx.db
            .select({
              id: workOrderTable.id,
              code: workOrderTable.code,
              title: workOrderTable.title,
              client_id: workOrderTable.client_id,
              client_name: clientTable.name,
              office_id: workOrderTable.office_id,
              start_date: workOrderTable.start_date,
              end_date: workOrderTable.end_date,
              handing_over_date: workOrderTable.handing_over_date,
              agreement_number: workOrderTable.agreement_number,
              status: workOrderTable.status,
              created_at: workOrderTable.created_at,
              updated_at: workOrderTable.updated_at,
            })
            .from(workOrderTable)
            .leftJoin(clientTable, eq(workOrderTable.client_id, clientTable.id))
            .where(eq(workOrderTable.office_id, office_id))
            .orderBy(desc(workOrderTable.created_at));
        } catch (error) {
          throw fromDatabaseError(error, "Fetching work orders for office");
        }
      }),
    ),

  // Get work orders by client ID
  getWorkOrdersByClient: publicProcedure
    .input(getWorkOrdersByClientSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { client_id } = input;

        try {
          return await ctx.db
            .select({
              id: workOrderTable.id,
              code: workOrderTable.code,
              title: workOrderTable.title,
              client_id: workOrderTable.client_id,
              office_id: workOrderTable.office_id,
              office_name: officeTable.name,
              start_date: workOrderTable.start_date,
              end_date: workOrderTable.end_date,
              handing_over_date: workOrderTable.handing_over_date,
              agreement_number: workOrderTable.agreement_number,
              status: workOrderTable.status,
              created_at: workOrderTable.created_at,
              updated_at: workOrderTable.updated_at,
            })
            .from(workOrderTable)
            .leftJoin(officeTable, eq(workOrderTable.office_id, officeTable.id))
            .where(eq(workOrderTable.client_id, client_id));
        } catch (error) {
          throw fromDatabaseError(error, "Fetching work orders for client");
        }
      }),
    ),

  // Get work order with full details including sites
  getWorkOrderDetails: publicProcedure.input(getWorkOrderSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { id } = input;

      try {
        const workOrders = await ctx.db
          .select({
            id: workOrderTable.id,
            code: workOrderTable.code,
            title: workOrderTable.title,
            description: workOrderTable.description,
            client_id: workOrderTable.client_id,
            client_name: clientTable.name,
            office_id: workOrderTable.office_id,
            office_name: officeTable.name,
            start_date: workOrderTable.start_date,
            end_date: workOrderTable.end_date,
            handing_over_date: workOrderTable.handing_over_date,
            agreement_number: workOrderTable.agreement_number,
            rate_contract_number: workOrderTable.rate_contract_number,
            document_key: workOrderTable.document_key,
            process_type: workOrderTable.process_type,
            proposal_id: workOrderTable.proposal_id,
            status: workOrderTable.status,
            cancellation_reason: workOrderTable.cancellation_reason,
            created_at: workOrderTable.created_at,
            updated_at: workOrderTable.updated_at,
          })
          .from(workOrderTable)
          .leftJoin(clientTable, eq(workOrderTable.client_id, clientTable.id))
          .leftJoin(officeTable, eq(workOrderTable.office_id, officeTable.id))
          .where(eq(workOrderTable.id, id))
          .orderBy(desc(workOrderTable.created_at));

        if (workOrders.length === 0) {
          throw notFound("Work order", id, {
            userMessage:
              "The work order you're looking for doesn't exist or has been deleted.",
          });
        }

        const workOrder = workOrders[0];

        const woSites = await ctx.db
          .select({
            wo_site_id: workOrderSiteTable.id,
            site_id: siteTable.id,
            site_name: siteTable.name,
            site_address: siteTable.address,
            site_city: siteTable.city,
            site_state: siteTable.state,
            site_pincode: siteTable.pincode,
            end_date: workOrderSiteTable.end_date,
            status: workOrderSiteTable.status,
            created_at: workOrderSiteTable.created_at,
          })
          .from(workOrderSiteTable)
          .leftJoin(siteTable, eq(workOrderSiteTable.site_id, siteTable.id))
          .where(eq(workOrderSiteTable.work_order_id, id))
          .orderBy(desc(workOrderSiteTable.created_at));

        const [sitesUsers, sitesSheets] = await Promise.all([
          Promise.all(
            woSites.map((woSite: any) =>
              ctx.db
                .select({
                  site_id: siteUserTable.site_id,
                  user_id: siteUserTable.user_id,
                  user_name: userTable.name,
                  user_email: userTable.email,
                  user_contact_number: userTable.contact_number,
                  user_role: userTable.role,
                })
                .from(siteUserTable)
                .leftJoin(userTable, eq(siteUserTable.user_id, userTable.id))
                .where(eq(siteUserTable.site_id, woSite.site_id)),
            ),
          ),
          Promise.all(
            woSites.map((woSite: any) =>
              ctx.db
                .select()
                .from(workOrderSiteDocsTable)
                .where(
                  and(
                    eq(
                      workOrderSiteDocsTable.work_order_site_id,
                      woSite.wo_site_id,
                    ),
                    eq(workOrderSiteDocsTable.type, "measurement_sheet"),
                  ),
                ),
            ),
          ),
        ]);

        const woSiteIds = woSites.map((s: any) => s.wo_site_id);

        let allCompletions: any[] = [];
        if (woSiteIds.length > 0) {
          const [
            cleanSoilAreaExp,
            liftingOilExp,
            excavSoilExp,
            transSoilExp,
            refillSoilExp,
            bioremSoilExp,
          ] = await Promise.all([
            ctx.db
              .select()
              .from(cleaningUpSoilAreaTable)
              .where(
                and(
                  inArray(
                    cleaningUpSoilAreaTable.work_order_site_id,
                    woSiteIds,
                  ),
                  eq(cleaningUpSoilAreaTable.type, "completion" as any),
                ),
              ),
            ctx.db
              .select()
              .from(liftingRecoveryOilSlushTable)
              .where(
                and(
                  inArray(
                    liftingRecoveryOilSlushTable.work_order_site_id,
                    woSiteIds,
                  ),
                  eq(liftingRecoveryOilSlushTable.type, "completion" as any),
                ),
              ),
            ctx.db
              .select()
              .from(excavationContSoilTable)
              .where(
                and(
                  inArray(
                    excavationContSoilTable.work_order_site_id,
                    woSiteIds,
                  ),
                  eq(excavationContSoilTable.type, "completion" as any),
                ),
              ),
            ctx.db
              .select()
              .from(transportationContSoilTable)
              .where(
                and(
                  inArray(
                    transportationContSoilTable.work_order_site_id,
                    woSiteIds,
                  ),
                  eq(transportationContSoilTable.type, "completion" as any),
                ),
              ),
            ctx.db
              .select()
              .from(refillingExcavatedContSoilTable)
              .where(
                and(
                  inArray(
                    refillingExcavatedContSoilTable.work_order_site_id,
                    woSiteIds,
                  ),
                  eq(refillingExcavatedContSoilTable.type, "completion" as any),
                ),
              ),
            ctx.db
              .select()
              .from(bioremediationContSoilTable)
              .where(
                and(
                  inArray(
                    bioremediationContSoilTable.work_order_site_id,
                    woSiteIds,
                  ),
                  eq(bioremediationContSoilTable.type, "completion" as any),
                ),
              ),
          ]);

          const mapCompletion = (items: any[], activityName: string) =>
            items.map((item) => ({
              ...item,
              activity_name: activityName,
            }));

          allCompletions = [
            ...mapCompletion(cleanSoilAreaExp, "clean_soil_area"),
            ...mapCompletion(liftingOilExp, "lifting_oil_slush"),
            ...mapCompletion(excavSoilExp, "excav_cont_soil"),
            ...mapCompletion(transSoilExp, "trans_cont_soil"),
            ...mapCompletion(refillSoilExp, "refill_excav_soil"),
            ...mapCompletion(bioremSoilExp, "biorem_cont_soil"),
          ];
        }

        const sitesWithDetails = woSites.map((woSite: any, index: number) => {
          const siteCompletions = allCompletions.filter(
            (e: any) => e.work_order_site_id === woSite.wo_site_id,
          );
          const totalCompletionAmount = siteCompletions.reduce(
            (acc: number, curr: any) => acc + Number(curr.amount || 0),
            0,
          );

          return {
            site: {
              id: woSite.site_id,
              name: woSite.site_name,
              address: woSite.site_address,
              city: woSite.site_city,
              state: woSite.site_state,
              pincode: woSite.site_pincode,
            },
            wo_site_id: woSite.wo_site_id,
            start_date: woSite.start_date,
            end_date: woSite.end_date,
            status: woSite.status,
            activity_type: woSite.activity_type,
            metric_ton: woSite.metric_ton,
            metric_ton_rate: woSite.metric_ton_rate,
            budget_amount: woSite.budget_amount,
            total_completion_amount: totalCompletionAmount.toString(),
            created_at: woSite.created_at,
            users: sitesUsers[index],
            measurement_sheets: sitesSheets[index],
            completions: siteCompletions,
          };
        });

        const scheduleOfRates = await ctx.db
          .select()
          .from(scheduleOfRatesTable)
          .where(eq(scheduleOfRatesTable.work_order_id, id));

        return {
          workOrder,
          sites: sitesWithDetails,
          scheduleOfRates,
          stats: {
            total_sites: sitesWithDetails.length,
          },
        };
      } catch (error) {
        // Re-throw AppError instances
        if (error && typeof error === "object" && "errorCode" in error) {
          throw error;
        }
        throw fromDatabaseError(error, "Fetching work order full details");
      }
    }),
  ),
});
