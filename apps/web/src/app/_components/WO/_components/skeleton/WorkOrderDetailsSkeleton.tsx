import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { skeletonsParentStyle, skeletonStyle } from "@/styles";
import { cn } from "@/lib/utils";

const WorkOrderDetailsSkeleton = () => {
  return (
    <div className={skeletonsParentStyle}>
      <Skeleton className={cn(skeletonStyle, "h-64")} />
      <Skeleton className={cn(skeletonStyle, "h-24")} />
      <Skeleton className={cn(skeletonStyle, "h-24")} />
    </div>
  );
};

export default WorkOrderDetailsSkeleton;
