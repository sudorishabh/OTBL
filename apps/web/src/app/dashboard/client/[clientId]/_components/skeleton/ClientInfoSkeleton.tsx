import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { skeletonsParentStyle, skeletonStyle } from "@/styles";
import { cn } from "@/lib/utils";

const ClientInfoSkeleton = () => {
  return (
    <div className={skeletonsParentStyle}>
      <Skeleton className={cn(skeletonStyle, "h-[54px]")} />
      <Skeleton className={cn(skeletonStyle, "h-[53px]")} />
      <Skeleton className={cn(skeletonStyle, "h-[54px]")} />
      <Skeleton className={cn(skeletonStyle, "h-[53px]")} />
    </div>
  );
};

export default ClientInfoSkeleton;
