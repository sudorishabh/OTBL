"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import PageLoading from "@/components/loading/PageLoading";
import { Suspense } from "react";
import useHandleParams from "@/hooks/useHandleParams";

const WorkOrder = dynamic(() => import("@/app/_components/WO/WorkOrder"));

type PageProps = {
  params: Promise<{ workOrderId: string }>;
};

const WorkOrderPage = ({ params }: PageProps) => {
  const { workOrderId } = React.use(params);

  return (
    <Suspense fallback={<PageLoading />}>
      <WorkOrder
        workOrderId={workOrderId}
        from='client'
      />
    </Suspense>
  );
};
export default WorkOrderPage;
