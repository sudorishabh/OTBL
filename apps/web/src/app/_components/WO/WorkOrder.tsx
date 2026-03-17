"use client";
import React, { useState, useEffect } from "react";
import { PageWrapper } from "@/components/wrapper/PageWrapper";
import { trpc } from "@/lib/trpc";
import { capitalFirstLetter } from "@pkg/utils";
import { useRouter } from "next/navigation";
import WorkOrderDetailsCard from "./_components/WorkOrderDetailsCard";
import { File, Plus, Rows3 } from "lucide-react";
import ScheduleOfRatesTable from "./_components/ScheduleOfRatesTable";
import CreateWorkOrderSiteDialog from "./_components/CreateWOSite/CreateWorkOrderSiteDialog";
import SiteDetailDialog from "./_components/SiteDetailsDialog/SiteDetailsDialog";
import useHandleParams from "@/hooks/useHandleParams";
import CustomButton from "@/components/CustomButton";
import LoadMoreBtn from "@/components/loading/LoadMoreBtn";
import WorkOrderDetailsSkeleton from "./_components/skeleton/WorkOrderDetailsSkeleton";
import WorkOrderSitesSkeleton from "./_components/skeleton/WorkOrderSitesSkeleton";
import Error from "@/components/Error";
import NoFetchData from "@/components/NoFetchData";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutGrid, List } from "lucide-react";
import SitesTable from "./_components/work-order-sites/WOSitesTable";
import WOSitesCard from "./_components/work-order-sites/WOSitesCard";

interface Props {
  workOrderId: string;
  from: "list" | "client";
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

const WorkOrder = ({ workOrderId, from }: Props) => {
  const router = useRouter();
  const { setParam, setParams } = useHandleParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sitesList, setSitesList] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const sitesQueryLimit = 12;

  const {
    data: workOrderData,
    isLoading: isWorkOrderQueryLoading,
    isError: isWorkOrderQueryError,
    error: workOrderQueryError,
  } = trpc.workOrderQuery.getWorkOrderDetails.useQuery(
    { id: Number(workOrderId) },
    { enabled: !!workOrderId },
  );

  const {
    data: sitesData,
    isLoading: isSitesQueryLoading,
    dataUpdatedAt: sitesDataUpdatedAt,
    isError: isSitesQueryError,
    error: sitesQueryError,
  } = trpc.workOrderQuery.getWorkOrderSites.useQuery({
    id: Number(workOrderId),
    page: currentPage,
    limit: sitesQueryLimit,
  });

  const { sites: fetchedSites, pagination: fetchedPagination } = sitesData || {
    sites: [],
    pagination: {
      page: 1,
      limit: sitesQueryLimit,
      total: 0,
      totalPages: 1,
      hasMore: false,
    },
  };

  const isFetchingMore = isSitesQueryLoading && currentPage > 1;

  useEffect(() => {
    if (
      !isSitesQueryLoading &&
      fetchedSites &&
      fetchedPagination?.page === currentPage
    ) {
      // Map fetched sites to component format
      const mappedSites = fetchedSites.map((s: any) => ({
        id: s.site_id,
        wo_site_id: s.id,
        name: s.site_name,
        address: s.site_address,
        city: s.site_city,
        state: s.site_state,
        pincode: s.site_pincode,
        start_date:
          s.start_date && !isNaN(new Date(s.start_date).getTime())
            ? new Date(s.start_date).toISOString()
            : new Date().toISOString(),
        end_date:
          s.end_date && !isNaN(new Date(s.end_date).getTime())
            ? new Date(s.end_date).toISOString()
            : new Date().toISOString(),
        status: s.status as "pending" | "completed" | "cancelled",
        client_id: workOrderData?.workOrder?.client_id,
        work_order_id: workOrderData?.workOrder?.id,
        activity_type: s.activity_type,
        metric_ton: s.metric_ton,
        metric_ton_rate: s.metric_ton_rate,
        budget_amount: s.budget_amount,
        total_completion_amount: s.total_completion_amount,
        created_at: s.created_at,
        users: s.users,
        measurement_sheets: s.measurement_sheets,
      }));

      if (currentPage === 1) {
        setSitesList(mappedSites);
      } else {
        setSitesList((prev) => [...prev, ...mappedSites]);
      }
      setPagination(fetchedPagination);
    }
  }, [sitesDataUpdatedAt, currentPage]);

  if (isWorkOrderQueryLoading) return <WorkOrderDetailsSkeleton />;

  if (isWorkOrderQueryError)
    return (
      <Error
        variant='inline'
        message={workOrderQueryError.message || "Failed to load work order"}
      />
    );

  if (!workOrderData || !workOrderData.workOrder)
    return (
      <NoFetchData
        title='Work Order Not Found'
        Icon={File}
        description='The requested work order could not be found.'
      />
    );

