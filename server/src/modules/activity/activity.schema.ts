import { z } from "zod";

export const addActivitySchema = z.object({
  name: z.string().min(1, { message: "Activity name is required" }),
  description: z.string(),
});

export const editActivitySchma = z.object({
  name: z.string().min(1, { message: "Activity name is required" }),
  description: z
    .string()
    .min(1, { message: "Activity description is required" }),
  id: z.number().min(1, { message: "Activity Id is required" }),
});
