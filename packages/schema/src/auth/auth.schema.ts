import { z } from "zod";
import { emailValidator, loginPasswordValidator } from "../validators";

export const loginSchema = z.object({
  email: emailValidator,
  password: loginPasswordValidator,
});
