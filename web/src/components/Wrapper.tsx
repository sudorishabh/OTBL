import React from "react";
import { Separator } from "./ui/separator";

interface Props {
  children: React.ReactNode;
  title?: string;
  description?: string;
  button?: React.ReactNode;
}

const Wrapper = ({ children, title, description, button }: Props) => {
  return (
    <div className='py-4 px-6'>
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
      <Separator className='my-0.5' />
      {children}
    </div>
  );
};

export default Wrapper;
