import CustomButton from "@/components/CustomButton";
import { Check, Clock, FileText, Link2Off, Plus } from "lucide-react";
import React from "react";
import NoFetchData from "@/components/NoFetchData";
import CreateProposalDialog from "./CreateProposalDialog";
import { trpc } from "@/lib/trpc";
import ProposalCard from "./ProposalCard";
import { useHandleParams } from "@/hooks/useHandleParams";
import WordOrderCard from "./WordOrderCard";
import { type proposalTypes } from "@pkg/schema";
import CreateWODialog from "../create-wo/CreateWODialog";
import ClientProposalSkeleton from "../../skeleton/ClientProposalSkeleton";
import ProposalWODetailsDialog from "./ProposalWODetailsDialog";
import ProposalDetailDialog from "./ProposalDetailDialog";
import ClientWOStatsDialog from "./ClientWOStatsDialog";
import RightSidePanel from "./RightSidePanel";

interface Props {
  clientId: string;
}
const ProposalWOMain = ({ clientId }: Props) => {
  const { setParam, getParam } = useHandleParams();

  const { data, isLoading } = trpc.proposalQuery.getProposalsByClient.useQuery(
    { client_id: Number(clientId), limit: 6 },
    { enabled: !!clientId },
  );

  if (isLoading) {
    return <ClientProposalSkeleton />;
  }

  const proposals = data?.proposals || [];
  const total = data?.total ?? 0;
  const hasMore = total > proposals.length;

  const proposalId = getParam("proposal-id");
  const selectedProposal = proposals.find(
    (p) => p.proposal.id === (proposalId ? Number(proposalId) : null),
  );
  const proposalTitle = selectedProposal?.proposal.title || "";

  return (
    <div className='flex gap-5'>
      <div className='w-8/12 bg-white shadow-sm py-2 px-0.5 rounded-xl border'>
        <div className='flex items-center justify-between py-2 px-4'>
          <h3 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
            <Clock className='h-4 w-4 text-amber-600' />
            Proposal - Work Orders
            {total > 0 && (
              <span className='text-xs font-normal text-gray-400'>
                {hasMore ? `Showing 6 of ${total}` : `${total} total`}
              </span>
            )}
          </h3>
          <div className='flex items-center gap-3'>
            <CustomButton
              text='Create Proposal'
              variant='outline'
              Icon={Plus}
              onClick={() => setParam("dialog", "create-proposal")}
            />
            <CustomButton
              variant='arrow'
              arrowType='upright'
              onClick={() => {
                setParam("dialog", "proposal-wo");
              }}
            />
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
            proposals.map(({ workOrder, proposal }, index) => (
              <div
                key={proposal?.id || index}
                className='w-full rounded-xl border border-gray-200 bg-gray-100 p-4'>
                <div className='grid grid-cols-1 md:grid-cols-[1fr_72px_1fr] items-stretch gap-y-6 md:gap-y-0 md:gap-x-2'>
                  <ProposalCard proposal={proposal} />
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
                  <WordOrderCard
                    workOrder={
                      workOrder as proposalTypes.getProposalsByClientReturnType["workOrder"]
                    }
                    proposalId={proposal.id}
                    proposalTitle={proposal.title}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className='py-8'>
              <NoFetchData
                Icon={FileText}
                title='No proposals'
                description='Create a new proposal to get started.'
              />
            </div>
          )}
          {hasMore && (
            <div className='pt-1 pb-2 flex justify-center'>
              <button
                onClick={() => setParam("dialog", "proposal-wo")}
                className='text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors'>
                View all {total} proposals →
              </button>
            </div>
          )}
        </div>
      </div>

      <RightSidePanel proposals={proposals} />
      <CreateProposalDialog clientId={Number(clientId)} />
      <CreateWODialog proposalTitle={proposalTitle} />
      <ProposalWODetailsDialog clientId={Number(clientId)} />
      <ProposalDetailDialog />
      <ClientWOStatsDialog 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ongoingWOs={proposals.filter(p => p.workOrder?.status === "pending").map(p => p.workOrder) as any[]}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        completedWOs={proposals.filter(p => p.workOrder?.status === "completed").map(p => p.workOrder) as any[]}
      />
    </div>
  );
};

export default ProposalWOMain;
