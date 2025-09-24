import React from "react";

const PageLoading = () => {
  return (
    <div
      className='min-h-screen z-50 grid place-items-center bg-white/70 backdrop-blur-sm'
      role='status'
      aria-live='polite'
      aria-busy='true'>
      <div className='flex flex-col items-center gap-4'>
        <div className='relative'>
          <div className='size-9 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin' />
        </div>
        <p className='text-sm text-muted-foreground'>Loading, please wait…</p>
      </div>
    </div>
  );
};

export default PageLoading;
