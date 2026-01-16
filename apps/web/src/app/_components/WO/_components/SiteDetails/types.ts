// Site types and constants for SiteDetails components

export type Site = {
  id: number;
  wo_site_id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
  start_date: string;
  end_date: string;
  status: "pending" | "completed" | "cancelled";
  client_id?: number;
  work_order_id?: number;
  // Additional work order site details
  activity_type?: "insitu" | "exsitu" | null;
  metric_ton?: string | null;
  metric_ton_rate?: string | null;
  budget_amount?: string | null;
  total_expense_amount?: string | null;
  users?: Array<{
    user_id: number;
    user_name: string;
    user_email: string;
    user_role: string;
  }>;
};

export type SiteDetailsDialogProps = {
  site: Site | null;
  open: boolean;
  setOpen: (open: boolean) => void;
};

// Activity item types labels mapping
export const ITEM_TYPE_LABELS: Record<string, string> = {
  zero_days: "Zero Day Activity",
  zero_day_samples: "Zero Day Sample",
  tph: "TPH Activity",
  oil_zappers: "Oil Zapper",
  clean_up_oil_spill: "Clean Up Oil Spill",
  lifting_oil_slush: "Lifting Oil Slush",
  excavation_cont_soil: "Excavation Cont. Soil",
  trnsprt_oil_slush: "Transport Oil Slush",
};

// Phase configuration
export const PHASES = [
  {
    key: "work_estimate",
    label: "Work Estimate",
    shortLabel: "Estimate",
    icon: "FileCheck" as const,
    color: "bg-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-600 dark:text-blue-400",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    key: "order",
    label: "Order",
    shortLabel: "Order",
    icon: "ShoppingCart" as const,
    color: "bg-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    borderColor: "border-amber-200 dark:border-amber-800",
    textColor: "text-amber-600 dark:text-amber-400",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    key: "expense",
    label: "Expense",
    shortLabel: "Expense",
    icon: "DollarSign" as const,
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
] as const;

export type PhaseType = (typeof PHASES)[number];