  const { workOrder, sites, stats, scheduleOfRates } = workOrderData;

  const totalBudgetAmount =
    (scheduleOfRates || []).reduce(
      (acc: number, curr: any) => acc + Number(curr.total_cost || 0),
      0,
    ) || 0;

  const totalCompletionAmount =
    (sites || []).reduce(
      (acc: number, curr: any) =>
        acc + Number(curr.total_completion_amount || 0),
      0,
    ) || 0;

  const statsForComponent = {
    totalSites: stats.total_sites || 0,
    completedSites:
      (sites || []).filter((s: any) => s.is_completed === true)?.length || 0,
    totalBudgetAmount: totalBudgetAmount,
    totalCompletionAmount: totalCompletionAmount,
    budgetUtilization:
      totalBudgetAmount > 0
        ? (totalCompletionAmount / totalBudgetAmount) * 100
        : 0,
  };

  const handleCrateSiteDialog = () => {
    setParam("dialog", "create-wo-site");
  };

  const handleSiteDetails = (siteId: string) => {
    setParams({
      dialog: "site-details",
      "wo-site-id": siteId,
    });
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <PageWrapper
      title={`${workOrder.code.toUpperCase()} - ${capitalFirstLetter(workOrder.title || "Work Order")}`}
      description='Work Order Details and Management'
      backClick={() => {
        if (from === "list") {
          router.push("/dashboard/work-order");
        } else {
          router.push(`/dashboard/client/${workOrder.client_id}`);
        }
      }}>
      <div className='mt-4 space-y-6'>
        <WorkOrderDetailsCard
          workOrder={workOrder}
          stats={statsForComponent}
        />

        {isSitesQueryLoading ? (
          <WorkOrderSitesSkeleton />
        ) : isSitesQueryError ? (
          <Error
            variant='inline'
            message={sitesQueryError.message || "Failed to load sites"}
          />
        ) : (
          <div className='rounded-lg border bg-white p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-6'>
                <h2 className='text-md font-semibold'>
                  Work Order Sites ({pagination?.total || 0})
                </h2>
                <Tabs
                  value={viewMode}
                  onValueChange={(val) => setViewMode(val as "card" | "table")}
                  className='mr-2'>
                  <TabsList className='grid w-36 grid-cols-2 h-8'>
                    <TabsTrigger
                      value='card'
                      className='gap-2 text-xs text-gray-800'>
                      <LayoutGrid className='size-3.5 text-gray-500' />
                      Card
                    </TabsTrigger>
                    <TabsTrigger
                      value='table'
                      className='gap-2 text-xs text-gray-800'>
                      <List className='size-3.5 text-gray-500' />
                      Table
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className=' bg-whit rounded-lg px- py-'>
                {workOrderData?.scheduleOfRates &&
                  workOrderData?.scheduleOfRates.length > 0 && (
                    <div className='flex gap-4 justify-end'>
                      <CustomButton
                        text='View Schedule of Rates'
                        variant='outline'
                        Icon={Rows3}
                        onClick={() => setParam("dialog", "schedule-of-rates")}
                      />
                      <CustomButton
                        variant='primary'
                        Icon={Plus}
                        text='Create Site'
                        onClick={handleCrateSiteDialog}
                      />
                    </div>
                  )}
              </div>
            </div>

            {sitesList.length > 0 ? (
              <div className='relative'>
                <Tabs
                  value={viewMode}
                  className='w-full'>
                  <TabsContent value='card'>
                    <WOSitesCard
                      sites={sitesList}
                      handleSiteDetails={handleSiteDetails}
                    />
                  </TabsContent>
                  <TabsContent value='table'>
                    <SitesTable
                      sites={sitesList}
                      onSiteClick={handleSiteDetails}
                    />
                  </TabsContent>
                </Tabs>
                {pagination?.hasMore && (
                  <div className='flex justify-center mt-4'>
                    <LoadMoreBtn
                      onClick={handleLoadMore}
                      loading={isFetchingMore}
                    />
                  </div>
                )}
                <div className='flex justify-between items-center px-4 py-2 text-xs text-muted-foreground border-t mt-4'>
                  <span>
                    Showing {sitesList.length} of{" "}
                    {pagination?.total || sitesList.length} sites
                  </span>
                  {pagination && pagination.totalPages > 1 && (
                    <span>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className='text-center text-xs py-8 text-gray-500'>
                No sites added yet. Click &quot;Add Site&quot; to get started.
              </div>
            )}
          </div>
        )}

        <ScheduleOfRatesTable
          scheduleOfRates={scheduleOfRates}
          sites={sites}
        />
        <CreateWorkOrderSiteDialog
          workOrder={workOrder}
          scheduleOfRates={scheduleOfRates}
        />
        <SiteDetailDialog />
      </div>
    </PageWrapper>
  );
};

export default WorkOrder;
