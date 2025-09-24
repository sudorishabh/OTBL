import { z } from "zod";

export const addActivitySchema = z.object({
  name: z.string().min(1, { message: "Activity name is required" }),
  description: z.string(),
});
