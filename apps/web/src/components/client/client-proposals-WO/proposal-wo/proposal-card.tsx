import {
  FileText,
  CalendarDays,
  Clock,
} from "lucide-react";
import React from "react";
import { format } from "date-fns";
import { capitalFirstLetter } from "@pkg/utils";
import CustomButton from "@/components/shared/btn";
import { type proposalTypes } from "@pkg/schema";
import useHandleParams from "@/hooks/useHandleParams";

interface Props {
  proposal: proposalTypes.proposalType;
}

const ProposalCard = ({ proposal }: Props) => {
  const { setParams } = useHandleParams();

  return (
    <div
      onClick={() =>
        setParams({
          dialog: "proposal-detail",
          "proposal-id": proposal?.id.toString(),
        })
      }
      className='w-full min-w-0 rounded-lg border hover:shadow-sm transition-shadow p-4 flex flex-col min-h-52 bg-gray-100/50 cursor-pointer hover:border-green-400 group'>
      {/* Header Section */}
      <div className='flex items-start justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <div className='inline-flex items-center px-2 py-0.5 rounded-sm bg-sky-50 text-sky-700 text-[11px] font-mono ring-1 ring-sky-200'>
            {proposal?.code}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {proposal?.document_key && (
            <button
              type='button'
              className='h-8 w-8 rounded-full bg-white border  flex items-center justify-center  transition-colors hover:bg-emerald-50 cursor-pointer'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(proposal.document_key, "_blank");
              }}>
              <FileText className='h-4 w-4 text-emerald-700 ' />
            </button>
          )}
          <CustomButton
            text='View'
            arrowType='upright'
            variant='arrow'
            className='group-hover:text-white group-hover:bg-emerald-600 transition-colors'
          />
        </div>
      </div>

      {/* Title */}
      <h3 className='text-sm font-semibold leading-snug text-gray-600 line-clamp-2 break-all min-w-0 mb-2'>
        {capitalFirstLetter(proposal?.title)}
      </h3>

      {/* Info Grid */}
      <div className='grid grid-cols-2 gap-2 mb-3'>
        {/* Submission Date */}
        <div className='flex items-center gap-2 rounded-md border border-gray-100 bg-linear-to-r from-blue-50/50 to-transparent px-2.5 py-2'>
          <CalendarDays className='w-4 h-4 text-emerald-600 shrink-0' />
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

        {/* Created Date */}
        <div className='flex items-center gap-2 rounded-md border border-gray-100 bg-linear-to-r from-blue-50/50 to-transparent px-2.5 py-2'>
          <Clock className='w-4 h-4 text-emerald-600 shrink-0' />
          <div className='min-w-0'>
            <div className='text-[10px] uppercase tracking-wider text-gray-500'>
              Created
            </div>
            <div className='text-xs font-medium text-gray-800 truncate'>
              {proposal?.created_at
                ? format(new Date(proposal.created_at), "dd MMM yyyy")
                : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className='text-xs text-gray-600 leading-relaxed line-clamp-2 mb-3 flex-1'>
        {proposal?.description || "No description provided."}
      </p>
    </div>
  );
};

export default ProposalCard;
