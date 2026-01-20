import React from "react";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/CustomButton";
import { capitalFirstLetter } from "@pkg/utils";
import { Briefcase, Clock, FileText, IndianRupee, Plus } from "lucide-react";
import useHandleParams from "@/hooks/useHandleParams";
import { formatCurrency } from "@pkg/utils";

interface Props {
  workOrder: any;
  proposalData: any;
}
const WordOrderCard = ({ workOrder, proposalData }: Props) => {
  const { setParams } = useHandleParams();
  const router = useRouter();

  return (
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
                        },
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
                onClick={() => window.open(workOrder.document_key, "_blank")}
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
  );
};

export default WordOrderCard;
