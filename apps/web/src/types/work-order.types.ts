export interface IWorkOrder {
  id: number;
  code: string;
  title: string;
  client_id: number;
  client_name: string | null;
  office_id: number;
  office_name: string | null;
  start_date: Date | string;
  end_date: Date | string;
  handing_over_date: Date | string;
  agreement_number: string;
  budget_amount: string | null;
  expense_amount: string | null;
  status: "pending" | "completed" | "cancelled";
  created_at: Date | string;
  updated_at: Date | string;
}

export interface IWorkOrderPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  totalPages: number;
}
