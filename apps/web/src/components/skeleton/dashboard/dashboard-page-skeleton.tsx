import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { skeletonStyle, skeletonsParentStyle } from "@/styles";

const DashboardPageSkeleton = () => {
  return (
    <div className={cn(skeletonsParentStyle, "mt-6 pr-4")}>
      <div className='grid gap-4 md:grid-cols-2'>
        <Skeleton className={cn(skeletonStyle, "h-50")} />
        <Skeleton className={cn(skeletonStyle, "h-50")} />
      </div>

      <div>
        <Skeleton className='h-5 w-24 bg-white' />
        <div className='mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(skeletonStyle, "h-24")}
            />
          ))}
        </div>
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <Skeleton className={cn(skeletonStyle, "h-50 lg:col-span-2")} />
        <Skeleton className={cn(skeletonStyle, "h-50")} />
      </div>
    </div>
  );
};

export default DashboardPageSkeleton;
