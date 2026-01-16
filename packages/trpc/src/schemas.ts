/**
 * Route Schemas - Re-exports all route schemas for frontend usage
 *
 * Usage in frontend:
 * ```tsx
 * import { userSchemas, clientSchemas, type RegisterInput } from "@pkg/trpc";
 *
 * const form = useForm<RegisterInput>({
 *   resolver: zodResolver(userSchemas.registerSchema),
 * });
 * ```
 */

// Auth Schemas
export * as authSchemas from "./routers/auth/auth.schema";
// export type { LoginInput } from "./routers/auth/auth.schema";

// User Schemas
export * as userSchemas from "./routers/user/user.schema";
export type {
  RegisterInput,
  EditUserInput,
  ChangePasswordInput,
} from "./routers/user/user.schema";

// Client Schemas
export * as clientSchemas from "./routers/client/client.schema";
export type {
  AddClientInput,
  EditClientInput,
  AddClientContactInput,
} from "./routers/client/client.schema";

// Office Schemas
export * as officeSchemas from "./routers/office/office.schema";
export type {
  AddOfficeInput,
  EditOfficeInput,
} from "./routers/office/office.schema";

// Site Schemas
export * as siteSchemas from "./routers/site/site.schema";
export type { AddSiteInput, EditSiteInput } from "./routers/site/site.schema";

// Proposal Schemas
export * as proposalSchemas from "./routers/proposal/proposal.schema";
export type {
  BaseProposalInput,
  AddProposalInput,
  EditProposalInput,
} from "./routers/proposal/proposal.schema";

// Work Order Schemas
export * as workOrderSchemas from "./routers/work-order/work-order.schema";
export type {
  CreateWorkOrderInput,
  CreateWorkOrderFormInput,
  EditWorkOrderInput,
} from "./routers/work-order/work-order.schema";

// Site Activity Schemas
export * as siteActivitySchemas from "./routers/site-activity/site-activity.schema";
export type {
  CreateZeroDayActivityInput,
  CreateZeroDaySampleInput,
  CreateTphActivityInput,
  CreateOilZapperActivityInput,
} from "./routers/site-activity/site-activity.schema";

// Technology Schemas
export * as technologySchemas from "./routers/technology/technology.schema";
