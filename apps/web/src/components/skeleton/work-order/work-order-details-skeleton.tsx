import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { skeletonsParentStyle, skeletonStyle } from "@/styles";
import { cn } from "@/lib/utils";

const WorkOrderDetailsSkeleton = () => {
  return (
    <div className='bg-gray-200/80 h-screen py-4 px-6'>
      <div className={skeletonsParentStyle}>
        <Skeleton className={cn(skeletonStyle, "h-64")} />
        <Skeleton className={cn(skeletonStyle, "h-22")} />
        <Skeleton className={cn(skeletonStyle, "h-22")} />
        <Skeleton className={cn(skeletonStyle, "h-44")} />
      </div>
    </div>
  );
};

export default WorkOrderDetailsSkeleton;
