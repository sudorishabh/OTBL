// src/routers/auth.ts
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import { OfficeTable, WorkOrderTable } from "../../db/schema";
import { eq } from "drizzle-orm";

export const addOfficeSchema = z.object({
  name: z.string().min(1, { message: "Office name is required." }),
  address: z.string().min(1, { message: "Address is required." }),
  state: z.string().min(1, { message: "State is required." }),
  city: z.string().min(1, { message: "City is required." }),
  pincode: z.string().min(1, { message: "Pincode is required." }).max(10),
  contact_person: z.string().min(1, { message: "Contact person is required." }),
  contact_number: z
    .string()
    .min(1, { message: "Contact number is required." })
    .max(15),
  email: z.string(),
});

export const officeRouter = router({
  // Public: returns JWT on valid credentials
  addOffice: publicProcedure
    .input(addOfficeSchema)
    .mutation(async ({ input }) => {
      const {
        address,
        city,
        contact_number,
        contact_person,
        email,
        name,
        pincode,
        state,
      } = input;

      await db.insert(OfficeTable).values({
        address,
        city,
        contact_number,
        contact_person,
        email,
        name,
        pincode,
        state,
      });

      return {
        success: true,
      };
    }),

  getOffices: publicProcedure.query(async () => {
    const offices = await db.select().from(OfficeTable);

    return offices;
  }),

  getOffice: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
      })
    )
    .query(async ({ input }) => {
      const office = await db
        .select()
        .from(OfficeTable)
        .where(eq(OfficeTable.id, input.id));

      if (!office || office.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
      }

      return office[0];
    }),

  getOfficeWorkOrders: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
      })
    )
    .query(async ({ input }) => {
      const all = await db
        .select()
        .from(WorkOrderTable)
        .where(eq(WorkOrderTable.office_id, input.id));

      const active = all.filter((wo) => wo.status === "pending");
      const completed = all.filter((wo) => wo.status === "completed");

      return { active, completed };
    }),

  // Protected: only accessible with valid Bearer token
  //   me: protectedProcedure.query(({ ctx }) => {
  //     return { userId: ctx.user!.sub, email: ctx.user!.email ?? null };
  //   }),
});
