"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BuildingPatterns } from "./building-patterns";

interface Props {
  children: React.ReactNode;
  title?: string;
  description?: string;
  button?: React.ReactNode;
  backClick?: () => void;
}

export const PageWrapper = ({
  children,
  title,
  description,
  button,
  backClick,
}: Props) => {
  return (
    <div className='relative overflow-hidden py-4 px-6 bg-gray-200/80 min-h-screen'>
      <BuildingPatterns />

      <div className='relative z-10 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          {backClick && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='bg-white hover:bg-gray-50 shadow/5 hover:shadow cursor-pointer rounded-full size-8 transition-all duration-300'
              aria-label='Go back'
              onClick={backClick}>
              <ArrowLeft className='size-4' />
            </Button>
          )}
          <div>
            {title && (
              <h1 className='text-xl font-bold text-cyan-800'>{title}</h1>
            )}
            {description && (
              <p className='text-sm text-gray-500 font-medium'>{description}</p>
            )}
          </div>
        </div>
        {button && button}
      </div>
      <div className='relative z-10'>{children}</div>
    </div>
  );
};

