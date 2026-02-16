import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { skeletonsParentStyle, skeletonStyle } from "@/styles";
import { cn } from "@/lib/utils";

const ClientProposalSkeleton = () => {
  return (
    <div
      className={cn(skeletonsParentStyle, "flex items-center flex-row gap-6")}>
      <div className='w-4/6 flex flex-col gap-4'>
        <Skeleton className={cn(skeletonStyle, "h-60")} />
        <Skeleton className={cn(skeletonStyle, "h-16")} />
      </div>
      <div className='w-2/6 flex flex-col gap-4'>
        <Skeleton className={cn(skeletonStyle, "h-60")} />
        <Skeleton className={cn(skeletonStyle, "h-16")} />
      </div>
    </div>
  );
};

export default ClientProposalSkeleton;
