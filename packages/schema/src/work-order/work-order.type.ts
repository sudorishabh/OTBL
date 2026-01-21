import { z } from "zod";
import {
  baseWorkOrderSchema,
  createWorkOrderSchema,
  updateWorkOrderSchema,
} from "./work-order.schema";

export type workOrderType = {
  id: number;
  code: string;
  agreement_number: string;
  rate_contract_number: string;
  title: string;
  proposal_id: number;
  client_id: number;
  office_id: number;
  start_date: string;
  end_date: string;
  handing_over_date: string;
  agreement_url: string | null;
  document_key: string;
  metric_ton: string | null;
  metric_ton_rate: string | null;
  process_type: string;
  description: string | null;
  grand_total_amount: string | null;
  expense_amount: string;
  status: "pending" | "completed" | "cancelled";
  cancellation_reason: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

// Input types for forms (before validation/coercion)
export type BaseWorkOrderInput = z.input<typeof baseWorkOrderSchema>;

// Output types (after validation/coercion)
export type BaseWorkOrderOutput = z.output<typeof baseWorkOrderSchema>;
export type CreateWorkOrderInput = z.output<typeof createWorkOrderSchema>;
export type UpdateWorkOrderInput = z.output<typeof updateWorkOrderSchema>;
