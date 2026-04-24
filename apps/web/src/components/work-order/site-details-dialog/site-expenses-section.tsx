"use client";
import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
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
  Receipt,
  HardHat,
  Users,
  Package,
  Wrench,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import CustomButton from "@/components/shared/btn";
import AddExpenseDialog, { EXPENSE_TYPE_LABELS } from "./add-expense-dialog";

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

interface Expense {
  id: number;
  expense_type: string;
  contractor_id: number | null;
  contractor_name: string | null;
  description: string;
  amount: string;
  expense_date: string | Date;
  invoice_number: string | null;
  notes: string | null;
  document_url: string | null;
  document_id: string | null;
}

interface Props {
  woSiteId: number;
  officeId: number;
}

const SiteExpensesSection = ({ woSiteId, officeId }: Props) => {
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
      utils.expenseQuery.getExpenses.invalidate({
        work_order_site_id: woSiteId,
      });
      utils.expenseQuery.getExpenseSummary.invalidate({
        work_order_site_id: woSiteId,
      });
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
  const netPL = incomeTotal - expenseTotal;

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingExpense(null);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId !== null) {
      deleteExpenseMutation.mutate({ id: deletingId });
    }
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
            {summaryQuery.isLoading ? (
              <span className='text-gray-400'>—</span>
            ) : (
              formatCurrency(incomeTotal)
            )}
          </p>
          <p className='text-[10px] text-emerald-500 mt-0.5'>
            From completed activities
          </p>
        </div>

        <div className='rounded-xl border bg-red-50/60 border-red-100 p-4'>
          <div className='flex items-center gap-2 mb-1'>
            <TrendingDown className='w-3.5 h-3.5 text-red-600' />
            <span className='text-[10px] font-semibold text-red-600 uppercase tracking-wider'>
              Total Expenses
            </span>
          </div>
          <p className='text-lg font-bold text-red-700'>
            {summaryQuery.isLoading ? (
              <span className='text-gray-400'>—</span>
            ) : (
              formatCurrency(expenseTotal)
            )}
          </p>
          <p className='text-[10px] text-red-500 mt-0.5'>
            {expenses.length} expense{expenses.length !== 1 ? "s" : ""} recorded
          </p>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            netPL >= 0
              ? "bg-blue-50/60 border-blue-100"
              : "bg-orange-50/60 border-orange-100"
          }`}>
          <div className='flex items-center gap-2 mb-1'>
            <Minus
              className={`w-3.5 h-3.5 ${netPL >= 0 ? "text-blue-600" : "text-orange-600"}`}
            />
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider ${netPL >= 0 ? "text-blue-600" : "text-orange-600"}`}>
              Net P&amp;L
            </span>
          </div>
          <p
            className={`text-lg font-bold ${netPL >= 0 ? "text-blue-700" : "text-orange-700"}`}>
            {summaryQuery.isLoading ? (
              <span className='text-gray-400'>—</span>
            ) : (
              formatCurrency(Math.abs(netPL))
            )}
          </p>
          <p
            className={`text-[10px] mt-0.5 ${netPL >= 0 ? "text-blue-500" : "text-orange-500"}`}>
            {netPL >= 0 ? "Surplus" : "Deficit"}
          </p>
        </div>
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
                  <span className='text-gray-600'>
                    {EXPENSE_TYPE_LABELS[type] ?? type}
                  </span>
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
          <Receipt className='w-4 h-4 text-gray-400' />
          <h3 className='text-sm font-semibold text-gray-700'>
            Expense Records
          </h3>
          {expenses.length > 0 && (
            <Badge
              variant='outline'
              className='text-[10px] px-1.5 py-0 h-4 bg-gray-50'>
              {expenses.length}
            </Badge>
          )}
        </div>
        <CustomButton
          text='Add Expense'
          variant='primary'
          Icon={Plus}
          onClick={() => {
            setEditingExpense(null);
            setDialogOpen(true);
          }}
          className='h-8 text-xs'
        />
      </div>

      {/* Expenses Table */}
      {expensesQuery.isLoading ? (
        <div className='text-center py-8 text-gray-400 text-sm'>
          Loading expenses...
        </div>
      ) : expenses.length === 0 ? (
        <div className='text-center py-10 border border-dashed rounded-xl bg-gray-50/30'>
          <Receipt className='w-8 h-8 text-gray-300 mx-auto mb-2' />
          <p className='text-sm text-gray-500 font-medium'>No expenses yet</p>
          <p className='text-xs text-gray-400 mt-1'>
            Click &quot;Add Expense&quot; to record the first expense for this
            site.
          </p>
        </div>
      ) : (
        <div className='rounded-md border border-gray-100 overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50/50 hover:bg-gray-50/50'>
                <TableHead className='text-xs font-semibold text-gray-600 w-[110px]'>
                  Date
                </TableHead>
                <TableHead className='text-xs font-semibold text-gray-600'>
                  Type
                </TableHead>
                <TableHead className='text-xs font-semibold text-gray-600'>
                  Description
                </TableHead>
                <TableHead className='text-xs font-semibold text-gray-600'>
                  Contractor
                </TableHead>
                <TableHead className='text-xs font-semibold text-gray-600'>
                  Invoice #
                </TableHead>
                <TableHead className='text-xs font-semibold text-gray-600 text-center w-[70px]'>
                  Doc
                </TableHead>
                <TableHead className='text-xs font-semibold text-gray-600 text-right'>
                  Amount (₹)
                </TableHead>
                <TableHead className='w-[80px]' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((exp) => {
                const Icon =
                  EXPENSE_TYPE_ICONS[exp.expense_type] ?? MoreHorizontal;
                return (
                  <TableRow
                    key={exp.id}
                    className='hover:bg-blue-50/20 transition-colors'>
                    <TableCell className='text-xs text-gray-600 py-3'>
                      {format(new Date(exp.expense_date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className='py-3'>
                      <Badge
                        variant='outline'
                        className={`text-[10px] px-2 py-0.5 flex items-center gap-1 w-fit ${EXPENSE_TYPE_COLORS[exp.expense_type] ?? ""}`}>
                        <Icon className='w-2.5 h-2.5' />
                        {EXPENSE_TYPE_LABELS[exp.expense_type] ??
                          exp.expense_type}
                      </Badge>
                    </TableCell>
                    <TableCell className='py-3'>
                      <div className='flex flex-col'>
                        <span className='text-xs text-gray-800 font-medium'>
                          {exp.description}
                        </span>
                        {exp.notes && (
                          <span className='text-[10px] text-gray-400 line-clamp-1'>
                            {exp.notes}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='py-3 text-xs text-gray-600'>
                      {exp.contractor_name ?? (
                        <span className='text-gray-300'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='py-3 text-xs text-gray-500'>
                      {exp.invoice_number ?? (
                        <span className='text-gray-300'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='py-3 text-center'>
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
                            <TooltipContent
                              side='top'
                              className='text-[10px] px-2 py-1 bg-gray-900 text-white'>
                              View Document
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className='text-gray-300 text-xs'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='py-3 text-right'>
                      <span className='text-sm font-semibold text-red-700'>
                        {formatCurrency(Number(exp.amount))}
                      </span>
                    </TableCell>
                    <TableCell className='py-3'>
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
                            <TooltipContent
                              side='top'
                              className='text-[10px] px-2 py-1 bg-gray-900 text-white'>
                              Edit
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type='button'
                                onClick={() => handleDelete(exp.id)}
                                className='p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors'>
                                <Trash2 className='w-3 h-3' />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side='top'
                              className='text-[10px] px-2 py-1 bg-gray-900 text-white'>
                              Delete
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Table footer with total */}
          <div className='flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t text-xs'>
            <span className='text-gray-500'>
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
            </span>
            <span className='font-semibold text-red-700'>
              Total: {formatCurrency(expenseTotal)}
            </span>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <AddExpenseDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        workOrderSiteId={woSiteId}
        officeId={officeId}
        editingExpense={editingExpense}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the expense record. This action
              cannot be undone.
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
