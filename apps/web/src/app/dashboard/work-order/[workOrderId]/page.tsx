import WorkOrder from "@/app/_components/WO/WorkOrder";
import useHandleParams from "@/hooks/useHandleParams";
import React, { useEffect } from "react";

type PageProps = {
  params: Promise<{ workOrderId: string }>;
};

const WorkOrderPage = ({ params }: PageProps) => {
  const { workOrderId } = React.use(params);
  const { setParam } = useHandleParams();

  useEffect(() => {
    setParam("from", "list");
  }, [workOrderId]);

  return (
    <WorkOrder
      workOrderId={workOrderId}
      from='list'
    />
  );
};

export default WorkOrderPage;
