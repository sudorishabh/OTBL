import { skeletonStyle, skeletonsParentStyle } from "@/styles";
import React from "react";
import TableRowSkeleton from "../table-row-skeleton";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const WorkOrdersSkeleton = () => {
  return (
    <div className={cn(skeletonsParentStyle, "mt-8")}>
      <div className='w-167'>
        <Skeleton className={cn(skeletonStyle, "h-8")} />
      </div>
      <TableRowSkeleton />
      <TableRowSkeleton />
      <TableRowSkeleton />
      <TableRowSkeleton />
      <TableRowSkeleton />
      <TableRowSkeleton />
    </div>
  );
};

export default WorkOrdersSkeleton;
