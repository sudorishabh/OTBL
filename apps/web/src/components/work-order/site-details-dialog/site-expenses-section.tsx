"use client";
import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { constants } from "@pkg/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  HardHat,
  Users,
  Package,
  Wrench,
  MoreHorizontal,
  ExternalLink,
  ReceiptIndianRupee,
  ChevronDown,
  ChevronRight,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import CustomButton from "@/components/shared/btn";
import AddExpenseDialog, {
  EXPENSE_TYPE_LABELS,
  ActivityOption,
  Expense,
} from "./add-expense-dialog";

const EXPENSE_TYPE_ICONS: Record<string, React.ElementType> = {
  contractor_payment: HardHat,
  labour: Users,
  material: Package,
  equipment: Wrench,
  miscellaneous: MoreHorizontal,
};

const EXPENSE_TYPE_COLORS: Record<string, string> = {
  contractor_payment: "bg-blue-50 text-blue-700 border-blue-200",
  labour: "bg-orange-50 text-orange-700 border-orange-200",
  material: "bg-purple-50 text-purple-700 border-purple-200",
  equipment: "bg-cyan-50 text-cyan-700 border-cyan-200",
  miscellaneous: "bg-gray-50 text-gray-700 border-gray-200",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const formatActivityLabel = (key: string) =>
  key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

interface Props {
  woSiteId: number;
  officeId: number;
  processType?: string;
}

const SiteExpensesSection = ({ woSiteId, officeId, processType }: Props) => {
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

  const siteActivitiesQuery = trpc.workOrderSiteQuery.getSiteActivities.useQuery(
    { work_order_site_id: woSiteId },
    { enabled: !!woSiteId },
  );

  const restorationDataQuery = trpc.workOrderSiteQuery.getRestorationData.useQuery(
    { work_order_site_id: woSiteId },
    { enabled: !!woSiteId && processType !== "bioremediation" },
  );

  const bioremediationDataQuery = trpc.workOrderSiteQuery.getBioremediationData.useQuery(
    { work_order_site_id: woSiteId },
    { enabled: !!woSiteId && processType === "bioremediation" },
  );

  const expensesQuery = trpc.expenseQuery.getExpenses.useQuery(
    { work_order_site_id: woSiteId },
    { enabled: !!woSiteId },
  );

  const summaryQuery = trpc.expenseQuery.getExpenseSummary.useQuery(
    { work_order_site_id: woSiteId },
    { enabled: !!woSiteId },
  );

  const deleteExpenseMutation = trpc.expenseMutation.deleteExpense.useMutation({
    onSuccess: () => {
      utils.expenseQuery.getExpenses.invalidate({ work_order_site_id: woSiteId });
      utils.expenseQuery.getExpenseSummary.invalidate({ work_order_site_id: woSiteId });
      toast.success("Expense deleted");
      setDeletingId(null);
    },
    onError: (e: any) => {
      toast.error(e.message || "Failed to delete expense");
      setDeletingId(null);
    },
  });

  const expenses: Expense[] = expensesQuery.data?.expenses ?? [];
  const summary = summaryQuery.data;
  const incomeTotal = summary?.incomeTotal ?? 0;
  const expenseTotal = summary?.grandTotal ?? 0;
  const exceededTotal = summary?.exceededTotal ?? 0;
  const regularTotal = summary?.regularTotal ?? expenseTotal - exceededTotal;
  const netPL = incomeTotal - expenseTotal;

  const isBioremediation = processType === "bioremediation";
  const estimateType = "estimate_sub-wo";

  const getEstimateQty = (activityKey: string): number | null => {
    if (isBioremediation) {
      const data = bioremediationDataQuery.data;
      if (!data) return null;
      if (
        activityKey === "biorem_cont_soil" ||
        activityKey === constants.WO_ACTIVITIES.BIOREMEDIATION_OIL_CONTAMINATED_SOIL
      ) {
        const qty = data.contaminatedSoil?.find((i: any) => i.type === estimateType)?.estimated_quantity;
        return qty != null ? Number(qty) : null;
      }
      return null;
    }
    const data = restorationDataQuery.data;
    if (!data) return null;
    let qty: any;
    switch (activityKey) {
      case "clean_up_oil_spill":
      case "clean_soil_area":
      case constants.WO_ACTIVITIES.clean_soil_area:
        qty = data.cleaningUpSoilArea?.find((i: any) => i.type === estimateType)?.estimated_quantity;
        break;
      case "lifting_oil_slush":
      case constants.WO_ACTIVITIES.LIFTING_OILY_SLUSH_OR_RECOVERY_OF_OIL:
        qty = data.liftingRecoveryOilSlush?.find((i: any) => i.type === estimateType)?.estimated_quantity;
        break;
      case "excav_cont_soil":
      case constants.WO_ACTIVITIES.EXCAVATION_OIL_CONTAMINATED_SOIL:
        qty = data.excavationContSoil?.find((i: any) => i.type === estimateType)?.estimated_quantity;
        break;
      case "trans_cont_soil":
      case "trnsprt_oil_slush":
      case constants.WO_ACTIVITIES.TRANSPORTATION_CONTAMINATED_SOIL:
        qty = data.transportationContSoil?.find((i: any) => i.type === estimateType)?.estimated_quantity;
        break;
      case "refill_excav_soil":
      case constants.WO_ACTIVITIES.REFILLING_EXCAVATED_OIL_CONTAMINATED_SOIL_LAND:
        qty = data.refillingExcavatedContSoil?.find((i: any) => i.type === estimateType)?.estimated_quantity;
        break;
      default:
        return null;
    }
    return qty != null ? Number(qty) : null;
  };

  // Activity options for dialog
  const activityOptions: ActivityOption[] = useMemo(() => {
    if (!siteActivitiesQuery.data) return [];
    return siteActivitiesQuery.data.map((a: any) => ({
      key: a.activity,
      label: formatActivityLabel(a.activity),
      unit: a.unit ?? "Nos",
      estimateQty: getEstimateQty(a.activity),
    }));
  }, [siteActivitiesQuery.data, restorationDataQuery.data, bioremediationDataQuery.data]);

  // Compute used qty per activity (only non-exceeded normal expenses contribute to used qty)
  const usedQtyByActivity = useMemo(() => {
    const map: Record<string, number> = {};
    for (const exp of expenses) {
      if (exp.activity_key && exp.quantity && !exp.is_exceeded) {
        map[exp.activity_key] = (map[exp.activity_key] ?? 0) + Number(exp.quantity);
      }
    }
    return map;
  }, [expenses]);

  // Group expenses by activity_key
  const { groupedExpenses, activityGroups } = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    for (const exp of expenses) {
      const key = exp.activity_key ?? "__none__";
      if (!groups[key]) groups[key] = [];
      groups[key]!.push(exp);
    }
    const orderedKeys: string[] = [];
    for (const a of activityOptions) {
      if (groups[a.key]) orderedKeys.push(a.key);
    }
    if (groups["__none__"]) orderedKeys.push("__none__");
    return { groupedExpenses: groups, activityGroups: orderedKeys };
  }, [expenses, activityOptions]);

  const toggleActivity = (key: string) => {
    setExpandedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingExpense(null);
  };

  const confirmDelete = () => {
    if (deletingId !== null) deleteExpenseMutation.mutate({ id: deletingId });
  };

  const renderExpenseRow = (exp: Expense) => {
    const Icon = EXPENSE_TYPE_ICONS[exp.expense_type] ?? MoreHorizontal;
    const isExceeded = !!exp.is_exceeded;
    return (
      <TableRow
        key={exp.id}
        className={`transition-colors ${isExceeded ? "bg-orange-50/40 hover:bg-orange-50/70" : "hover:bg-blue-50/20"}`}>
        <TableCell className='text-xs text-gray-600 py-2.5'>
          {format(new Date(exp.expense_date), "dd MMM yyyy")}
        </TableCell>
        <TableCell className='py-2.5'>
          <div className='flex flex-col gap-1'>
            <Badge
              variant='outline'
              className={`text-[10px] px-2 py-0.5 flex items-center gap-1 w-fit ${EXPENSE_TYPE_COLORS[exp.expense_type] ?? ""}`}>
              <Icon className='w-2.5 h-2.5' />
              {EXPENSE_TYPE_LABELS[exp.expense_type] ?? exp.expense_type}
            </Badge>
            {isExceeded && (
              <Badge
                variant='outline'
                className='text-[10px] px-2 py-0.5 flex items-center gap-1 w-fit bg-orange-50 text-orange-700 border-orange-200'>
                <AlertTriangle className='w-2.5 h-2.5' />
                Exceeded
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className='py-2.5'>
          <div className='flex flex-col'>
            <span className='text-xs text-gray-800 font-medium'>{exp.description}</span>
            {exp.notes && (
              <span className='text-[10px] text-gray-400 line-clamp-1'>{exp.notes}</span>
            )}
          </div>
        </TableCell>
        <TableCell className='py-2.5 text-xs text-gray-600 text-center tabular-nums'>
          {exp.quantity ? (
            <span className='font-medium'>{Number(exp.quantity)}</span>
          ) : (
            <span className='text-gray-300'>—</span>
          )}
        </TableCell>
        <TableCell className='py-2.5 text-xs text-gray-600'>
          {exp.contractor_name ?? <span className='text-gray-300'>—</span>}
        </TableCell>
        <TableCell className='py-2.5 text-xs text-gray-500'>
          {exp.invoice_number ?? <span className='text-gray-300'>—</span>}
        </TableCell>
        <TableCell className='py-2.5 text-center'>
          {exp.document_url ? (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={exp.document_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors'>
                    <ExternalLink className='w-3 h-3' />
                  </a>
                </TooltipTrigger>
                <TooltipContent side='top' className='text-[10px] px-2 py-1 bg-gray-900 text-white'>
                  View Document
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className='text-gray-300 text-xs'>—</span>
          )}
        </TableCell>
        <TableCell className='py-2.5 text-right'>
          <span className={`text-sm font-semibold ${isExceeded ? "text-orange-700" : "text-red-700"}`}>
            {formatCurrency(Number(exp.amount))}
          </span>
        </TableCell>
        <TableCell className='py-2.5'>
          <div className='flex items-center justify-end gap-1'>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type='button'
                    onClick={() => handleEdit(exp)}
                    className='p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors'>
                    <Pencil className='w-3 h-3' />
                  </button>
                </TooltipTrigger>
                <TooltipContent side='top' className='text-[10px] px-2 py-1 bg-gray-900 text-white'>
                  Edit
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type='button'
                    onClick={() => setDeletingId(exp.id)}
                    className='p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors'>
                    <Trash2 className='w-3 h-3' />
                  </button>
                </TooltipTrigger>
                <TooltipContent side='top' className='text-[10px] px-2 py-1 bg-gray-900 text-white'>
                  Delete
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-3 gap-3'>
        <div className='rounded-xl border bg-emerald-50/60 border-emerald-100 p-4'>
          <div className='flex items-center gap-2 mb-1'>
            <TrendingUp className='w-3.5 h-3.5 text-emerald-600' />
            <span className='text-[10px] font-semibold text-emerald-600 uppercase tracking-wider'>
              Income Earned
            </span>
          </div>
          <p className='text-lg font-bold text-emerald-700'>
            {summaryQuery.isLoading ? <span className='text-gray-400'>—</span> : formatCurrency(incomeTotal)}
          </p>
          <p className='text-[10px] text-emerald-600 mt-0.5'>From completed activities</p>
        </div>

        <div className='rounded-xl border border-gray-100 p-4 space-y-1.5'>
          <div className='flex items-center gap-2'>
            <TrendingDown className='w-3.5 h-3.5 text-gray-500' />
            <span className='text-[10px] font-semibold text-gray-500 uppercase tracking-wider'>
              Total Expenses
            </span>
          </div>
          <p className='text-lg font-bold text-gray-800'>
            {summaryQuery.isLoading ? <span className='text-gray-400'>—</span> : formatCurrency(expenseTotal)}
          </p>
          {exceededTotal > 0 && (
            <div className='flex flex-col gap-0.5 pt-0.5 border-t border-gray-100'>
              <span className='text-[9px] text-gray-400'>
                Regular: {formatCurrency(regularTotal)}
              </span>
              <span className='text-[9px] text-orange-600 font-semibold flex items-center gap-1'>
                <AlertTriangle className='w-2.5 h-2.5' />
                Exceeded: {formatCurrency(exceededTotal)}
              </span>
            </div>
          )}
        </div>

        <div
          className={`rounded-xl border p-4 ${netPL >= 0 ? "bg-emerald-50/60 border-emerald-100" : "bg-orange-50/60 border-orange-100"}`}>
          <div className='flex items-center gap-2 mb-1'>
            <Minus className={`w-3.5 h-3.5 ${netPL >= 0 ? "text-emerald-600" : "text-orange-600"}`} />
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${netPL >= 0 ? "text-emerald-600" : "text-orange-600"}`}>
              Net P&amp;L
            </span>
          </div>
          <p className={`text-lg font-bold ${netPL >= 0 ? "text-emerald-700" : "text-orange-700"}`}>
            {summaryQuery.isLoading ? <span className='text-gray-400'>—</span> : formatCurrency(Math.abs(netPL))}
          </p>
          <p className={`text-[10px] mt-0.5 ${netPL >= 0 ? "text-emerald-600" : "text-orange-600"}`}>
            {netPL >= 0 ? "Surplus" : "Deficit"}
          </p>
        </div>
      </div>

      {/* Estimate/sub-WO quantities */}
      <div className='rounded-lg border border-slate-200 bg-slate-50/40 overflow-hidden'>
        <div className='px-4 py-2.5 border-b bg-white'>
          <p className='text-[10px] font-semibold text-slate-500 uppercase tracking-widest'>
            Estimate/sub-WO quantities
          </p>
          <p className='text-[10px] text-slate-400 mt-0.5'>
            Estimated qty vs expense qty used
          </p>
        </div>
        {siteActivitiesQuery.isLoading ? (
          <div className='text-center py-6 text-gray-400 text-sm'>Loading...</div>
        ) : !siteActivitiesQuery.data || siteActivitiesQuery.data.length === 0 ? (
          <div className='text-center py-6 text-gray-400 text-sm'>No activities found.</div>
        ) : (
          <div className='bg-white divide-y divide-slate-50'>
            {siteActivitiesQuery.data.map((a: any) => {
              const estQty = getEstimateQty(a.activity);
              const usedQty = usedQtyByActivity[a.activity] ?? 0;
              const remaining = estQty !== null ? Math.max(0, estQty - usedQty) : null;
              const pct = estQty && estQty > 0 ? Math.min(100, (usedQty / estQty) * 100) : 0;
              const exhausted = remaining !== null && remaining <= 0 && estQty !== null && estQty > 0;
              return (
                <div key={a.id} className='px-4 py-2.5 space-y-1'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs text-gray-700 font-medium'>
                      {formatActivityLabel(a.activity)}
                    </span>
                    <div className='flex items-center gap-2 text-[10px] tabular-nums'>
                      <span className='text-gray-400'>{a.unit ?? "Nos"}</span>
                      {estQty !== null ? (
                        <>
                          <span className='text-gray-500'>
                            {usedQty} / {estQty}
                          </span>
                          {exhausted ? (
                            <Badge variant='outline' className='text-[9px] px-1.5 py-0 h-4 bg-orange-50 text-orange-600 border-orange-200 flex items-center gap-0.5'>
                              <AlertTriangle className='w-2 h-2' />
                              Full
                            </Badge>
                          ) : (
                            <span className='text-emerald-600 font-semibold'>{remaining} left</span>
                          )}
                        </>
                      ) : (
                        <span className='text-gray-300'>—</span>
                      )}
                    </div>
                  </div>
                  {estQty !== null && (
                    <div className='h-1 rounded-full bg-gray-100 overflow-hidden'>
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-orange-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Breakdown by type */}
      {summary && Object.keys(summary.byType).length > 0 && (
        <div className='rounded-lg border border-gray-100 bg-gray-50/40 px-4 py-3'>
          <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2'>
            Expenses by Category
          </p>
          <div className='flex flex-wrap gap-2'>
            {Object.entries(summary.byType).map(([type, total]) => {
              const Icon = EXPENSE_TYPE_ICONS[type] ?? MoreHorizontal;
              return (
                <div
                  key={type}
                  className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border bg-white text-xs'>
                  <Icon className='w-3 h-3 text-gray-500' />
                  <span className='text-gray-600'>{EXPENSE_TYPE_LABELS[type] ?? type}</span>
                  <span className='font-semibold text-gray-800'>
                    {formatCurrency(Number(total as number))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Header + Add button */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <ReceiptIndianRupee className='w-4 h-4 text-gray-400' />
          <h3 className='text-sm font-semibold text-gray-700'>Expense Records</h3>
          {expenses.length > 0 && (
            <Badge variant='outline' className='text-[10px] px-1.5 py-0 h-4 bg-gray-50'>
              {expenses.length}
            </Badge>
          )}
          {exceededTotal > 0 && (
            <Badge variant='outline' className='text-[10px] px-1.5 py-0 h-4 bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-0.5'>
              <AlertTriangle className='w-2.5 h-2.5' />
              {formatCurrency(exceededTotal)} exceeded
            </Badge>
          )}
        </div>
        <CustomButton
          text='Add Expense'
          variant='primary'
          Icon={Plus}
          onClick={() => { setEditingExpense(null); setDialogOpen(true); }}
          className='h-8 text-xs'
        />
      </div>

      {/* Expenses Table — grouped by activity */}
      {expensesQuery.isLoading ? (
        <div className='text-center py-8 text-gray-400 text-sm'>Loading expenses...</div>
      ) : expenses.length === 0 ? (
        <div className='text-center py-10 border border-dashed rounded-xl bg-gray-50/30'>
          <ReceiptIndianRupee className='w-8 h-8 text-gray-300 mx-auto mb-2' />
          <p className='text-sm text-gray-500 font-medium'>No expenses yet</p>
          <p className='text-xs text-gray-400 mt-1'>
            Click &quot;Add Expense&quot; to record the first expense for this site.
          </p>
        </div>
      ) : (
        <div className='rounded-md border border-gray-100 overflow-hidden'>
          {activityGroups.map((groupKey) => {
            const groupExpenses = groupedExpenses[groupKey] ?? [];
            const isUnlinked = groupKey === "__none__";
            const activity = activityOptions.find((a) => a.key === groupKey);
            const groupLabel = isUnlinked
              ? "Other / Unlinked Expenses"
              : (activity?.label ?? formatActivityLabel(groupKey));
            const estQty = activity?.estimateQty ?? null;
            const unit = activity?.unit ?? "Nos";
            const usedQty = usedQtyByActivity[groupKey] ?? 0;
            const remaining = estQty !== null ? Math.max(0, estQty - usedQty) : null;
            const pct = estQty && estQty > 0 ? Math.min(100, (usedQty / estQty) * 100) : 0;
            const groupTotal = groupExpenses.reduce((s, e) => s + Number(e.amount), 0);
            const exceededGroupTotal = groupExpenses
              .filter((e) => !!e.is_exceeded)
              .reduce((s, e) => s + Number(e.amount), 0);
            const isExpanded = isUnlinked || expandedActivities.has(groupKey);

            return (
              <div key={groupKey} className='border-b last:border-b-0'>
                {/* Group header */}
                <button
                  type='button'
                  onClick={() => toggleActivity(groupKey)}
                  className='w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 min-w-0'>
                      {isExpanded ? (
                        <ChevronDown className='w-3.5 h-3.5 text-slate-500 shrink-0' />
                      ) : (
                        <ChevronRight className='w-3.5 h-3.5 text-slate-500 shrink-0' />
                      )}
                      {!isUnlinked && <Layers className='w-3.5 h-3.5 text-blue-500 shrink-0' />}
                      <span className='text-xs font-semibold text-slate-700 truncate'>{groupLabel}</span>
                      <Badge variant='outline' className='text-[10px] px-1.5 py-0 h-4 bg-white shrink-0'>
                        {groupExpenses.length}
                      </Badge>
                      {exceededGroupTotal > 0 && (
                        <Badge variant='outline' className='text-[9px] px-1.5 py-0 h-4 bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-0.5 shrink-0'>
                          <AlertTriangle className='w-2 h-2' />
                          Exceeded
                        </Badge>
                      )}
                    </div>
                    <div className='flex items-center gap-3 shrink-0'>
                      {!isUnlinked && estQty !== null && (
                        <span className='text-[10px] text-slate-500'>
                          {usedQty}/{estQty} {unit} used
                        </span>
                      )}
                      <span className='text-xs font-semibold text-red-700'>
                        {formatCurrency(groupTotal)}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar under header */}
                  {!isUnlinked && estQty !== null && (
                    <div className='mt-1.5 h-1 rounded-full bg-gray-200 overflow-hidden'>
                      <div
                        className={`h-full rounded-full ${pct >= 100 ? "bg-orange-500" : pct >= 75 ? "bg-amber-400" : "bg-emerald-400"}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  )}
                </button>

                {isExpanded && (
                  <Table>
                    <TableHeader>
                      <TableRow className='bg-gray-50/50 hover:bg-gray-50/50'>
                        <TableHead className='text-xs font-semibold text-gray-600 w-[110px]'>Date</TableHead>
                        <TableHead className='text-xs font-semibold text-gray-600'>Type</TableHead>
                        <TableHead className='text-xs font-semibold text-gray-600'>Description</TableHead>
                        <TableHead className='text-xs font-semibold text-gray-600 text-center w-[70px]'>Qty</TableHead>
                        <TableHead className='text-xs font-semibold text-gray-600'>Contractor</TableHead>
                        <TableHead className='text-xs font-semibold text-gray-600'>Invoice #</TableHead>
                        <TableHead className='text-xs font-semibold text-gray-600 text-center w-[60px]'>Doc</TableHead>
                        <TableHead className='text-xs font-semibold text-gray-600 text-right'>Amount (₹)</TableHead>
                        <TableHead className='w-[70px]' />
                      </TableRow>
                    </TableHeader>
                    <TableBody>{groupExpenses.map((exp) => renderExpenseRow(exp))}</TableBody>
                  </Table>
                )}
              </div>
            );
          })}

          {/* Footer total */}
          <div className='flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t text-xs'>
            <span className='text-gray-500'>
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
              {exceededTotal > 0 && (
                <span className='text-orange-600 ml-2'>
                  · {formatCurrency(exceededTotal)} exceeded
                </span>
              )}
            </span>
            <span className='font-semibold text-red-700'>
              Total: {formatCurrency(expenseTotal)}
            </span>
          </div>
        </div>
      )}

      <AddExpenseDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        workOrderSiteId={woSiteId}
        officeId={officeId}
        editingExpense={editingExpense}
        activities={activityOptions}
        usedQtyByActivity={usedQtyByActivity}
      />

      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the expense record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-red-600 hover:bg-red-700 text-white'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SiteExpensesSection;
