import CustomButton from "@/components/CustomButton";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
} from "lucide-react";
import React from "react";
import NoFetchData from "@/components/NoFetchData";
import CreateProposalDialog from "./CreateProposalDialog";
import { trpc } from "@/lib/trpc";
import ProposalCard from "./ProposalWOCard";
import { useHandleParams } from "@/hooks/useHandleParams";

interface Props {
  clientId: string;
}
const ProposalWOComp = ({ clientId }: Props) => {
  const { setParam } = useHandleParams();

  const { data, isLoading } = trpc.proposalQuery.getProposalsByClient.useQuery(
    { client_id: Number(clientId) },
    { enabled: !!clientId }
  );

  const proposals = data?.proposals || [];

  return (
    <div className='flex gap-5'>
      <div className='w-8/12 bg-linear-to-br from-white to-gray-50 shadow-sm py-2 px-0.5 rounded-xl border'>
        <div className='flex items-center justify-between py-2 px-4'>
          <h3 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
            <Clock className='h-4 w-4 text-amber-600' />
            Proposal - Work Orders
          </h3>
          <div className='flex items-center gap-3'>
            <CustomButton
              text='Create Proposal'
              variant='outline'
              Icon={Plus}
              onClick={() => setParam("mode", "proposal-add")}
            />
            <div className='h-8 w-8 rounded-full bg-white border hover:border-0 group flex items-center justify-center hover:bg-emerald-600 relative cursor-pointer'>
              <ArrowUpRight className='h-4 w-4 text-emerald-700 group-hover:text-white' />
            </div>
          </div>
        </div>
        <div className='px-4 pb-4 pt-2 grid grid-cols-1 gap-5'>
          {isLoading ? (
            <div className='py-8'>
              <NoFetchData
                Icon={FileText}
                title='Loading proposals'
                description='Please wait while proposals load.'
              />
            </div>
          ) : proposals && proposals.length > 0 ? (
            proposals.map((proposal: any, index: number) => {
              const key = `proposal-${proposal?.id ?? proposal?.proposal_id ?? proposal?.code ?? proposal?.uuid ?? index}`;
              return (
                <ProposalCard
                  key={key}
                  proposal={proposal}
                />
              );
            })
          ) : (
            <div className='py-8'>
              <NoFetchData
                Icon={FileText}
                title='No proposals'
                description='Create a new proposal to get started.'
              />
            </div>
          )}
        </div>
      </div>

      <div className='w-4/12 bg-linear-to-br from-white to-gray-50 shadow-sm py-2 px-0.5  rounded-xl border'>
        <div className='flex items-center justify-between py-2 px-4'>
          <h3 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
            <CheckCircle2 className='h-4 w-4 text-green-600' /> Completed
          </h3>
          <div className='h-8 w-8 rounded-full bg-white border hover:border-0 group flex items-center justify-center hover:bg-emerald-600 relative cursor-pointer'>
            <ArrowUpRight className='h-4 w-4 text-emerald-700 group-hover:text-white' />
          </div>
        </div>
        <div className='px-4 pb-4 pt-2 grid grid-cols-1 gap-5'>
          {/* {completedWorkOrders.length > 0 ? (
            completedWorkOrders.map((wo: WorkOrder) => (
              <CompletedWOCard
                key={wo.id}
                title={wo.title}
                description={wo.description || ""}
                code={wo.code}
                budget_amount={Number(wo.budget_amount || 0)}
                expense_amount={Number(wo.expense_amount || 0)}
              />
            ))
          ) : (
            <div className='py-8'>
              <NoFetchData
                Icon={CheckCircle2}
                title='No completed work orders'
                description='Completed work orders will appear here.'
              />
            </div>
          )} */}
        </div>
      </div>
      <CreateProposalDialog clientId={Number(clientId)} />
    </div>
  );
};

export default ProposalWOComp;
