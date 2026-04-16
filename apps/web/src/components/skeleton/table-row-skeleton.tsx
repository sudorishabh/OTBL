import React from "react";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { skeletonStyle } from "@/styles";

const TableRowSkeleton = () => {
  return <Skeleton className={cn(skeletonStyle, "h-16")} />;
};

export default TableRowSkeleton;
