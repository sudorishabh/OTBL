"use client";
import React from "react";
import dynamic from "next/dynamic";
import PageLoading from "@/components/loading/PageLoading";
import { Suspense } from "react";

const WorkOrder = dynamic(() => import("@/components/work-order/work-order"));

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
