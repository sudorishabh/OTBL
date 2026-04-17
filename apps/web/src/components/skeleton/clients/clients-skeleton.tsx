import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { skeletonStyle, skeletonsParentStyle } from "@/styles";

const ClientsSkeleton = () => {
  return (
    <div className={skeletonsParentStyle}>
      <Skeleton className={cn(skeletonStyle, "h-68")} />
      <Skeleton className={cn(skeletonStyle, "h-68")} />
    </div>
  );
};

export default ClientsSkeleton;
