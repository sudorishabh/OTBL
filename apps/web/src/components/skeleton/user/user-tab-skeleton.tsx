import React from "react";
import { skeletonsParentStyle } from "@/styles";
import TableRowSkeleton from "../table-row-skeleton";

const UserTabSkeleton = () => {
  return (
    <div className={skeletonsParentStyle}>
      {/* <div className='w-2/5'>
        <Skeleton className={cn(skeletonStyle, "h-6")} />
      </div> */}

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

export default UserTabSkeleton;
