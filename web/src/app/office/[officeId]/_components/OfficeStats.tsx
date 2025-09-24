import { ArrowUpRight, CheckCircle2, IndianRupee, MapPin } from "lucide-react";
import React from "react";

interface Props {
  stats:
    | {
        siteCount: number;
        completedWorkOrders: number;
        totalBudgetAmount: number;
        totalExpenseAmount: number;
      }
    | undefined;
}

const OfficeStats = ({ stats }: Props) => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
      <div className='rounded-xl border p-4 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow ring-1 ring-gray-100 group hover:border-emerald-400 cursor-pointer'>
        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-500'>Total Sites</div>
          <div className='h-8 w-8 rounded-full bg-white border group-hover:border-0 flex items-center justify-center group-hover:bg-emerald-600 relative'>
            <MapPin className='h-4 w-4 text-gray-600 group-hover:hidden' />
            <ArrowUpRight className='h-4 w-4 text-white hidden group-hover:block' />
          </div>
        </div>
        <div className='mt-2 text-3xl font-semibold text-gray-900'>
          {stats ? Number(stats.siteCount).toLocaleString() : 0}
        </div>
      </div>

      <div className='rounded-xl border p-4 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-lg transition-shadow ring-1 ring-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-500'>Completed Work Orders</div>
          <div className='h-8 w-8 rounded-full bg-white border flex items-center justify-center'>
            <CheckCircle2 className='h-4 w-4 text-green-600' />
          </div>
        </div>
        <div className='mt-2 text-3xl font-semibold text-gray-900'>
          {stats ? Number(stats.completedWorkOrders).toLocaleString() : 0}
        </div>
      </div>
      <div className='rounded-xl border p-4 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-lg transition-shadow ring-1 ring-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-500'>Total Budget</div>
          <div className='h-8 w-8 rounded-full bg-white border flex items-center justify-center'>
            <IndianRupee className='h-4 w-4 text-emerald-700' />
          </div>
        </div>
        <div className='mt-2 text-3xl font-semibold text-gray-900 inline-flex items-center gap-1'>
          <IndianRupee className='h-4 w-4 text-emerald-600/60' />
          {stats ? Number(stats.totalBudgetAmount).toLocaleString() : 0}
        </div>
      </div>
      <div className='rounded-xl border p-4 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-lg transition-shadow ring-1 ring-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-500'>Total Expense</div>
          <div className='h-8 w-8 rounded-full bg-white border flex items-center justify-center'>
            <IndianRupee className='h-4 w-4 text-rose-700' />
          </div>
        </div>
        <div className='mt-2 text-3xl font-semibold text-gray-900 inline-flex items-center gap-1'>
          <IndianRupee className='h-4 w-4 text-rose-600/60' />
          {stats ? Number(stats.totalExpenseAmount).toLocaleString() : 0}
        </div>
      </div>
    </div>
  );
};

export default OfficeStats;
