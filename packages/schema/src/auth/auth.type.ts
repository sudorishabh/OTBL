import { z } from "zod";
import * as authSchema from "./auth.schema";

export type loginType = z.infer<typeof authSchema.loginSchema>;
