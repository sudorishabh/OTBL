import { and, count, desc, eq, like, or } from "drizzle-orm";
import { schema } from "@pkg/db";
import { Site } from "@pkg/db/types";
import { router } from "../../trpc";
import { publicProcedure } from "../../core";
import { fromDatabaseError } from "../../errors";
import { handleQuery } from "../../helper/typed-handler";
import { siteSchemas } from "@pkg/schema";

const { siteTable, siteUserTable, userTable } = schema;

export const siteQueryRouter = router({
  get6SitesByOfficeId: publicProcedure
    .input(siteSchemas.get6SitesByOfficeIdSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { office_id } = input;

        try {
          const sites: Site[] = await ctx.db
            .select()
            .from(siteTable)
            .where(eq(siteTable.office_id, office_id))
            .orderBy(desc(siteTable.created_at));

          const siteUsers = await Promise.all(
            sites.map((site: Site) =>
              ctx.db
                .select({
                  site_id: siteUserTable.id,
                  role: userTable.role,
                  name: userTable.name,
                  email: userTable.email,
                  contact_number: userTable.contact_number,
                  status: userTable.status,
                })
                .from(siteUserTable)
                .where(eq(siteUserTable.site_id, site.id))
                .leftJoin(userTable, eq(siteUserTable.user_id, userTable.id))
                .limit(6)
                .orderBy(desc(siteUserTable.created_at)),
            ),
          );

          const sitesWithUsers = sites.map((site, index) => ({
            ...site,
            users: siteUsers[index],
          }));

          return sitesWithUsers;
        } catch (error) {
          throw fromDatabaseError(error, "Fetching sites by office");
        }
      }),
    ),

  getSitesByOfficeId: publicProcedure
    .input(siteSchemas.getAllSitesByOfficeIdSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { office_id, page, limit, searchQuery, status } = input;
        const offset = (page - 1) * limit;

        try {
          const whereClause = and(
            eq(siteTable.office_id, office_id),
            searchQuery && searchQuery.trim() !== ""
              ? or(
                  like(siteTable.name, `%${searchQuery}%`),
                  like(siteTable.address, `%${searchQuery}%`),
                  like(siteTable.city, `%${searchQuery}%`),
                )
              : undefined,
            status && status !== "all"
              ? eq(siteTable.status, status as any)
              : undefined,
          );

          // Get total count of sites for this office
          const [countResult] = await ctx.db
            .select({ count: count(siteTable.id) })
            .from(siteTable)
            .where(whereClause);

          const totalCount = countResult?.count ?? 0;

          // Get paginated sites
          const sites: Site[] = await ctx.db
            .select()
            .from(siteTable)
            .where(whereClause)
            .orderBy(desc(siteTable.created_at))
            .limit(limit)
            .offset(offset);

          const siteUsers = await Promise.all(
            sites.map((site: Site) =>
              ctx.db
                .select({
                  site_id: siteUserTable.id,
                  role: userTable.role,
                  name: userTable.name,
                  email: userTable.email,
                  contact_number: userTable.contact_number,
                  status: userTable.status,
                })
                .from(siteUserTable)
                .where(eq(siteUserTable.site_id, site.id))
                .leftJoin(userTable, eq(siteUserTable.user_id, userTable.id))
                .limit(6)
                .orderBy(desc(siteUserTable.created_at)),
            ),
          );

          const sitesWithUsers = sites.map((site, index) => ({
            ...site,
            users: siteUsers[index],
          }));

          return {
            sites: sitesWithUsers,
            totalCount,
            hasMore: offset + sites.length < totalCount,
          };
        } catch (error) {
          throw fromDatabaseError(error, "Fetching paginated sites");
        }
      }),
    ),

  // Get a single site by ID
  getSite: publicProcedure.input(siteSchemas.getSiteSchema).query(
    handleQuery(async ({ input, ctx }) => {
      try {
        const [site] = await ctx.db
          .select()
          .from(siteTable)
          .where(eq(siteTable.id, input.siteId))
          .limit(1);

        return site;
      } catch (error) {
        throw fromDatabaseError(error, "Fetching site");
      }
    }),
  ),
});
