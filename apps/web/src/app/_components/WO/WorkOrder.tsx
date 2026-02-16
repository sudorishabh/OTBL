"use client";
import React, { useState, useEffect } from "react";
import Wrapper from "@/components/wrapper/Wrapper";
import { trpc } from "@/lib/trpc";
import { capitalFirstLetter } from "@pkg/utils";
import { useRouter } from "next/navigation";
import WorkOrderDetailsCard from "./_components/WorkOrderDetailsCard";
import WorkOrderStats from "./_components/WorkOrderStats";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import ScheduleOfRatesTable from "./_components/ScheduleOfRatesTable";
import CreateWorkOrderSiteDialog from "./_components/CreateWorkOrderSiteDialog";
import SiteDetailDialog from "./_components/SiteDetailsDialog/SiteDetailsDialog";
import useHandleParams from "@/hooks/useHandleParams";
import CustomButton from "@/components/CustomButton";

import LoadMoreBtn from "@/components/loading/LoadMoreBtn";

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
  // const [selectedSite, setSelectedSite] = useState<any>(null);
  const [siteDialogOpen, setSiteDialogOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [sitesList, setSitesList] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const sitesQueryLimit = 12;

  const workOrderQuery = trpc.workOrderQuery.getWorkOrderDetails.useQuery(
    { id: Number(workOrderId) },
    { enabled: !!workOrderId },
  );

  const {
    data: sitesData,
    isLoading: isSitesQueryLoading,
    dataUpdatedAt: sitesDataUpdatedAt,
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
        start_date: s.start_date
          ? new Date(s.start_date).toISOString()
          : new Date().toISOString(),
        end_date: s.end_date
          ? new Date(s.end_date).toISOString()
          : new Date().toISOString(),
        status: s.status as "pending" | "completed" | "cancelled",
        client_id: workOrderQuery.data?.workOrder?.client_id,
        work_order_id: workOrderQuery.data?.workOrder?.id,
        activity_type: s.activity_type,
        metric_ton: s.metric_ton,
        metric_ton_rate: s.metric_ton_rate,
        budget_amount: s.budget_amount,
        total_expense_amount: s.total_expense_amount,
        users: s.users,
      }));

      if (currentPage === 1) {
        setSitesList(mappedSites);
      } else {
        setSitesList((prev) => [...prev, ...mappedSites]);
      }
      setPagination(fetchedPagination);
    }
  }, [sitesDataUpdatedAt, currentPage]);

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

  if (workOrderQuery.isLoading) {
    return <div>Loading work order data...</div>;
  }

  if (workOrderQuery.isError) {
    return (
      <Wrapper
        title='Work Order'
        description='Work Order Details and Management'>
        <div className='text-sm text-red-600'>
          Failed to load work order. {workOrderQuery.error.message}
        </div>
      </Wrapper>
    );
  }

  const data = workOrderQuery.data;
  if (!data) {
    return (
      <Wrapper
        title='Work Order'
        description='Work Order Details and Management'>
        <div className='text-sm text-gray-600'>No work order found.</div>
      </Wrapper>
    );
  }

  const { workOrder, sites, stats, scheduleOfRates } = data as any;

  // Use the full list from details for stats to ensure accuracy (as details query fetches all currently)
  // But use sitesList (paginated) for the display grid.
  const sitesForStats = sites.map((s: any) => ({
    id: s.site.id!,
    budget_amount: s.budget_amount,
  })); // Simplified for stats calc or reuse existing logic

  // We only need to render sitesList.
  // Note: sitesList might be empty initially if query is lagging behind details query, handle that?
  // Actually, wait, initial render might show empty list until sitesQuery returns.
  // That's fine, standard async pattern.

  const statsForComponent = {
    totalSites: stats.total_sites || 0,
    completedActivities:
      sites.filter((s: any) => s.status === "completed")?.length || 0,
    totalBudgetAmount: sites
      .reduce(
        (acc: number, curr: any) => acc + Number(curr.budget_amount || 0),
        0,
      )
      .toString(),
    totalExpenseAmount: sites
      .reduce(
        (acc: number, curr: any) =>
          acc + Number(curr.total_expense_amount || 0),
        0,
      )
      .toString(),
    budgetUtilization: 0,
  };

  // Calculate budget utilization
  if (Number(statsForComponent.totalBudgetAmount) > 0) {
    statsForComponent.budgetUtilization =
      (Number(statsForComponent.totalExpenseAmount) /
        Number(statsForComponent.totalBudgetAmount)) *
      100;
  }

  // Transform workOrder for the component
  const workOrderForComponent = {
    id: workOrder?.id,
    code: workOrder?.code,
    title: workOrder?.title,
    description: workOrder?.description,
    date: workOrder?.start_date
      ? new Date(workOrder.start_date).toISOString()
      : new Date().toISOString(),
    process_type: workOrder?.process_type,
    rate_contract_number: workOrder?.rate_contract_number,
    document_key: workOrder?.document_key,
    agreement_number: workOrder?.agreement_number,
    status: workOrder?.status as "pending" | "completed" | "cancelled",
    cancellation_reason: workOrder?.cancellation_reason,
    created_at: workOrder?.created_at
      ? new Date(workOrder.created_at).toISOString()
      : new Date().toISOString(),
    updated_at: workOrder?.updated_at
      ? new Date(workOrder.updated_at).toISOString()
      : new Date().toISOString(),
    office: {
      id: workOrder?.office_id,
      name: workOrder?.office_name || "Unknown Office",
    },
  };

  return (
    <Wrapper
      title={`${workOrder?.code} - ${capitalFirstLetter(workOrder?.title || "Work Order")}`}
      description='Work Order Details and Management'
      backClick={() => {
        if (from === "list") {
          router.push("/dashboard/work-order");
        } else {
          router.push(`/dashboard/client/${workOrder?.client_id}`);
        }
      }}>
      <div className='mt-4 space-y-6'>
        <WorkOrderDetailsCard workOrder={workOrderForComponent} />
        <WorkOrderStats stats={statsForComponent} />

        <div className='rounded-lg border bg-white p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold'>
              Work Order Sites ({pagination?.total || 0})
            </h2>
            <div className=' bg-whit rounded-lg px- py-'>
              {scheduleOfRates && scheduleOfRates.length > 0 && (
                <div className='flex gap-4 justify-end'>
                  <CustomButton
                    text='View Schedule of Rates'
                    variant='outline'
                    onClick={() => setParam("dialog", "schedule-of-rates")}
                  />
                  <CustomButton
                    variant='primary'
                    text='Create Site'
                    onClick={handleCrateSiteDialog}
                  />
                </div>
              )}
            </div>
          </div>

          {sitesList.length > 0 ? (
            <div className='relative'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
                {sitesList.map((site: any) => (
                  <div
                    key={site.wo_site_id}
                    onClick={() => {
                      handleSiteDetails(site.wo_site_id);
                    }}
                    className=' border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer hover:border-blue-500 bg-linear-to-br from-white to-gray-50 flex flex-col justify-between'>
                    <div className='flex items-start justify-between mb-3'>
                      <h3 className='font-semibold text-base line-clamp-1'>
                        {capitalFirstLetter(site.name)}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ml-2 ${
                          site.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : site.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {capitalFirstLetter(site.status)}
                      </span>
                    </div>

                    <div className='space-y-2 text-sm text-gray-600'>
                      <div className='flex items-start gap-2'>
                        <MapPin className='w-4 h-4 shrink-0 mt-0.5' />
                        <p className='line-clamp-2'>
                          {site.address}, {site.city}, {site.state}
                        </p>
                      </div>
                      <div className='flex items-start gap-2'>
                        <Calendar className='w-4 h-4 shrink-0 mt-0.5' />
                        <p className='line-clamp-2'>
                          Start Date: {format(site.start_date, "dd/MM/yyyy")}
                        </p>
                      </div>
                      <div className='flex items-start gap-2'>
                        <Calendar className='w-4 h-4 shrink-0 mt-0.5' />
                        <p className='line-clamp-2'>
                          End Date: {format(site.end_date, "dd/MM/yyyy")}
                        </p>
                      </div>
                      <div className='mt-2'>
                        <span className='mr-2 font-semibold text-sm'>
                          Operators:
                        </span>
                        {site?.users.map(
                          (user: { user_id: number; user_name: string }) => (
                            <Badge
                              key={user.user_id}
                              className='bg-orange-800/15 text-orange-800'>
                              {capitalFirstLetter(user.user_name)}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>

                    <div className='mt-3 pt-3 border-t'>
                      <p className='text-xs text-blue-600 font-medium'>
                        Click to view details →
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
            <div className='text-center py-8 text-gray-500'>
              No sites added yet. Click &quot;Add Site&quot; to get started.
            </div>
          )}
        </div>

        <ScheduleOfRatesTable scheduleOfRates={scheduleOfRates} />
        <CreateWorkOrderSiteDialog
          workOrder={workOrder}
          scheduleOfRates={scheduleOfRates}
          onSuccess={() => workOrderQuery.refetch()}
        />
        <SiteDetailDialog
        // isOpen={siteDialogOpen}
        // onClose={() => {
        //   setSiteDialogOpen(false);
        //   setSelectedSite(null);
        // }}
        // siteData={selectedSite}
        />
      </div>
    </Wrapper>
  );
};

export default WorkOrder;
