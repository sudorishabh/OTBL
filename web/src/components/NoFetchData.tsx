import React from "react";
import CustomIcon from "./CustomIcon";

interface Props {
  Icon: React.ElementType;
  title: string;
  description: string;
}

const NoFetchData = ({ Icon, title, description }: Props) => {
  return (
    <div className='flex flex-col items-center justify-center min-h-80 p-8 mt-10 bg-gradient-to-b from-gray-50/50 to-white border border-gray-100/50 rounded shadow'>
      <div className='flex items-center justify-center w-16 h-16 mb-6 bg-white rounded-full shadow-md border border-gray-100'>
        <CustomIcon
          Insert={Icon}
          size={32}
          className='text-gray-600'
        />
      </div>

      <div className='text-center space-y-1 max-w-sm'>
        <h3 className='text-xl font-semibold text-gray-900 tracking-tight'>
          {title}
        </h3>

        <p className='text-sm text-gray-600 leading-relaxed'>{description}</p>

        {/* Status indicator */}
        <div className='inline-flex items-center px-3 py-1 mt-8 rounded-full bg-gray-100 border border-gray-200'>
          <div className='w-2 h-2 bg-gray-400 rounded-full mr-2'></div>
          <span className='text-xs font-medium text-gray-700'>
            No data available
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoFetchData;
