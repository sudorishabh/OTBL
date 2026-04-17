import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { skeletonStyle, skeletonsParentStyle } from "@/styles";

const ClientsPageSkeleton = () => {
  return (
    <div className={skeletonsParentStyle}>
      <div className='w-120 mt-8'>
        <Skeleton className={cn(skeletonStyle, "h-8")} />
      </div>
      <Skeleton className={cn(skeletonStyle, "h-68")} />
      <Skeleton className={cn(skeletonStyle, "h-68")} />
    </div>
  );
};

export default ClientsPageSkeleton;
