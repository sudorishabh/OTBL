import React from "react";

interface Props {
  children: React.ReactNode;
  title?: string;
  description?: string;
  button?: React.ReactNode;
}

const Wrapper = ({ children, title, description, button }: Props) => {
  return (
    <div className='py-4 px-6 bg-[#f4f6f9] min-h-screen'>
      <div className='flex items-center justify-between'>
        <div>
          {title && (
            <h1 className='text-2xl font-bold text-gray-800'>{title}</h1>
          )}
          {description && (
            <p className='text-sm text-gray-500'>{description}</p>
          )}
        </div>
        {button && button}
      </div>
      {children}
    </div>
  );
};

export default Wrapper;
