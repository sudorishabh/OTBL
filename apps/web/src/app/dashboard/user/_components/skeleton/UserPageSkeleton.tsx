import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { skeletonsParentStyle, skeletonStyle } from "@/styles";
import { cn } from "@/lib/utils";

const UserPageSkeleton = () => {
  return (
    <div className={skeletonsParentStyle}>
      {/* <div className='w-2/5'>
        <Skeleton className={cn(skeletonStyle, "h-6")} />
      </div> */}

      <Skeleton className={cn(skeletonStyle, "h-16")} />
      <Skeleton className={cn(skeletonStyle, "h-16")} />
      <Skeleton className={cn(skeletonStyle, "h-16")} />
      <Skeleton className={cn(skeletonStyle, "h-16")} />
      <Skeleton className={cn(skeletonStyle, "h-16")} />
      <Skeleton className={cn(skeletonStyle, "h-16")} />
      <Skeleton className={cn(skeletonStyle, "h-16")} />
    </div>
  );
};

export default UserPageSkeleton;
