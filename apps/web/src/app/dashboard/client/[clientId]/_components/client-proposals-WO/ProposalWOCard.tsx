"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Plus,
  Link2,
  Link2Off,
  ArrowRight,
  Briefcase,
  IndianRupee,
  Clock,
  Check,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import CustomButton from "@/components/CustomButton";
import { capitalFirstLetter } from "@pkg/utils";
import CreateWODialog from "./create-wo/CreateWODialog";
import { useHandleParams } from "@/hooks/useHandleParams";

interface Proposal {
  id: number;
  code: string;
  title: string;
  description?: string;
  created_at?: string;
  document_key?: string;
}

interface WorkOrder {
  id: number;
  code?: string;
  title?: string;
  description?: string;
  budget_amount?: number;
  start_date?: string;
  document_key?: string;
}

interface Props {
  proposal: { proposal: Proposal; workOrder: WorkOrder | null };
}

const ProposalWOCard = ({ proposal }: Props) => {
  const router = useRouter();
  const params = useParams<{ clientId: string }>();
  const clientId = params?.clientId;
  const { setParams } = useHandleParams();

  const { proposal: proposalData } = proposal;
  const { workOrder } = proposal;

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className='w-full rounded-xl border shadow border-gray-100 bg-gray-50 backdrop-blur-sm p-4'>
      {/* <h2 className='text-sm p'>
        Proposal {proposalData.code}{" "}
        {workOrder ? `- Work Order ${workOrder.code}` : "No Work Order"}
      </h2> */}
      <div className='grid grid-cols-1 md:grid-cols-[1fr_72px_1fr] items-stretch gap-y-6 md:gap-y-0 md:gap-x-2'>
        {/* Left: Proposal mini-card */}
        <div className='rounded-lg bg-white shadow p-4 flex flex-col group cursor-pointer h-60'>
          {/* Header */}
          <div className='flex items-start justify-between mb-3'>
            <div className='flex items-start gap-3 flex-1 min-w-0'>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between mb-1'>
                  <div className='inline-flex items-center px-2 py-0.5 rounded-sm bg-sky-50 text-sky-700 text-[11px] font-mono ring-1 ring-blue-100'>
                    Proposal:
                    {proposalData.code}
                  </div>
                  <div className='h-8 w-8 rounded-full bg-white border group-hover:border-0 flex items-center justify-center group-hover:bg-emerald-600 relative'>
                    <ArrowUpRight className='h-4 w-4 text-emerald-700 group-hover:text-white' />
                  </div>
                </div>
                <div className='my-2 flex items-center gap-1 text-[11px]  text-gray-500'>
                  Created:
                  {proposalData.created_at
                    ? format(new Date(proposalData.created_at), "dd MMM yyyy")
                    : "—"}
                </div>
                <h3 className=' text-sm font-semibold leading-snug text-slate-900 line-clamp-2'>
                  {capitalFirstLetter(proposalData.title)}
                </h3>
              </div>
            </div>
          </div>
          {/* Description */}
          <p className='text-xs text-gray-600 leading-relaxed line-clamp-3 mb-2'>
            {proposalData.description || "No description provided."}
          </p>
          {/* View Document Button */}
          {proposalData.document_key && (
            <div className='mt-auto pt-2'>
              <CustomButton
                Icon={FileText}
                text='View Document'
                onClick={() => window.open(proposalData.document_key, "_blank")}
                variant='outline'
                className='w-full text-xs'
              />
            </div>
          )}
        </div>

        {/* Middle: horizontal dotted link indicator */}
        <div className='relative flex items-center justify-center'>
          <div className='w-full border-t border-dashed border-gray-400/80' />

          <div
            className={`absolute -translate-y-1/2 top-1/2 inline-flex items-center justify-center rounded-full border bg-white p-1.5 shadow-sm ${
              workOrder ? " text-emerald-600" : " text-gray-400"
            }`}
            aria-label={workOrder ? "Linked" : "Unlinked"}
            title={workOrder ? "Linked with Work Order" : "Unlinked"}>
            {workOrder ? (
              <Check className='w-4 h-4' />
            ) : (
              <Link2Off className='w-4 h-4' />
            )}
          </div>
        </div>

        {/* Right: Work Order mini-card */}
        <div className='rounded-lg bg-white shadow p-4 flex flex-col h-60'>
          {workOrder ? (
            <div
              className='group cursor-pointer'
              onClick={() =>
                router.push(`/dashboard/client/workorder/${workOrder.id}`)
              }>
              {/* Header */}
              <div className='flex items-center justify-between'>
                <div className='inline-flex items-center px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 text-[11px] font-mono ring-1 ring-emerald-100'>
                  Work Order:
                  {workOrder.code}
                </div>
                <CustomButton
                  text='View'
                  arrowType='right'
                  variant='arrow'
                  className='group-hover:text-white group-hover:bg-emerald-600'
                />
              </div>

              {/* Title */}
              <h3 className='text-sm font-semibold leading-snug text-slate-900 line-clamp-2'>
                {workOrder.title
                  ? capitalFirstLetter(workOrder.title)
                  : "Untitled Work Order"}
              </h3>

              {/* Meta */}
              <div className='mt-1 grid grid-cols-2 gap-3'>
                <div className='flex items-center gap-2 rounded-md border border-gray-100 bg-gray-50/60 px-2.5 py-2'>
                  <IndianRupee className='w-4 h-4 text-emerald-600' />
                  <div className='min-w-0'>
                    <div className='text-[10px] uppercase tracking-wider text-gray-500'>
                      Budget
                    </div>
                    <div className='text-xs font-medium text-gray-800 truncate'>
                      {formatCurrency(workOrder.budget_amount)}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2 rounded-md border border-gray-100 bg-gray-50/60 px-2.5 py-2'>
                  <Clock className='w-4 h-4 text-emerald-600' />
                  <div className='min-w-0'>
                    <div className='text-[10px] uppercase tracking-wider text-gray-500'>
                      Start
                    </div>
                    <div className='text-xs font-medium text-gray-800 truncate'>
                      {workOrder.start_date
                        ? new Date(workOrder.start_date).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>

              <p className='text-xs text-gray-600 leading-relaxed line-clamp-3 mb-2'>
                {workOrder?.description || "No description provided."}
              </p>
              {workOrder?.document_key && (
                <div
                  className='mt-auto pt-2'
                  onClick={(e) => e.stopPropagation()}>
                  <CustomButton
                    Icon={FileText}
                    text='View Document'
                    onClick={() =>
                      window.open(workOrder.document_key, "_blank")
                    }
                    variant='outline'
                    className='w-full text-xs'
                  />
                </div>
              )}
              {/* Footer */}
              {/* <div className='mt-auto flex items-center justify-end pt-4'>
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/client/${clientId}/workorder/${workOrder.id}`
                    )
                  }
                  className='group inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-700 transition-colors'>
                  Details
                  <ArrowRight className='w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5' />
                </button>
              </div> */}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center text-center h-full'>
              <div className='p-2.5 rounded-lg bg-gray-100 text-gray-500 mb-3'>
                <Briefcase className='w-5 h-5' />
              </div>
              <p className='text-sm font-medium text-gray-600 mb-1'>
                No Work Order
              </p>
              <p className='text-[11px] text-gray-500 mb-4'>
                Create one to link with this proposal.
              </p>
              <CustomButton
                Icon={Plus}
                text='Create Work Order'
                onClick={() => {
                  setParams({
                    mode: "wo-add",
                    "proposal-id": proposalData.id.toString(),
                  });
                }}
                variant='outline'
              />
            </div>
          )}
        </div>
      </div>

      {workOrder ? null : (
        <CreateWODialog
          proposalId={proposalData.id}
          proposalTitle={proposalData.title}
        />
      )}
    </div>
  );
};

export default ProposalWOCard;
