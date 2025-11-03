import { z } from "zod";

// Registration schema
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  contact_number: z.string().optional(),
  role: z
    .enum(["admin", "manager", "staff", "viewer", "operator"])
    .default("staff"),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
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
