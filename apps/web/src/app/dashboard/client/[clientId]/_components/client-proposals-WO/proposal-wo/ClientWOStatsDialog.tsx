"use client";
import React from "react";
import DialogWindow from "@/components/shared/dialog-window";
import useHandleParams from "@/hooks/useHandleParams";
import { trpc } from "@/lib/trpc";
import { Loader2, Briefcase, TrendingUp, AlertCircle } from "lucide-react";
import { capitalFirstLetter } from "@pkg/utils";
import { Badge } from "@/components/ui/badge";

interface WorkOrder {
  id: number;
  code: string;
  title: string;
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface Props {
  ongoingWOs: WorkOrder[];
  completedWOs: WorkOrder[];
}

const formatCurrency = (amount: string | number) => {
  const val = Number(amount);
  if (isNaN(val)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(val);
};

const WOStatRow = ({ wo }: { wo: WorkOrder }) => {
  const { data, isLoading } = trpc.workOrderQuery.getWorkOrderDetails.useQuery(
    { id: wo.id },
    { enabled: !!wo.id },
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-4'>
        <Loader2 className='h-4 w-4 animate-spin text-emerald-500' />
      </div>
    );
  }

  if (!data) {
    return (
      <div className='flex items-center p-4 text-xs text-red-500'>
        <AlertCircle className='w-4 h-4 mr-2' />
        Failed to load stats
      </div>
    );
  }

  const scheduleOfRates = data.scheduleOfRates || [];
  const sites = data.sites || [];

  const grandTotal = scheduleOfRates.reduce(
    (acc: number, curr: any) => acc + Number(curr.total_cost || 0),
    0,
  );

  const totalSiteCompletions = sites.reduce((acc: number, site: any) => {
    return (
      acc +
      (site.completions || []).reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sAcc: number, comp: any) => sAcc + Number(comp.amount || 0),
        0,
      )
    );
  }, 0);

  const spendingPct =
    grandTotal > 0
      ? Math.min(100, (totalSiteCompletions / grandTotal) * 100)
      : 0;

  return (
    <div className='flex flex-col gap-3 p-4 border rounded-xl bg-white shadow-sm hover:border-emerald-200 transition-colors'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-slate-50 rounded-lg'>
            <Briefcase className='w-5 h-5 text-emerald-600' />
          </div>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <span className='inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-mono font-medium ring-1 ring-emerald-200'>
                {wo.code}
              </span>
              <Badge
                variant='outline'
                className='text-[10px] bg-slate-50'>
                {capitalFirstLetter(wo.status)}
              </Badge>
            </div>
            <h4 className='text-sm font-semibold text-gray-800 line-clamp-1'>
              {wo.title}
            </h4>
          </div>
        </div>
      </div>

      <div className='mt-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3'>
        <div className='flex items-center justify-between mb-3'>
          <div>
            <span className='text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-0.5'>
              Total Spent (Completions)
            </span>
            <p className='text-sm font-bold text-emerald-700'>
              {formatCurrency(totalSiteCompletions)}
            </p>
          </div>
          <div className='text-right'>
            <span className='text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-0.5'>
              SOR Budget
            </span>
            <p className='text-sm font-bold text-slate-700'>
              {formatCurrency(grandTotal)}
            </p>
          </div>
        </div>

        <div className='flex items-center justify-between mb-1.5 mt-2'>
          <span className='text-[10px] font-medium text-slate-500'>
            Utilization
          </span>
          <span
            className={`text-xs font-bold ${
              spendingPct >= 100
                ? "text-red-600"
                : spendingPct >= 80
                  ? "text-amber-600"
                  : "text-emerald-600"
            }`}>
            {spendingPct.toFixed(1)}%
          </span>
        </div>
        <div className='h-1.5 bg-slate-200 rounded-full overflow-hidden'>
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              spendingPct >= 100
                ? "bg-red-500"
                : spendingPct >= 80
                  ? "bg-amber-500"
                  : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, spendingPct)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const ClientWOStatsDialog = ({ ongoingWOs, completedWOs }: Props) => {
  const { getParam, deleteParam } = useHandleParams();
  const isOpen = getParam("dialog") === "client-wo-stats";

  const allWOs = [...completedWOs, ...ongoingWOs];

  return (
    <DialogWindow
      title='Work Order Spending Details'
      description='Compare completion expenses against SOR budget'
      open={isOpen}
      setOpen={() => deleteParam("dialog")}
      size='2xl'>
      <div className='space-y-6 pb-6 pt-2 h-[60vh] overflow-y-auto pr-1'>
        {allWOs.length === 0 ? (
          <div className='flex flex-col items-center justify-center p-10 text-center'>
            <TrendingUp className='w-10 h-10 text-slate-300 mb-3' />
            <p className='text-sm font-medium text-slate-600'>
              No work orders available
            </p>
            <p className='text-xs text-slate-400'>
              There are no ongoing or completed work orders to display stats
              for.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {allWOs.map((wo) => (
              <WOStatRow
                key={wo.id}
                wo={wo}
              />
            ))}
          </div>
        )}
      </div>
    </DialogWindow>
  );
};

export default ClientWOStatsDialog;
