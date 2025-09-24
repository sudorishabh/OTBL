import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import { OfficeTable, SiteTable, WorkOrderTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { addSiteSchema, editSiteSchema, getSiteSchema } from "./site.schema";

export const siteQueryRouter = router({
  getSites: publicProcedure.query(async () => {
    const sites = await db.select().from(SiteTable);

    return sites;
  }),

  getSite: publicProcedure.input(getSiteSchema).query(async ({ input }) => {
    const site = await db
      .select()
      .from(SiteTable)
      .where(eq(SiteTable.id, input.id));

    return site;
  }),
});
