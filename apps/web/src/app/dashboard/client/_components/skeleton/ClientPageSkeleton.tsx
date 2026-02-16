import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { skeletonStyle, skeletonsParentStyle } from "@/styles";

const ClientPageSkeleton = () => {
  return (
    <div className={skeletonsParentStyle}>
      <Skeleton className={cn(skeletonStyle, "h-28")} />
      <Skeleton className={cn(skeletonStyle, "h-28")} />
      <Skeleton className={cn(skeletonStyle, "h-28")} />
      <Skeleton className={cn(skeletonStyle, "h-28")} />
    </div>
  );
};

export default ClientPageSkeleton;
