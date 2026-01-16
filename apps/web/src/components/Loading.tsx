import { cn } from "@/lib/utils";
import React from "react";

interface Props {
  py?: string;
}

const Loading = ({ py }: Props) => {
  return (
    <div
      className={cn(
        " z-50 grid place-items-center rounded-md bg-white backdrop-blur-sm",
        py ? py : "py-32"
      )}
      role='status'
      aria-live='polite'
      aria-busy='true'>
      <div className='flex flex-col items-center gap-4'>
        <div className='relative'>
          <div className='size-8 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin' />
        </div>
        <p className='text-sm text-muted-foreground'>Loading, please wait…</p>
      </div>
    </div>
  );
};

export default Loading;
