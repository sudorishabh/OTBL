import React from "react";

interface Props {
  Icon: React.ElementType;
  title: string;
  stat: string | number;
}

const WorkOrderStatCard = ({
  Icon,
  stat,
  title,
}: Props) => {
  return (
    <div
      className='rounded-xl border p-4 bg-linear-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow hover:border-emerald-400'>
      <div className='flex items-center justify-between'>
        <div className='text-sm flex items-center gap-1.5 text-gray-500'>
          <Icon className='size-3.5 text-gray-600' />
          {title}
        </div>
      </div>
      <div className='mt-2 text-2xl font-semibold text-gray-700'>{stat}</div>
    </div>
  );
};

export default WorkOrderStatCard;
