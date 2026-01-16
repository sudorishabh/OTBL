/**
 * Work Order Router Schemas
 */
import { z } from "zod";
import {
  nameValidator,
  titleValidator,
  emailValidator,
  addressValidator,
  cityValidator,
  stateValidator,
  pincodeValidator,
  gstNumberValidator,
  contactNumberValidator,
  codeValidator,
  agreementNumberValidator,
  requiredDescriptionValidator,
  positiveIntValidator,
  optionalPositiveIntValidator,
  nonNegativeNumberValidator,
  metricTonValidator,
  rateValidator,
  dateValidator,
  documentKeyValidator,
  optionalUrlValidator,
  pageValidator,
  limitValidator,
  searchQueryValidator,
} from "../../validation/validators";

// Enums
export const workOrderStatusEnum = z.enum([
  "pending",
  "completed",
  "cancelled",
]);
// export const activityTypeEnum = z.enum(["insitu", "exsitu"]);

/**
 * New client schema (for inline creation during work order)
 */
export const newClientSchema = z.object({
  name: nameValidator,
  address: addressValidator,
  state: stateValidator,
  city: cityValidator,
  pincode: pincodeValidator,
  gst_number: gstNumberValidator,
  contact_number: contactNumberValidator,
  email: emailValidator,
});

/**
 * New site schema (for inline creation during work order)
 */
export const newSiteSchema = z.object({
  name: nameValidator,
  address: addressValidator,
  state: stateValidator,
  city: cityValidator,
  pincode: pincodeValidator,
  contact_person: nameValidator,
  contact_number: contactNumberValidator,
  email: emailValidator,
});

/**
 * Work order site details schema
 */
export const workOrderSiteSchema = z.object({
  site_id: optionalPositiveIntValidator,
  start_date: z.string().or(dateValidator),
  end_date: z.string().or(dateValidator),
  activity_type: z.string(),
  metric_ton: metricTonValidator,
  metric_ton_rate: rateValidator,
  budget_amount: nonNegativeNumberValidator.optional(),
});

/**
 * Unified Work Order Schema - Works for both frontend and backend
 *
 * Uses string-based dates and flexible types (string | number) for form compatibility
 * Date validation (comparison checks) should be done at the service layer if needed
 *
 * @example Frontend Usage
 * ```tsx
 * import { workOrderSchemas, type CreateWorkOrderInput } from "@pkg/trpc";
 *
 * const form = useForm<CreateWorkOrderInput>({
 *   resolver: zodResolver(workOrderSchemas.createWorkOrderSchema),
 * });
 * ```
 *
 * @example Backend Usage
 * ```ts
 * import { createWorkOrderSchema } from "./work-order.schema";
 *
 * const input = createWorkOrderSchema.parse(data);
 * ```
 */
/**
 * Base work order object schema (without refinements)
 * Use this for frontend form validation where client_id and sites
 * are added dynamically during form submission
 */
export const createWorkOrderBaseSchema = z.object({
  activity_type: z.string().min(1, "Activity type is required"),
  code: z.string().min(1, "Code is required"),
  title: titleValidator,
  office_id: z
    .string({ message: "This field is required" })
    .min(1, "This field is required"),

  agreement_number: z.string().min(1, "Agreement number is required"),
  // agreement_url: optionalUrlValidator,
  metric_ton: z
    .string({ message: "This field is required" })
    .min(1, "This field is required"),
  metric_ton_rate: z
    .string({ message: "This field is required" })
    .min(1, "This field is required"),
  budget_amount: z
    .string({ message: "This field is required" })
    .min(1, "This field is required"),
  expense_amount: z
    .string({ message: "This field is required" })
    .min(1, "This field is required"),

  client_id: z.string().min(1, "Client is required"),
  description: z.string().min(1, "Description is required"),

  document_key: z.string(),
  end_date: z.string().min(1, "End date is required"),
  // workOrderSites: z.array(z.number()),
  handing_over_date: z.string().min(1, "Handing over date is required"),

  proposal_id: optionalPositiveIntValidator,
  site_ids: z.array(z.number()),
  start_date: z.string().min(1, "Start date is required"),
  status: workOrderStatusEnum.default("pending"),
  technology_used: z.string(),
  // workOrderSites: z.array(workOrderSiteSchema).optional(),
});

/**
 * Form schema for frontend use - no refinements
 * Use this with react-hook-form/zod resolver
 */
export const createWorkOrderFormSchema = createWorkOrderBaseSchema;

/**
 * Full schema with refinements - for backend validation
 * Validates that client and sites are provided
 */
export const createWorkOrderSchema = createWorkOrderBaseSchema;
// .refine(
//   (data) => {
//     const hasExistingSites =
//       (data.existingSiteIds && data.existingSiteIds.length > 0) ||
//       (data.site_ids && data.site_ids.length > 0);
//     const hasNewSites = data.newSites && data.newSites.length > 0;
//     return hasExistingSites || hasNewSites;
//   },
//   {
//     message: "At least one site must be added to the work order",
//     path: ["existingSiteIds"],
//   }
// );

/**
 * Edit work order schema
 */
export const editWorkOrderSchema = z.object({
  id: positiveIntValidator,
  code: codeValidator.optional(),
  title: titleValidator.optional(),
  client_id: optionalPositiveIntValidator,
  start_date: z.string().or(dateValidator).optional(),
  end_date: z.string().or(dateValidator).optional(),
  handing_over_date: z.string().or(dateValidator).optional(),
  agreement_number: agreementNumberValidator.optional(),
  agreement_url: optionalUrlValidator,
  metric_ton: metricTonValidator,
  metric_ton_rate: rateValidator,
  technology_used: z.string().optional(),
  description: z.string().max(2000).optional(),
  budget_amount: nonNegativeNumberValidator.optional(),
  expense_amount: nonNegativeNumberValidator.optional(),
  status: workOrderStatusEnum.optional(),
  cancellation_reason: z
    .string()
    .max(1000, "Reason cannot exceed 1000 characters")
    .optional(),
});

/**
 * Get work order schema
 */
export const getWorkOrderSchema = z.object({ id: positiveIntValidator });
export const deleteWorkOrderSchema = z.object({ id: positiveIntValidator });

/**
 * Get work orders by office schema
 */
export const getWorkOrdersByOfficeSchema = z.object({
  office_id: positiveIntValidator,
});

/**
 * Get work orders by client schema
 */
export const getWorkOrdersByClientSchema = z.object({
  client_id: positiveIntValidator,
});

/**
 * Get all work orders paginated schema
 */
export const getAllWorkOrdersPaginatedSchema = z.object({
  page: pageValidator,
  limit: limitValidator,
  searchQuery: searchQueryValidator,
  status: z.enum(["all", "pending", "completed", "cancelled"]).optional(),
  office_id: optionalPositiveIntValidator,
  workOrderOrder: z.enum(["asc", "desc", "latest", "oldest"]).optional(),
});

// Type exports
export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>;
export type CreateWorkOrderFormInput = z.infer<
  typeof createWorkOrderFormSchema
>;
export type EditWorkOrderInput = z.infer<typeof editWorkOrderSchema>;
