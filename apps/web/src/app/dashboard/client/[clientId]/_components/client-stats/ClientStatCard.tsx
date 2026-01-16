import { ArrowUpRight } from "lucide-react";
import React from "react";

interface Props {
  Icon: React.ElementType;
  title: string;
  stat: string | number;
  openDialog: boolean;
  setOpenDialog: (openDialog: boolean) => void;
}

const OfficeStatCard = ({
  Icon,
  stat,
  title,
  openDialog,
  setOpenDialog,
}: Props) => {
  return (
    <div
      className='rounded-xl border p-4 bg-linear-to-br from-white to-gray-50 shadow hover:shadow-md transition-shadow group hover:border-emerald-400 cursor-pointer'
      onClick={() => setOpenDialog(!openDialog)}>
      <div className='flex items-center justify-between'>
        <div className='text-sm flex items-center gap-1.5 text-gray-500'>
          <Icon className='size-3.5 text-gray-600' />
          {title}
        </div>
        <div className='h-8 w-8 rounded-full bg-white border group-hover:border-0 flex items-center justify-center group-hover:bg-emerald-600 relative'>
          <ArrowUpRight className='h-4 w-4 text-emerald-700 group-hover:text-white' />
        </div>
      </div>
      <div className='mt-2 text-3xl font-semibold text-gray-700'>{stat}</div>
    </div>
  );
};

export default OfficeStatCard;
