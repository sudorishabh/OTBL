import { z } from "zod";

export const addCategoryBudgetSchema = z.object({
  name: z.string().min(1, { message: "Activity name is required" }),
  description: z.string(),
});
