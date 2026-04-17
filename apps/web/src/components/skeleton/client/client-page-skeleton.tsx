import React from "react";
import ClientInfoSkeleton from "./client-info-skeleton";
import ClientProposalSkeleton from "./client-proposal-skeleton";
import { skeletonStyle, skeletonsParentStyle } from "@/styles";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ClientPageSkeleton = () => {
  return (
    <div className='bg-gray-200/80 py-4 px-6'>
      <div className={skeletonsParentStyle}>
        <div className='w-156'>
          <Skeleton className={cn(skeletonStyle, "h-12")} />
        </div>
        <ClientInfoSkeleton />
        <ClientProposalSkeleton />
      </div>
    </div>
  );
};

export default ClientPageSkeleton;
