import React from "react";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/shared/btn";
import { capitalFirstLetter } from "@pkg/utils";
import {
  Briefcase,
  Clock,
  FileText,
  Plus,
  Calendar,
  CalendarCheck,
  FileCode,
  Hash,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Beaker,
  Leaf,
  Sparkles,
  AlignEndHorizontal,
  Shovel,
} from "lucide-react";
import useHandleParams from "@/hooks/useHandleParams";
import { type workOrderTypes } from "@pkg/schema";

interface Props {
  workOrder: workOrderTypes.workOrderType | null;
  proposalId: number;
  proposalTitle: string;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "completed":
      return {
        icon: CheckCircle2,
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
        ringColor: "ring-emerald-200",
      };
    case "cancelled":
      return {
        icon: XCircle,
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        ringColor: "ring-red-200",
      };
    default:
      return {
        icon: AlertCircle,
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        ringColor: "ring-amber-200",
      };
  }
};

const getProcessTypeConfig = (type: string) => {
  switch (type) {
    case "bioremediation":
      return {
        icon: Beaker,
        label: "Bioremediation",
        color: "text-emerald-600",
      };
    case "restoration":
      return { icon: Shovel, label: "Restoration", color: "text-green-600" };
    case "bioremediation_restoration":
      return {
        icon: AlignEndHorizontal,
        label: "Bio + Restoration",
        color: "text-emerald-600",
      };
    default:
      return { icon: FileCode, label: type, color: "text-gray-600" };
  }
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const WordOrderCard = ({ workOrder, proposalId, proposalTitle }: Props) => {
  const { setParams } = useHandleParams();
  const router = useRouter();

  const statusConfig = workOrder ? getStatusConfig(workOrder.status) : null;
  const processConfig = workOrder
    ? getProcessTypeConfig(workOrder.process_type)
    : null;
  const StatusIcon = statusConfig?.icon;
  const ProcessIcon = processConfig?.icon;

  return (
    <>
      <div className='rounded-lg bg-white drop-shadow-sm hover:drop-shadow-md transition-shadow p-4 flex flex-col min-h-80'>
        {workOrder ? (
          <div
            className='group cursor-pointer flex flex-col h-full'
            onClick={() =>
              router.push(`/dashboard/client/workorder/${workOrder.id}`)
            }>
            {/* Header Section */}
            <div className='flex items-start justify-between mb-2'>
              <div className='flex flex-wrap items-center gap-2'>
                <div className='inline-flex items-center px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 text-[11px] font-mono ring-1 ring-emerald-200'>
                  WO: {workOrder.code}
                </div>
                {/* Status Badge */}
                {statusConfig && StatusIcon && (
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ring-1 ${statusConfig.ringColor}`}>
                    <StatusIcon className='w-3 h-3' />
                    {capitalFirstLetter(workOrder.status)}
                  </div>
                )}
              </div>
              <CustomButton
                text='View'
                arrowType='right'
                variant='arrow'
                className='group-hover:text-white group-hover:bg-emerald-600 transition-colors'
              />
            </div>

            {/* Title */}
            <h3 className='text-sm font-semibold leading-snug text-slate-900 line-clamp-2 mb-2'>
              {workOrder.title
                ? capitalFirstLetter(workOrder.title)
                : "Untitled Work Order"}
            </h3>

            {/* Process Type Badge */}
            {processConfig && ProcessIcon && (
              <div className='flex items-center gap-1.5 mb-2'>
                <ProcessIcon className={`w-4 h-4 ${processConfig.color}`} />
                <span className={`text-xs font-medium ${processConfig.color}`}>
                  {processConfig.label}
                </span>
              </div>
            )}

            {/* Reference Numbers */}
            <div className='grid grid-cols-2 gap-2 mb-2'>
              <div className='flex items-center gap-1.5 px-2 py-1.5 rounded bg-gray-50 border border-gray-100'>
                <Hash className='w-3.5 h-3.5 text-gray-500' />
                <div className='min-w-0'>
                  <div className='text-[9px] uppercase tracking-wider text-gray-400'>
                    Agreement No.
                  </div>
                  <div className='text-[11px] font-medium text-gray-700 truncate'>
                    {workOrder.agreement_number || "—"}
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-1.5 px-2 py-1.5 rounded bg-gray-50 border border-gray-100'>
                <FileCode className='w-3.5 h-3.5 text-gray-500' />
                <div className='min-w-0'>
                  <div className='text-[9px] uppercase tracking-wider text-gray-400'>
                    RC Number
                  </div>
                  <div className='text-[11px] font-medium text-gray-700 truncate'>
                    {workOrder.rate_contract_number || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates Grid */}
            <div className='grid grid-cols-3 gap-2 mb-2'>
              <div className='flex items-center gap-1.5 rounded-md border border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent px-2 py-1.5'>
                <Clock className='w-3.5 h-3.5 text-emerald-600 shrink-0' />
                <div className='min-w-0'>
                  <div className='text-[9px] uppercase tracking-wider text-gray-500'>
                    Start
                  </div>
                  <div className='text-[11px] font-medium text-gray-800 truncate'>
                    {formatDate(workOrder.start_date)}
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-1.5 rounded-md border border-gray-100 bg-linear-to-r from-orange-50/50 to-transparent px-2 py-1.5'>
                <Calendar className='w-3.5 h-3.5 text-emerald-600 shrink-0' />
                <div className='min-w-0'>
                  <div className='text-[9px] uppercase tracking-wider text-gray-500'>
                    End
                  </div>
                  <div className='text-[11px] font-medium text-gray-800 truncate'>
                    {formatDate(workOrder.end_date)}
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-1.5 rounded-md border border-gray-100 bg-linear-to-r from-emerald-50/50 to-transparent px-2 py-1.5'>
                <CalendarCheck className='w-3.5 h-3.5 text-emerald-600 shrink-0' />
                <div className='min-w-0'>
                  <div className='text-[9px] uppercase tracking-wider text-gray-500'>
                    Handover
                  </div>
                  <div className='text-[11px] font-medium text-gray-800 truncate'>
                    {formatDate(workOrder.handing_over_date)}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className='text-xs text-gray-600 leading-relaxed line-clamp-2 mb-2 flex-1'>
              {workOrder?.description || "No description provided."}
            </p>

            {/* Document Button */}
            {workOrder?.document_key && (
              <div
                className='mt-auto pt-2 border-t border-gray-100'
                onClick={(e) => e.stopPropagation()}>
                <CustomButton
                  Icon={FileText}
                  text='View Document'
                  onClick={() => window.open(workOrder.document_key, "_blank")}
                  variant='outline'
                  className='w-full text-xs hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors'
                />
              </div>
            )}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center text-center h-full'>
            <div className='p-3 rounded-xl bg-linear-to-br from-gray-100 to-gray-50 text-gray-500 mb-4 shadow-sm'>
              <Briefcase className='w-6 h-6' />
            </div>
            <p className='text-sm font-semibold text-gray-700 mb-1'>
              No Work Order
            </p>
            <p className='text-xs text-gray-500 mb-5 max-w-[180px]'>
              Create a work order to link with this proposal and start tracking
              progress.
            </p>
            <CustomButton
              Icon={Plus}
              text='Create Work Order'
              onClick={() => {
                setParams({
                  dialog: "create-workorder",
                  "proposal-id": proposalId.toString(),
                });
              }}
              variant='outline'
              className='hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'
            />
          </div>
        )}
      </div>
    </>
  );
};

export default WordOrderCard;
