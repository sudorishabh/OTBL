"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Props {
  children: React.ReactNode;
  title?: string;
  description?: string;
  button?: React.ReactNode;
  backClick?: () => void;
}

const Wrapper = ({
  children,
  title,
  description,
  button,
  backClick,
}: Props) => {
  return (
    <div className='py-4 px-6 bg-[#f4f6f9] min-h-screen'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {backClick && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='bg-white shadow-sm cursor-pointer text- rounded-full size-9'
              aria-label='Go back'
              onClick={backClick}>
              <ArrowLeft className='size-4' />
            </Button>
          )}
          <div>
            {title && (
              <h1 className='text-2xl font-bold text-gray-800'>{title}</h1>
            )}
            {description && (
              <p className='text-sm text-gray-500'>{description}</p>
            )}
          </div>
        </div>
        {button && button}
      </div>
      {children}
    </div>
  );
};

export default Wrapper;
