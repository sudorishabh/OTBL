import { z } from "zod";

export const addBudgetCategorySchema = z.object({
  name: z.string().min(1, { message: "Budget category name is required" }),
  description: z.string(),
});

export const editBudgetCategorySchema = z.object({
  name: z.string().min(1, { message: "Budget category name is required" }),
  description: z
    .string()
    .min(1, { message: "Budget category description is required" }),
  id: z.number().min(1, { message: "Budget category Id is required" }),
});
