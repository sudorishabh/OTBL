import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { skeletonsParentStyle, skeletonStyleGray } from "@/styles";
import { cn } from "@/lib/utils";

const ClientSitesSkeleton = () => {
  return (
    <div className={cn(skeletonsParentStyle, "gap-4")}>
      <Skeleton className={cn(skeletonStyleGray, "h-14")} />
      <Skeleton className={cn(skeletonStyleGray, "h-14")} />
      <Skeleton className={cn(skeletonStyleGray, "h-14")} />
    </div>
  );
};

export default ClientSitesSkeleton;
