import { desc, eq } from "drizzle-orm";
import { schema } from "@pkg/db";
import { SiteUser, Site } from "@pkg/db/types";
import { router } from "../../trpc";
import { publicProcedure } from "../../core";
import { getAllSitesPaginatedSchema, getSiteSchema } from "./site.schema";
import { handleDatabaseOperation } from "../../errors";
import { handleQuery } from "../../helper/typed-handler";

const { siteTable, siteUserTable, userTable } = schema;

export const siteQueryRouter = router({
  // Get all sites by office ID
  getSitesByOfficeId: publicProcedure.input(getAllSitesPaginatedSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { office_id } = input;

      const sites = await handleDatabaseOperation(async (): Promise<Site[]> => {
        return ctx.db
          .select()
          .from(siteTable)
          .where(eq(siteTable.office_id, office_id))
          .orderBy(desc(siteTable.created_at));
      }, "Failed to fetch sites");

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
            .orderBy(desc(siteUserTable.created_at))
        )
      );

      console.log(siteUsers);

      const sitesWithUsers = sites.map((site, index) => ({
        ...site,
        users: siteUsers[index],
      }));
      return sitesWithUsers;
    })
  ),

  // Get a single site by ID
  getSite: publicProcedure.input(getSiteSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const site = await handleDatabaseOperation(async () => {
        return ctx.db
          .select()
          .from(siteTable)
          .where(eq(siteTable.id, input.id));
      }, "Failed to fetch site");

      return site;
    })
  ),
});
