/**
 * User Router Schemas
 */
import { z } from "zod";
import { constants } from "@pkg/utils";
import {
  nameValidator,
  emailValidator,
  passwordValidator,
  optionalContactNumberValidator,
  pageValidator,
  limitValidator,
  searchQueryValidator,
  sortOrderValidator,
  positiveIntValidator,
} from "../../validation/validators";

const { ROLES, STATUS } = constants;

// Enums
export const userRoleEnum = z.enum([
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.STAFF,
  ROLES.VIEWER,
  ROLES.OPERATOR,
]);

export const statusEnum = z.enum([STATUS.ACTIVE, STATUS.INACTIVE]);

/**
 * User registration schema
 */
export const registerSchema = z.object({
  name: nameValidator,
  email: emailValidator,
  password: passwordValidator,
  contact_number: optionalContactNumberValidator,
  role: userRoleEnum,
});

/**
 * Edit user schema - all fields optional except id
 */
export const editUserSchema = z.object({
  id: positiveIntValidator,
  name: nameValidator.optional(),
  email: emailValidator.optional(),
  password: passwordValidator.optional(),
  contact_number: optionalContactNumberValidator,
  role: userRoleEnum.optional(),
  status: statusEnum.optional(),
});

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordValidator,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Get all users query schema with pagination and filters
 */
export const getAllUsersSchema = z.object({
  page: pageValidator,
  limit: limitValidator,
  searchQuery: searchQueryValidator,
  role: z
    .enum(["all", ROLES.MANAGER, ROLES.STAFF, ROLES.VIEWER, ROLES.OPERATOR])
    .optional(),
  status: z.enum(["all", STATUS.ACTIVE, STATUS.INACTIVE]).optional(),
  userNamesOrder: sortOrderValidator,
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type EditUserInput = z.infer<typeof editUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
