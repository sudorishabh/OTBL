import { z } from "zod";

import * as clientSchemas from "./client.schema";

export type createClientInput = z.infer<
  typeof clientSchemas.createClientSchema
>;

export type createClientContactInput = z.infer<
  typeof clientSchemas.createClientContactSchema
>;

export type createClientWithContactsInput = z.infer<
  typeof clientSchemas.createClientWithContactsSchema
>;
