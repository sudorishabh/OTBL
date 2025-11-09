import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import { officeTable, siteTable, workOrderTable } from "../../db/schema";
import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import {
  addSiteSchema,
  editSiteSchema,
  getAllSitesPaginatedSchema,
  getSiteSchema,
} from "./site.schema";
import { handleDatabaseOperation } from "@/utils/trpc-errors";

export const siteQueryRouter = router({
  getSites: publicProcedure.query(async () => {
    const sites = await db.select().from(siteTable);

    return sites;
  }),

  // Get all sites with pagination, search, and filters
  getAll: publicProcedure
    .input(getAllSitesPaginatedSchema)
    .query(async ({ input }) => {
      const { page, limit, searchQuery, status, siteNamesOrder } = input;

      // Build the query conditions
      let siteQuery = undefined;

      if (status && status !== "all") {
        siteQuery = and(siteQuery, eq(siteTable.status, status)) ?? siteQuery;
      }

      if (searchQuery && searchQuery.trim() !== "") {
        siteQuery =
          and(
            siteQuery,
            or(
              like(siteTable.name, `%${searchQuery}%`),
              like(siteTable.address, `%${searchQuery}%`),
              like(siteTable.contact_person, `%${searchQuery}%`),
              like(siteTable.contact_number, `%${searchQuery}%`),
              like(siteTable.email, `%${searchQuery}%`)
            )
          ) ?? siteQuery;
      }

      const siteOrder =
        siteNamesOrder === "asc"
          ? asc(siteTable.name)
          : siteNamesOrder === "desc"
          ? desc(siteTable.name)
          : siteNamesOrder === "latest"
          ? desc(siteTable.created_at)
          : asc(siteTable.created_at);

      // Count total after applying filters
      const [totalResult] = await handleDatabaseOperation(() =>
        db
          .select({ count: count() })
          .from(siteTable)
          .where(siteQuery ?? undefined)
      );
      const total = totalResult.count;

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

      const sites = await handleDatabaseOperation(() =>
        db
          .select()
          .from(siteTable)
          .where(siteQuery ?? undefined)
          .limit(limit)
          .offset(offset)
          .orderBy(siteOrder)
      );

      const totalPages = Math.ceil(total / limit);
      const hasMore = offset + sites.length < total;

      return {
        sites,
        pagination: {
          page,
          limit,
          total,
          hasMore,
          totalPages,
        },
      };
    }),

  getSite: publicProcedure.input(getSiteSchema).query(async ({ input }) => {
    const site = await db
      .select()
      .from(siteTable)
      .where(eq(siteTable.id, input.id));

    return site;
  }),
});
