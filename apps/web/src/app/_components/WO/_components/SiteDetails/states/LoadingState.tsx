"use client";
import React from "react";
import { Loader2 } from "lucide-react";

type LoadingStateProps = {
  message?: string;
};

const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
}) => (
  <div className='flex flex-col items-center justify-center py-12'>
    <Loader2 className='w-8 h-8 animate-spin text-blue-500 mb-3' />
    <p className='text-muted-foreground text-sm'>{message}</p>
  </div>
);

export default LoadingState;
