import { CalendarDays, IndianRupee } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface Props {
  title: string;
  code: string;
  description: string;
  budget_amount: number;
  date?: string;
  id: number;
}

const ActiveWOCard = ({
  budget_amount,
  code,
  description,
  title,
  date,
  id,
}: Props) => {
  const router = useRouter();
  return (
    <div
      className='flex flex-col rounded-lg border px-3 py-3 bg-gray-50 hover:shadow transition-shadow cursor-pointer'
      onClick={() => router.push(`/work-order/${id}`)}>
      <div className='flex items-center justify-between'>
        <h2 className='font-semibold line-clamp-1 text-sm text-gray-700'>
          {title || "Untitled Work Order"}
        </h2>
        <p className='text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-nowrap'>
          {code}
        </p>
      </div>
      <div className='mt-1.5'>
        <p className='text-sm text-gray-500 line-clamp-1'>{description}</p>
      </div>
      <div className='grid grid-cols-2 gap-2 mt-3'>
        <div className='p-3 rounded-lg border bg-white flex flex-col gap-1'>
          <h3 className='text-[11px] uppercase tracking-wide text-gray-500'>
            Budget Amount
          </h3>
          <p className='text-sm font-semibold text-gray-900 inline-flex items-center gap-1'>
            <IndianRupee className='h-3.5 w-3.5 opacity-70' />{" "}
            {budget_amount?.toLocaleString?.() ?? budget_amount}
          </p>
        </div>
        <div className='p-3 rounded-lg border bg-white flex flex-col gap-1'>
          <h3 className='text-[11px] uppercase tracking-wide text-gray-500'>
            Planned Date
          </h3>
          <p className='text-sm font-medium text-gray-800 inline-flex items-center gap-1'>
            <CalendarDays className='h-3.5 w-3.5 opacity-70' /> {date || "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActiveWOCard;
