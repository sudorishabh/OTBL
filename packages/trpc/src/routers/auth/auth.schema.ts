import { z } from "zod";
import {
  emailValidator,
  loginPasswordValidator,
} from "../../validation/validators";

export const loginSchema = z.object({
  email: emailValidator,
  password: loginPasswordValidator,
});

export type LoginInput = z.infer<typeof loginSchema>;
