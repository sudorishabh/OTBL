import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Calendar,
  FileText,
  Building,
  Hash,
  ExternalLink,
  TrendingUp,
  IndianRupee,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { capitalFirstLetter, constants } from "@pkg/utils";
import CustomButton from "@/components/CustomButton";
import Link from "next/link";
import WorkOrderStatCard from "./WorkOrderStatCard";

interface Props {
  workOrder: {
    id: number;
    code: string;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    process_type?: string | null;
    rate_contract_number?: string | null;
    document_key?: string | null;
    agreement_number?: string | null;
    status: "pending" | "completed" | "cancelled";
    cancellation_reason: string | null;
    created_at: string;
    updated_at: string;
    office_id: number;
    office_name: string | null;
  };
  stats: {
    totalSites: number;
    completedSites: number;
    totalBudgetAmount: number;
    totalCompletionAmount: number;
    budgetUtilization: number;
  };
}

const WorkOrderDetailsCard = ({ workOrder, stats }: Props) => {
  const [isTotalSitesDialog, setIsTotalSitesDialog] = useState(false);
  const [isCompletedSitesDialog, setIsCompletedSitesDialog] = useState(false);
  const [isTotalBudgetDialog, setIsTotalBudgetDialog] = useState(false);
  const [isTotalCompletionDialog, setIsTotalCompletionDialog] = useState(false);
  const [isBudgetUtilizationDialog, setIsBudgetUtilizationDialog] =
    useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getProcessTypeColor = (processType: string | null | undefined) => {
    switch (processType) {
      case constants.WO_PROCESS.BIOREMEDIATION:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case constants.WO_PROCESS.RESTORATION:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case constants.WO_PROCESS.BIOREMEDIATION_RESTORATION:
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const processLabel =
    constants.processTypeOptions.find(
      (opt) => opt.value === workOrder.process_type,
    )?.label ||
    workOrder.process_type ||
    "N/A";

  return (
    <>
      <Card className='relative shadow-sm gap-1 border-[0.1px] bg-linear-to-br border-emerald-400 from-white to-gray-50'>
        <CardHeader className='pb-3'>
          <div className='flex items-start justify-between'>
            <div>
              <CardTitle className='text-lg  font-semibold text-gray-800 flex items-center gap-2'>
                <FileText className='size-4 text-emerald-600' />
                {capitalFirstLetter(workOrder.title)}
              </CardTitle>
              <div className='flex items-center gap-2 mt-1'>
                <Hash className='size-3.5 text-gray-500' />
                <span className='text-xs text-gray-600 font-mono'>
                  {workOrder.code.toUpperCase()}
                </span>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <Badge className={`${getStatusColor(workOrder.status)} border`}>
                {workOrder.status.charAt(0).toUpperCase() +
                  workOrder.status.slice(1)}
              </Badge>
              {workOrder.process_type && (
                <Badge
                  className={`${getProcessTypeColor(workOrder.process_type)} border`}>
                  {processLabel}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm'>
            <div className='flex items-center gap-3'>
              <div className='size-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0'>
                <Building className='size-4 text-cyan-800' />
              </div>
              <div className='min-w-0 flex-1'>
                <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                  Office
                </div>
                <p className='text-gray-700 text-xs font-medium wrap-break-word'>
                  {workOrder?.office_name}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='size-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0'>
                <Calendar className='size-4 text-cyan-800' />
              </div>
              <div>
                <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                  Work Order Date
                </div>
                <div className='text-gray-700 text-xs font-medium'>
                  {workOrder.start_date &&
                  !isNaN(new Date(workOrder.start_date).getTime())
                    ? format(new Date(workOrder.start_date), "MMM dd, yyyy")
                    : "N/A"}
                </div>
              </div>
            </div>

            {/* <div className='flex items-center gap-3'>
              <div className='size-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0'>
                <FileText className='size-4 text-cyan-800' />
              </div>
              <div>
                <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                  Process Type
                </div>
                <div className='text-gray-700 text-xs font-medium'>
                  {processLabel}
                </div>
              </div>
            </div> */}

            <div className='flex items-center gap-3'>
              <div className='size-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0'>
                <Hash className='size-4 text-cyan-800' />
              </div>
              <div>
                <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                  Agreement Number
                </div>
                <div className='text-gray-700 text-xs font-medium'>
                  {workOrder.agreement_number?.toUpperCase() || "N/A"}
                </div>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='size-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0'>
                <Hash className='size-4 text-cyan-800' />
              </div>
              <div>
                <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                  Rate Contract Number
                </div>
                <div className='text-gray-700 text-xs font-medium'>
                  {workOrder.rate_contract_number?.toUpperCase() || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* PDF Document Link - Prominent Section */}
          {workOrder.document_key && (
            <div className='mt-5 p-2.5 rounded-xl bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/60 shadow-sm'>
              <div className='flex items-center justify-between gap-4 flex-wrap'>
                <div className='flex items-center gap-3'>
                  <div className='size-7 rounded-md bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-md'>
                    <FileText className='size-4 text-white' />
                  </div>
                  <div>
                    <p className='text-xs font-medium text-emerald-700 uppercase tracking-wide'>
                      Work Order Document
                    </p>
                  </div>
                </div>
                <Link
                  href={workOrder.document_key}
                  target='_blank'>
                  <CustomButton
                    text='View PDF'
                    variant='primary'
                    Icon={ExternalLink}
                  />
                </Link>
              </div>
            </div>
          )}

          {workOrder.description && (
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <div className='text-[11px] uppercase tracking-wide text-gray-500 mb-2'>
                Description
              </div>
              <p
                className={`text-gray-700 text-sm leading-relaxed ${!isDescriptionExpanded ? "line-clamp-2" : ""}`}>
                {capitalFirstLetter(workOrder.description)}
              </p>
              <button
                onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                className='text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-1'>
                {isDescriptionExpanded ? "Read less" : "Read more"}
              </button>
            </div>
          )}

          {workOrder.cancellation_reason && (
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <div className='text-[11px] uppercase tracking-wide text-gray-500 mb-2'>
                Cancellation Reason
              </div>
              <p className='text-red-700 text-sm leading-relaxed bg-red-50 p-3 rounded-lg'>
                {workOrder.cancellation_reason}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
        <WorkOrderStatCard
          Icon={MapPin}
          title='Total Sites'
          stat={Number(stats.totalSites).toLocaleString()}
          openDialog={isTotalSitesDialog}
          setOpenDialog={setIsTotalSitesDialog}
        />
        <WorkOrderStatCard
          Icon={CheckCircle2}
          title='Completed Sites'
          stat={Number(stats.completedSites).toLocaleString()}
          openDialog={isCompletedSitesDialog}
          setOpenDialog={setIsCompletedSitesDialog}
        />

        <WorkOrderStatCard
          Icon={IndianRupee}
          title='Total Budget'
          stat={`${Number(stats.totalBudgetAmount).toLocaleString()}`}
          openDialog={isTotalBudgetDialog}
          setOpenDialog={setIsTotalBudgetDialog}
        />
        <WorkOrderStatCard
          Icon={IndianRupee}
          title='Total Completion'
          stat={`${Number(stats.totalCompletionAmount).toLocaleString()}`}
          openDialog={isTotalCompletionDialog}
          setOpenDialog={setIsTotalCompletionDialog}
        />
        <WorkOrderStatCard
          Icon={TrendingUp}
          title='Budget Utilization'
          stat={`${Number(stats.budgetUtilization).toFixed(1)}%`}
          openDialog={isBudgetUtilizationDialog}
          setOpenDialog={setIsBudgetUtilizationDialog}
        />
      </div>
    </>
  );
};

export default WorkOrderDetailsCard;
