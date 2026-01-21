import { ArrowUpRight, FileText } from "lucide-react";
import React from "react";
import { format } from "date-fns";
import { capitalFirstLetter } from "@pkg/utils";
import CustomButton from "@/components/CustomButton";
import { type proposalTypes } from "@pkg/schema";

interface Props {
  proposal: proposalTypes.proposalType;
}
const ProposalCard = ({ proposal }: Props) => {
  return (
    <div className='rounded-lg bg-white shadow p-4 flex flex-col group cursor-pointer h-60'>
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-start gap-3 flex-1 min-w-0'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between mb-1'>
              <div className='inline-flex items-center px-2 py-0.5 rounded-sm bg-sky-50 text-sky-700 text-[11px] font-mono ring-1 ring-blue-100'>
                Proposal:
                {proposal?.code}
              </div>
              <div className='h-8 w-8 rounded-full bg-white border group-hover:border-0 flex items-center justify-center group-hover:bg-emerald-600 relative'>
                <ArrowUpRight className='h-4 w-4 text-emerald-700 group-hover:text-white' />
              </div>
            </div>
            <div className='my-2 flex items-center gap-1 text-[11px]  text-gray-500'>
              Created:
              {proposal?.created_at
                ? format(new Date(proposal.created_at), "dd MMM yyyy")
                : "—"}
            </div>
            <h3 className=' text-sm font-semibold leading-snug text-slate-900 line-clamp-2'>
              {capitalFirstLetter(proposal?.title)}
            </h3>
          </div>
        </div>
      </div>
      {/* Description */}
      <p className='text-xs text-gray-600 leading-relaxed line-clamp-3 mb-2'>
        {proposal?.description || "No description provided."}
      </p>
      {/* View Document Button */}
      {proposal?.document_key && (
        <div className='mt-auto pt-2'>
          <CustomButton
            Icon={FileText}
            text='View Document'
            onClick={() => window.open(proposal.document_key, "_blank")}
            variant='outline'
            className='w-full text-xs'
          />
        </div>
      )}
    </div>
  );
};

export default ProposalCard;
