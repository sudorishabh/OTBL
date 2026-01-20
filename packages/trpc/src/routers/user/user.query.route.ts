import { and, asc, count, desc, eq, inArray, like, not, or } from "drizzle-orm";
import { schema } from "@pkg/db";
import { constants } from "@pkg/utils";
import { router } from "../../trpc";
import { protectedProcedure } from "../../core";
import { z } from "zod";
import { hasAnyRole, hasRole } from "../../authorization";
import { throwNotFoundError, handleDatabaseOperation } from "../../errors";
import { handleProtectedQuery } from "../../helper/typed-handler";
import { userSchemas, userTypes } from "@pkg/schema";

const { userTable, officeTable, officeUserTable, siteTable, siteUserTable } =
  schema;
const { ROLES, STATUS } = constants;

export const userQueryRouter = router({
  me: protectedProcedure.query(
    handleProtectedQuery(async ({ ctx }) => {
      const userId = Number(ctx.user.sub);

      const [userData] = await ctx.db
        .select({
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
          contact_number: userTable.contact_number,
          role: userTable.role,
          status: userTable.status,
          created_at: userTable.created_at,
        })
        .from(userTable)
        .where(eq(userTable.id, userId))
        .limit(1);

      if (!userData) {
        throwNotFoundError("User");
      }

      return userData;
    }),
  ),

  getAllUser: protectedProcedure
    .use(hasRole(ROLES.ADMIN))
    .input(userSchemas.getAllUsersSchema)
    .query(
      handleProtectedQuery(async ({ input, ctx }) => {
        const { page, limit, searchQuery, role, status, userNamesOrder } =
          input;

        const offset = (page - 1) * limit;
        let userQuery = not(eq(userTable.role, ROLES.ADMIN));

        if (role && role !== "all") {
          userQuery = and(userQuery, eq(userTable.role, role)) ?? userQuery;
        }

        if (status && status !== "all") {
          userQuery = and(userQuery, eq(userTable.status, status)) ?? userQuery;
        }

        if (searchQuery && searchQuery.trim() !== "") {
          userQuery =
            and(
              userQuery,
              or(
                like(userTable.name, `%${searchQuery}%`),
                like(userTable.email, `%${searchQuery}%`),
                like(userTable.contact_number, `%${searchQuery}%`),
              ),
            ) ?? userQuery;
        }

        // Count total after applying filters
        const [totalResult] = await ctx.db
          .select({ count: count() })
          .from(userTable)
          .where(userQuery);

        if (!totalResult) {
          throwNotFoundError("User");
        }

        const total = totalResult.count;

        if (total === 0) {
          return {
            users: [],
            pagination: {
              page,
              limit,
              total,
              hasMore: false,
              totalPages: 0,
            },
          };
        }

        let userOrder;
        switch (userNamesOrder) {
          case "asc":
            userOrder = asc(userTable.name);
            break;

          case "desc":
            userOrder = desc(userTable.name);
            break;

          case "latest":
            userOrder = desc(userTable.created_at);
            break;

          default:
            userOrder = asc(userTable.created_at);
            break;
        }

        const users = await ctx.db
          .select({
            id: userTable.id,
            name: userTable.name,
            email: userTable.email,
            contact_number: userTable.contact_number,
            role: userTable.role,
            status: userTable.status,
            created_at: userTable.created_at,
          })
          .from(userTable)
          .where(userQuery)
          .limit(limit)
          .offset(offset)
          .orderBy(userOrder);

        // Fetch offices for each user with full office details
        // Fetch offices and sites in batch to avoid N+1 problem
        const userIds = users.map((u: any) => u.id);
        let allOffices: {
          userId: number;
          id: number;
          name: string;
          officeRole: string | null;
        }[] = [];
        let allSites: { userId: number; id: number; name: string }[] = [];

        if (userIds.length > 0) {
          allOffices = await ctx.db
            .select({
              userId: officeUserTable.user_id,
              id: officeTable.id,
              name: officeTable.name,
              officeRole: officeUserTable.role,
            })
            .from(officeUserTable)
            .innerJoin(
              officeTable,
              eq(officeUserTable.office_id, officeTable.id),
            )
            .where(inArray(officeUserTable.user_id, userIds));

          allSites = await ctx.db
            .select({
              userId: siteUserTable.user_id,
              id: siteTable.id,
              name: siteTable.name,
            })
            .from(siteUserTable)
            .innerJoin(siteTable, eq(siteUserTable.site_id, siteTable.id))
            .where(inArray(siteUserTable.user_id, userIds));
        }

        const usersWithOfficesAndSites = users.map((user: any) => {
          const userOffices = allOffices
            .filter((o) => o.userId === user.id)
            .map(({ userId, ...rest }) => ({ ...rest, type: "office" }));

          const userSites = allSites
            .filter((s) => s.userId === user.id)
            .map(({ userId, ...rest }) => ({ ...rest, type: "site" }));

          return {
            ...user,
            offices: userOffices,
            sites: userSites,
          };
        });

        const totalPages = Math.ceil(totalResult?.count / limit);
        const hasMore = offset + users.length < totalResult.count;

        return {
          users: usersWithOfficesAndSites,
          pagination: {
            page,
            limit,
            total,
            hasMore,
            totalPages,
          },
        };
      }),
    ),

  // Get user by ID
  getUserById: protectedProcedure
    .use(hasAnyRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]))
    .input(z.object({ id: z.number() }))
    .query(
      handleProtectedQuery(async ({ input, ctx }) => {
        const [user] = await ctx.db
          .select({
            id: userTable.id,
            name: userTable.name,
            email: userTable.email,
            contact_number: userTable.contact_number,
            role: userTable.role,
            status: userTable.status,
            created_at: userTable.created_at,
          })
          .from(userTable)
          .where(eq(userTable.id, input.id))
          .limit(1);

        if (!user) {
          throwNotFoundError("User");
        }

        return user;
      }),
    ),

  // Get managers and operators for office assignment
  getManagersAndOperators: protectedProcedure.use(hasRole(ROLES.ADMIN)).query(
    handleProtectedQuery(async ({ ctx }) => {
      const users = await ctx.db
        .select({
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
          contact_number: userTable.contact_number,
          role: userTable.role,
          status: userTable.status,
        })
        .from(userTable)
        .where(
          and(
            eq(userTable.status, STATUS.ACTIVE),
            or(
              eq(userTable.role, ROLES.MANAGER),
              eq(userTable.role, ROLES.OPERATOR),
            ),
          ),
        )
        .orderBy(asc(userTable.name));

      const managers = users.filter((user: any) => user.role === ROLES.MANAGER);

      const operators = users.filter(
        (user: any) => user.role === ROLES.OPERATOR,
      );

      return { managers, operators };
    }),
  ),

  // Get 8 users from each role category
  getCategories8User: protectedProcedure.query(
    handleProtectedQuery(async ({ ctx }) => {
      const userInfoNeeded = {
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        password: userTable.password,
        role: userTable.role,
        contact_number: userTable.contact_number,
        status: userTable.status,
        created_at: userTable.created_at,
      };

      const fetchEightByRole = (role: (typeof ROLES)[keyof typeof ROLES]) =>
        handleDatabaseOperation(() =>
          ctx.db
            .select(userInfoNeeded)
            .from(userTable)
            .where(
              and(
                eq(userTable.role, role),
                eq(userTable.status, STATUS.ACTIVE),
                not(eq(userTable.role, ROLES.ADMIN)),
              ),
            )
            .orderBy(desc(userTable.created_at))
            .limit(8),
        );

      const totalUserByRole = async (
        role: (typeof ROLES)[keyof typeof ROLES],
      ) => {
        return await handleDatabaseOperation(() =>
          ctx.db
            .select({ count: count() })
            .from(userTable)
            .where(
              and(
                not(eq(userTable.role, ROLES.ADMIN)),
                eq(userTable.role, role),
              ),
            ),
        );
      };

      const [
        managers,
        staff,
        operators,
        viewers,
        totalManagers,
        totalStaff,
        totalOperators,
        totalViewers,
      ] = await Promise.all([
        fetchEightByRole(ROLES.MANAGER),
        fetchEightByRole(ROLES.STAFF),
        fetchEightByRole(ROLES.OPERATOR),
        fetchEightByRole(ROLES.VIEWER),
        totalUserByRole(ROLES.MANAGER),
        totalUserByRole(ROLES.STAFF),
        totalUserByRole(ROLES.OPERATOR),
        totalUserByRole(ROLES.VIEWER),
      ]);

      return {
        managers,
        staff,
        operators,
        viewers,
        totalManagers: totalManagers[0]?.count,
        totalStaff: totalStaff[0]?.count,
        totalOperators: totalOperators[0]?.count,
        totalViewers: totalViewers[0]?.count,
      };
    }),
  ),
});
