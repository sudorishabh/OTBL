import React from "react";
import { skeletonStyle, skeletonsParentStyle } from "@/styles";
import TableRowSkeleton from "../table-row-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const UserPageSkeleton = () => {
  return (
    <div className={cn(skeletonsParentStyle, "mt-8")}>
      <div className='w-156'>
        <Skeleton className={cn(skeletonStyle, "h-9")} />
      </div>

      <TableRowSkeleton />
      <TableRowSkeleton />
      <TableRowSkeleton />
      <TableRowSkeleton />
      <TableRowSkeleton />
      <TableRowSkeleton />
      <TableRowSkeleton />
    </div>
  );
};

export default UserPageSkeleton;
