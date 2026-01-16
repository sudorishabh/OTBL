"use client";
import WorkOrder from "@/app/_components/WO/WorkOrder";
import React from "react";

type PageProps = {
  params: Promise<{ workOrderId: string }>;
};

const WorkOrderPage = ({ params }: PageProps) => {
  const { workOrderId } = React.use(params);
  return <WorkOrder workOrderId={workOrderId} />;
};
export default WorkOrderPage;
