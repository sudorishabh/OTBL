"use client";
import React, { useState } from "react";
import Wrapper from "@/components/Wrapper";
import { trpc } from "@/lib/trpc";
import PageFetchingData from "@/components/PageFetchingData";
import { capitalFirstLetter } from "@/utils/capitalFirstLetter";
import { useRouter } from "next/navigation";
import WorkOrderDetailsCard from "./_components/WorkOrderDetailsCard";
import WorkOrderStats from "./_components/WorkOrderStats";
import SiteDetailsDialog from "./_components/SiteDetailsDialog";
import { MapPin, Phone, User } from "lucide-react";

type PageProps = {
  params: Promise<{ workOrderId: string }>;
};

const WorkOrder = ({ params }: PageProps) => {
  const { workOrderId } = React.use(params);
  const router = useRouter();
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [siteDialogOpen, setSiteDialogOpen] = useState(false);

  // Fetch work order details from the backend
  const workOrderQuery = trpc.workOrderQuery.getWorkOrderDetails.useQuery(
    { id: Number(workOrderId) },
    { enabled: !!workOrderId }
  );

  if (workOrderQuery.isLoading) {
    return <PageFetchingData title='Loading work order data' />;
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

  const { workOrder, sites, stats } = data;

  // Transform sites data for the components - only use fields from schema
  const sitesForSiteComponent = sites.map((s: any) => ({
    id: s.site.id!,
    wo_site_id: s.wo_site_id!,
    name: s.site.name!,
    address: s.site.address!,
    city: s.site.city!,
    state: s.site.state!,
    pincode: s.site.pincode!,
    contact_person: s.site.contact_person!,
    contact_number: s.site.contact_number!,
    email: s.site.email!,
    start_date: s.start_date
      ? new Date(s.start_date).toISOString()
      : new Date().toISOString(),
    end_date: s.end_date
      ? new Date(s.end_date).toISOString()
      : new Date().toISOString(),
    status: s.status as "pending" | "completed" | "cancelled",
  }));

  const statsForComponent = {
    totalSites: stats.total_sites || 0,
    completedActivities: 0,
    totalBudgetAmount: workOrder.budget_amount?.toString() || "0",
    totalExpenseAmount: workOrder.expense_amount?.toString() || "0",
    budgetUtilization:
      workOrder.budget_amount && Number(workOrder.budget_amount) > 0
        ? (Number(workOrder.expense_amount || 0) /
            Number(workOrder.budget_amount)) *
          100
        : 0,
  };

  // Transform workOrder for the component
  const workOrderForComponent = {
    id: workOrder.id,
    code: workOrder.code,
    title: workOrder.title,
    description: workOrder.description,
    date: workOrder.start_date
      ? new Date(workOrder.start_date).toISOString()
      : new Date().toISOString(),
    budget_amount: workOrder.budget_amount?.toString() || "0",
    expense_amount: workOrder.expense_amount?.toString() || "0",
    status: workOrder.status as "pending" | "completed" | "cancelled",
    cancellation_reason: workOrder.cancellation_reason,
    created_at: workOrder.created_at
      ? new Date(workOrder.created_at).toISOString()
      : new Date().toISOString(),
    updated_at: workOrder.updated_at
      ? new Date(workOrder.updated_at).toISOString()
      : new Date().toISOString(),
    office: {
      id: workOrder.office_id,
      name: workOrder.office_name || "Unknown Office",
    },
  };

  return (
    <Wrapper
      title={`${workOrder.code} - ${capitalFirstLetter(workOrder.title)}`}
      description='Work Order Details and Management'
      backClick={() => router.back()}>
      <div className='mt-4 space-y-6'>
        <WorkOrderDetailsCard workOrder={workOrderForComponent} />
        <WorkOrderStats stats={statsForComponent} />

        {/* Horizontal Sites Section */}
        {sitesForSiteComponent.length > 0 && (
          <div className='rounded-lg border bg-white p-6'>
            <h2 className='text-lg font-semibold mb-4'>
              Work Order Sites ({sitesForSiteComponent.length})
            </h2>
            <div className='relative'>
              <div className='flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
                {sitesForSiteComponent.map((site: any) => (
                  <div
                    key={site.id}
                    onClick={() => {
                      setSelectedSite(site);
                      setSiteDialogOpen(true);
                    }}
                    className='flex-shrink-0 w-72 border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer hover:border-blue-500 bg-gradient-to-br from-white to-gray-50'>
                    <div className='flex items-start justify-between mb-3'>
                      <h3 className='font-semibold text-base line-clamp-1'>
                        {site.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
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
                        <MapPin className='w-4 h-4 flex-shrink-0 mt-0.5' />
                        <p className='line-clamp-2'>
                          {site.address}, {site.city}, {site.state}
                        </p>
                      </div>

                      <div className='flex items-center gap-2'>
                        <User className='w-4 h-4 flex-shrink-0' />
                        <p className='line-clamp-1'>{site.contact_person}</p>
                      </div>

                      <div className='flex items-center gap-2'>
                        <Phone className='w-4 h-4 flex-shrink-0' />
                        <p className='line-clamp-1'>{site.contact_number}</p>
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
            </div>
          </div>
        )}

        {/* Site Details Dialog */}
        <SiteDetailsDialog
          site={selectedSite}
          open={siteDialogOpen}
          setOpen={setSiteDialogOpen}
        />
      </div>
    </Wrapper>
  );
};

export default WorkOrder;
