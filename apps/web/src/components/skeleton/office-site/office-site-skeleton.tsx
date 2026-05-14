import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { skeletonStyle, skeletonsParentStyle } from "@/styles";
import React from "react";

const OfficeSiteSkeleton = () => {
  return (
    <div className={skeletonsParentStyle}>
      <Skeleton className={cn(skeletonStyle, "h-14")} />
      <Skeleton className={cn(skeletonStyle, "h-52")} />
      <Skeleton className={cn(skeletonStyle, "h-14")} />
      <Skeleton className={cn(skeletonStyle, "h-52")} />
    </div>
  );
};

export default OfficeSiteSkeleton;
