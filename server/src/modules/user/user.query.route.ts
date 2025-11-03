import { router, protectedProcedure } from "../../trpc";
import { db } from "../../db";
import { userTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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

  // Get all users (admin only - you'll add role check)
  getAll: protectedProcedure.query(async () => {
    const users = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        contact_number: userTable.contact_number,
        role: userTable.role,
        status: userTable.status,
        created_at: userTable.created_at,
      })
      .from(userTable);

    return users;
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
