import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { skeletonsParentStyle, skeletonStyle } from "@/styles";
import { cn } from "@/lib/utils";

const OfficeClientPageSkeleton = () => {
  return (
    <div className={skeletonsParentStyle}>
      <div className='w-2/5 mt-8'>
        <Skeleton className={cn(skeletonStyle, "h-8")} />
      </div>

      <Skeleton className={cn(skeletonStyle, "h-14")} />
      <Skeleton className={cn(skeletonStyle, "h-52")} />
      <Skeleton className={cn(skeletonStyle, "h-14")} />
      <Skeleton className={cn(skeletonStyle, "h-52")} />
    </div>
  );
};

export default OfficeClientPageSkeleton;
