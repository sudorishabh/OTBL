import {
  ArrowUpRight,
  FileText,
  IndianRupee,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import React from "react";
import { format } from "date-fns";
import { capitalFirstLetter } from "@pkg/utils";
import CustomButton from "@/components/CustomButton";
import { type proposalTypes } from "@pkg/schema";
import useHandleParams from "@/hooks/useHandleParams";

interface Props {
  proposal: proposalTypes.proposalType;
}

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

const ProposalCard = ({ proposal }: Props) => {
  const { setParams } = useHandleParams();
  const isApproved = proposal?.status === "approved";

  return (
    <div
      onClick={() =>
        setParams({
          dialog: "proposal-detail",
          "proposal-id": proposal?.id.toString(),
        })
      }
      className='rounded-lg bg-white drop-shadow-sm hover:drop-shadow-md transition-shadow p-4 flex flex-col group cursor-pointer min-h-72'>
      {/* Header Section */}
      <div className='flex items-start justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <div className='inline-flex items-center px-2 py-0.5 rounded-sm bg-sky-50 text-sky-700 text-[11px] font-mono ring-1 ring-sky-200'>
            Proposal: {proposal?.code}
          </div>
          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
              isApproved
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
            }`}>
            {isApproved ? (
              <CheckCircle2 className='w-3 h-3' />
            ) : (
              <XCircle className='w-3 h-3' />
            )}
            {capitalFirstLetter(proposal?.status)}
          </div>
        </div>
        <div className='h-8 w-8 rounded-full bg-white border group-hover:border-0 flex items-center justify-center group-hover:bg-emerald-600 transition-colors'>
          <ArrowUpRight className='h-4 w-4 text-emerald-700 group-hover:text-white' />
        </div>
      </div>

      {/* Title */}
      <h3 className='text-sm font-semibold leading-snug text-slate-900 line-clamp-2 mb-2'>
        {capitalFirstLetter(proposal?.title)}
      </h3>

      {/* Info Grid */}
      <div className='grid grid-cols-2 gap-2 mb-3'>
        {/* Proposal Amount */}
        <div className='flex items-center gap-2 rounded-md border border-gray-100 bg-gradient-to-r from-emerald-50/50 to-transparent px-2.5 py-2'>
          <IndianRupee className='w-4 h-4 text-emerald-600 flex-shrink-0' />
          <div className='min-w-0'>
            <div className='text-[10px] uppercase tracking-wider text-gray-500'>
              Amount
            </div>
            <div className='text-xs font-semibold text-gray-800 truncate'>
              {proposal?.proposal_amount
                ? formatCurrency(proposal.proposal_amount)
                : "—"}
            </div>
          </div>
        </div>

        {/* Submission Date */}
        <div className='flex items-center gap-2 rounded-md border border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent px-2.5 py-2'>
          <CalendarDays className='w-4 h-4 text-blue-600 flex-shrink-0' />
          <div className='min-w-0'>
            <div className='text-[10px] uppercase tracking-wider text-gray-500'>
              Submitted
            </div>
            <div className='text-xs font-medium text-gray-800 truncate'>
              {proposal?.proposal_submission_date
                ? format(
                    new Date(proposal.proposal_submission_date),
                    "dd MMM yyyy",
                  )
                : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Created Date */}
      <div className='flex items-center gap-1.5 text-[11px] text-gray-500 mb-2'>
        <Clock className='w-3.5 h-3.5' />
        Created:
        {proposal?.created_at
          ? format(new Date(proposal.created_at), "dd MMM yyyy")
          : "—"}
      </div>

      {/* Description */}
      <p className='text-xs text-gray-600 leading-relaxed line-clamp-2 mb-3 flex-1'>
        {proposal?.description || "No description provided."}
      </p>

      {/* View Document Button */}
      {proposal?.document_key && (
        <div
          className='mt-auto pt-2 border-t border-gray-100'
          onClick={(e) => e.stopPropagation()}>
          <CustomButton
            Icon={FileText}
            text='View Document'
            onClick={() => window.open(proposal.document_key, "_blank")}
            variant='outline'
            className='w-full text-xs hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 transition-colors'
          />
        </div>
      )}
    </div>
  );
};

export default ProposalCard;
