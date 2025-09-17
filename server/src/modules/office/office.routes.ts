// src/routers/auth.ts
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import { OfficeTable } from "../../db/schema";

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

  // Protected: only accessible with valid Bearer token
  //   me: protectedProcedure.query(({ ctx }) => {
  //     return { userId: ctx.user!.sub, email: ctx.user!.email ?? null };
  //   }),
});
