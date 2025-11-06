import { router, protectedProcedure } from "../../trpc";
import { db } from "../../db";
import { officeUserTable, userTable, officeTable } from "../../db/schema";
import { eq, not } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { hasRole } from "@/middlewares/authorization";
import { off } from "process";
import { handleDatabaseOperation } from "@/utils/trpc-errors";

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

  getAll: protectedProcedure.use(hasRole("admin")).query(async () => {
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
        .where(not(eq(userTable.role, "admin")))
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

    return usersWithOffices;
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
});
