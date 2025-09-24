import { IndianRupee } from "lucide-react";
import React from "react";

interface Props {
  title: string;
  code: string;
  description: string;
  budget_amount: number;
  expense_amount: number;
}

const CompletedWOCard = ({
  budget_amount,
  code,
  description,
  expense_amount,
  title,
}: Props) => {
  return (
    <div className='flex flex-col rounded-lg border bg-white px-3 py-3 shadow-sm hover:shadow-md transition-shadow'>
      <div className='flex items-center justify-between'>
        <h2 className='font-semibold text-sm text-gray-900'>{title}</h2>
        <p className='text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border'>
          {code}
        </p>
      </div>
      <div className='mt-1.5'>
        <p className='text-sm text-gray-600 line-clamp-1'>{description}</p>
      </div>
      <div className='grid grid-cols-2 gap-2 mt-3'>
        <div className='p-3 rounded-lg border bg-gray-50 flex flex-col gap-1'>
          <h3 className='text-[11px] uppercase tracking-wide text-gray-500'>
            Budget Amount
          </h3>
          <p className='text-sm font-semibold text-gray-900 inline-flex items-center gap-1'>
            <IndianRupee className='h-3.5 w-3.5 opacity-70' /> 3,{budget_amount}
          </p>
        </div>
        <div className='p-3 rounded-lg border bg-gray-50 flex flex-col gap-1'>
          <h3 className='text-[11px] uppercase tracking-wide text-gray-500'>
            Expense Amount
          </h3>
          <p className='text-sm font-semibold text-gray-900 inline-flex items-center gap-1'>
            <IndianRupee className='h-3.5 w-3.5 opacity-70' /> 56,
            {expense_amount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompletedWOCard;
