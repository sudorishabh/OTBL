import z from "zod";
import * as userSchema from "./user.schema";

export type CreateUserType = z.infer<typeof userSchema.createUserSchema>;
export type UpdateUserType = z.infer<typeof userSchema.updateUserSchema>;
export type UpdateUserPasswordType = z.infer<
  typeof userSchema.updateUserPasswordSchema
>;
