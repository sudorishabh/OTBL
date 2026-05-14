import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { skeletonsParentStyle, skeletonStyle } from "@/styles";
import { cn } from "@/lib/utils";

const OfficeSitePageSkeleton = () => {
  return (
    <div className={skeletonsParentStyle}>
      <div className='w-2/5 mt-8 flex items-center gap-4'>
        <Skeleton className={cn(skeletonStyle, "h-8 w-[65%]")} />
        <Skeleton className={cn(skeletonStyle, "h-8 w-[35%]")} />
      </div>
      <Skeleton className={cn(skeletonStyle, "h-64")} />
      <Skeleton className={cn(skeletonStyle, "h-64")} />
    </div>
  );
};

export default OfficeSitePageSkeleton;
