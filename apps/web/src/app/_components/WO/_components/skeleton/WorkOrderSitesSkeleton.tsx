import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { skeletonsParentStyle, skeletonStyle } from "@/styles";
import { cn } from "@/lib/utils";

const WorkOrderSitesSkeleton = () => {
  return (
    <div className={cn(skeletonsParentStyle, "grid grid-cols-3 gap-4")}>
      <Skeleton className={cn(skeletonStyle, "h-44")} />
      <Skeleton className={cn(skeletonStyle, "h-44")} />
      <Skeleton className={cn(skeletonStyle, "h-44")} />
    </div>
  );
};

export default WorkOrderSitesSkeleton;
