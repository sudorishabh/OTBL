import { router, protectedProcedure } from "../../trpc";
import { db } from "../../db";
import { officeUserTable, userTable, officeTable } from "../../db/schema";
import { and, asc, count, desc, eq, like, not, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { hasRole } from "@/middlewares/authorization";
import { handleDatabaseOperation } from "@/utils/trpc-errors";
import { getAllUsersPaginatedSchema } from "./user.schema";
import { ROLES } from "@/enums/user-roles";

export const userQueryRouter = router({
  // Get current user profile
  me: protectedProcedure.query(async ({ ctx }) => {
    const userId = parseInt(ctx.user.sub);

    const [user] = await db
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

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  // Get all users with pagination, search, and filters
  getAll: protectedProcedure
    .use(hasRole("admin"))
    .input(getAllUsersPaginatedSchema)
    .query(async ({ input }) => {
      const { page, limit, searchQuery, role, status, userNamesOrder } = input;

      // Build the query conditions
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
              like(userTable.contact_number, `%${searchQuery}%`)
            )
          ) ?? userQuery;
      }

      const userOrder =
        userNamesOrder === "asc"
          ? asc(userTable.name)
          : userNamesOrder === "desc"
          ? desc(userTable.name)
          : userNamesOrder === "latest"
          ? desc(userTable.created_at)
          : asc(userTable.created_at);

      // Count total after applying filters
      const [totalResult] = await handleDatabaseOperation(() =>
        db.select({ count: count() }).from(userTable).where(userQuery)
      );
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

      const offset = (page - 1) * limit;

      const users = await handleDatabaseOperation(() =>
        db
          .select({
            id: userTable.id,
            name: userTable.name,
            email: userTable.email,
            contact_number: userTable.contact_number,
            role: userTable.role,
            status: userTable.status,
            created_at: userTable.created_at,
            password: userTable.password,
          })
          .from(userTable)
          .where(userQuery)
          .limit(limit)
          .offset(offset)
          .orderBy(userOrder)
      );

      // Fetch offices for each user with full office details
      const usersWithOffices = await Promise.all(
        users.map(async (user) => {
          const offices = await handleDatabaseOperation(() =>
            db
              .select({
                id: officeTable.id,
                name: officeTable.name,
                officeRole: officeUserTable.role,
              })
              .from(officeUserTable)
              .innerJoin(
                officeTable,
                eq(officeUserTable.office_id, officeTable.id)
              )
              .where(eq(officeUserTable.user_id, user.id))
          );

          return {
            ...user,
            offices,
          };
        })
      );

      const totalPages = Math.ceil(totalResult.count / limit);

      const hasMore = offset + users.length < totalResult.count;
      return {
        users: usersWithOffices,
        pagination: {
          page,
          limit,
          total,
          hasMore,
          totalPages,
        },
      };
    }),

  // Get user by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [user] = await db
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),

  // Get managers and operators for office assignment
  getManagersAndOperators: protectedProcedure
    .use(hasRole("admin"))
    .query(async () => {
      // Get all active users with manager, staff, or operator roles
      const users = await handleDatabaseOperation(() =>
        db
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
              eq(userTable.status, "active"),
              or(
                eq(userTable.role, ROLES.MANAGER),
                eq(userTable.role, ROLES.STAFF),
                eq(userTable.role, ROLES.OPERATOR)
              )
            )
          )
          .orderBy(asc(userTable.name))
      );

      // Separate managers and operators
      const managers = users.filter(
        (user) => user.role === ROLES.MANAGER || user.role === ROLES.STAFF
      );

      const operators = users.filter(
        (user) => user.role === ROLES.OPERATOR || user.role === ROLES.STAFF
      );

      return {
        managers,
        operators,
      };
    }),
});
