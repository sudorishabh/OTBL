import { z } from "zod";
import {
  titleValidator,
  codeValidator,
  agreementNumberValidator,
  dateValidator,
  documentKeyValidator,
  optionalUrlValidator,
  positiveIntValidator,
  nonNegativeNumberValidator,
  longDescriptionValidator,
} from "../validators";

// Enums
export const workOrderStatusEnum = z.enum([
  "pending",
  "completed",
  "cancelled",
]);

export const processTypeEnum = z.enum(["bioremediation", "restoration"]);

// Base work order schema for creation
export const baseWorkOrderSchema = z.object({
  code: codeValidator,
  agreement_number: agreementNumberValidator,
  rate_contract_number: z
    .string({ message: "Rate contract number is required" })
    .trim()
    .min(1, "Rate contract number is required")
    .max(255, "Rate contract number cannot exceed 255 characters"),
  title: titleValidator,
  proposal_id: positiveIntValidator,
  client_id: positiveIntValidator,
  office_id: positiveIntValidator,
  start_date: dateValidator,
  end_date: dateValidator,
  handing_over_date: dateValidator,
  agreement_url: optionalUrlValidator,
  document_key: documentKeyValidator,
  metric_ton: z.coerce
    .number()
    .min(0, "Metric ton cannot be negative")
    .max(999999.99, "Metric ton value is too large")
    .optional(),
  metric_ton_rate: z.coerce
    .number()
    .min(0, "Rate cannot be negative")
    .max(999999.99, "Rate value is too large")
    .optional(),
  process_type: processTypeEnum,
  description: longDescriptionValidator,
  grand_total_amount: z.coerce
    .number()
    .min(0, "Amount cannot be negative")
    .optional(),
  expense_amount: nonNegativeNumberValidator.default(0),
});

// Schema for creating a work order - refines dates
export const createWorkOrderSchema = baseWorkOrderSchema
  .refine(
    (data) => {
      return data.end_date >= data.start_date;
    },
    {
      message: "End date must be on or after start date",
      path: ["end_date"],
    },
  )
  .refine(
    (data) => {
      return data.handing_over_date >= data.end_date;
    },
    {
      message: "Handing over date must be on or after end date",
      path: ["handing_over_date"],
    },
  );

// Schema for updating a work order
export const updateWorkOrderSchema = baseWorkOrderSchema
  .partial()
  .extend({
    id: positiveIntValidator,
    status: workOrderStatusEnum.optional(),
    cancellation_reason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return data.end_date >= data.start_date;
      }
      return true;
    },
    {
      message: "End date must be on or after start date",
      path: ["end_date"],
    },
  );

// Schema for deleting a work order
export const deleteWorkOrderSchema = z.object({
  id: positiveIntValidator,
});

// Schema for getting work orders by client
export const getWorkOrdersByClientSchema = z.object({
  client_id: positiveIntValidator,
});

// Schema for getting work order by id
export const getWorkOrderByIdSchema = z.object({
  id: positiveIntValidator,
});
