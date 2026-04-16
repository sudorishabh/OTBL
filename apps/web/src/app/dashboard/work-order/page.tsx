"use client";
import { PageWrapper } from "@/components/wrapper/page-wrapper";
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import CustomButton from "@/components/shared/btn";
import WorkOrderTable from "./_components/WorkOrderTable";
import { trpc } from "@/lib/trpc";
import PageLoading from "@/components/loading/PageLoading";
import { useWorkOrderManagementContext } from "@/contexts/WorkOrderManagementContext";
import WorkOrderSearchNFilter from "./_components/WorkOrderSearchNFilter";
import { workOrderTypes } from "@pkg/schema";
import { IWorkOrder } from "@/types/work-order.types";

const WorkOrdersContent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [allWorkOrdersList, setAllWorkOrdersList] = useState<IWorkOrder[]>([]);

  const { searchQuery, filters, workOrderOrder } =
    useWorkOrderManagementContext();

  const allWorkOrdersQueryLimit = 40;
  const getAllWorkOrdersQuery = trpc.workOrderQuery.getAll.useQuery({
    page: currentPage,
    limit: allWorkOrdersQueryLimit,
    searchQuery: searchQuery || undefined,
    status: filters.status,
    office_id: filters.office_id,
    workOrderOrder,
  });

  const isAllWorkOrderQueryLoading = getAllWorkOrdersQuery.isLoading;
  const { workOrders, pagination } = getAllWorkOrdersQuery?.data || {
    workOrders: [],
    pagination: null,
  };

  const isInitialLoading =
    isAllWorkOrderQueryLoading &&
    currentPage === 1 &&
    searchQuery === "" &&
    filters.status === "all" &&
    filters.office_id === undefined &&
    workOrderOrder === "latest";

  const isFetchingMore = getAllWorkOrdersQuery.isFetching && currentPage > 1;

  useEffect(() => {
    setCurrentPage(1);
    setAllWorkOrdersList([]);
  }, [searchQuery, filters.status, filters.office_id]);

  useEffect(() => {
    if (!workOrders || isAllWorkOrderQueryLoading) return;
    if (pagination?.page !== currentPage) return;

    if (currentPage === 1) {
      setAllWorkOrdersList(workOrders);
    } else {
      setAllWorkOrdersList((prev) => [...prev, ...workOrders]);
    }
  }, [workOrders, currentPage, isAllWorkOrderQueryLoading]);

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  if (isInitialLoading) {
    return <PageLoading />;
  }

  return (
    <PageWrapper
      title='Work Order Management'
      description='Manage work orders, track their progress across offices and sites'
      button={
        <CustomButton
          text='Add Work Order'
          Icon={Plus}
          onClick={() => {
            // TODO: Implement add work order dialog
            console.log("Add work order clicked");
          }}
          variant='primary'
        />
      }>
      <div className='w-full mt-8'>
        <div className='flex justify-between items-center flex-1 mb-4'>
          <WorkOrderSearchNFilter />
        </div>

        <WorkOrderTable
          workOrders={allWorkOrdersList}
          pagination={pagination}
          handleLoadMore={handleLoadMore}
          isLoadingData={isFetchingMore}
        />
      </div>
    </PageWrapper>
  );
};

const WorkOrders = () => {
  return (
    <React.Suspense fallback={<div>Loading work orders...</div>}>
      <WorkOrdersContent />
    </React.Suspense>
  );
};

export default WorkOrders;
