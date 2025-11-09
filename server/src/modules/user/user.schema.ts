import { z } from "zod";

// Get All Users paginated schema
export const getAllUsersPaginatedSchema = z.object({
  page: z.number().min(1, "Page number must be at least 1"),
  limit: z
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100"),
  searchQuery: z.string().optional(),
  role: z.enum(["all", "manager", "staff", "viewer", "operator"]).optional(),
  status: z.enum(["all", "active", "inactive"]).optional(),
  userNamesOrder: z.enum(["asc", "desc", "latest", "oldest"]).optional(),
});

// Registration schema
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  contact_number: z.string().optional(),
  role: z.enum(["admin", "manager", "staff", "viewer", "operator"]),
});

export const editUserSchema = registerSchema.extend({
  id: z.string(),
});

// Login schema
export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

// Update user schema
export const updateUserSchema = z.object({
  id: z.number(),
  name: z.string().min(2).optional(),
  contact_number: z.string().optional(),
  role: z.enum(["admin", "manager", "staff", "viewer", "operator"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
