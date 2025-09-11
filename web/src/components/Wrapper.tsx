import React from "react";

interface Props {
  children: React.ReactNode;
  title?: string;
  description?: string;
  button?: React.ReactNode;
}

const Wrapper = ({ children, title, description, button }: Props) => {
  return (
    <div className='py-4 px-6'>
      <div className='flex items-center justify-between border-b-[0.5px] border-gray-200'>
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
