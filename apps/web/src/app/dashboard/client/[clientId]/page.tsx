"use client";
import React, { use } from "react";
import Wrapper from "@/components/wrapper/Wrapper";
import { trpc } from "@/lib/trpc";
import { PencilLine, Users } from "lucide-react";
import { capitalFirstLetter } from "@pkg/utils";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/CustomButton";
import ClientDetailsCard from "./_components/ClientDetailsCard";
import ClientStats from "./_components/client-stats/ClientStats";
import PageLoading from "@/components/loading/PageLoading";
import NoFetchData from "@/components/NoFetchData";
import useHandleParams from "@/hooks/useHandleParams";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ProposalWOMain = dynamic(
  () => import("./_components/client-proposals-WO/proposal-wo/ProposalWOMain"),
);

type PageProps = {
  params: Promise<{ clientId: string }>;
};

const Client = ({ params }: PageProps) => {
  const { setParam } = useHandleParams();

  const { clientId } = use(params);

  const router = useRouter();

  const clientQuery = trpc.clientQuery.getClient.useQuery(
    { clientId: Number(clientId) },
    { enabled: !!clientId },
  );

  const statsQuery = trpc.clientQuery.getClientStats.useQuery(
    { clientId: Number(clientId) },
    { enabled: !!clientId },
  );

  if (clientQuery.isLoading || statsQuery.isLoading) {
    return <PageLoading />;
  }

  // if (clientQuery.isError || statsQuery.isError) {
  //   return (
  //     <Wrapper
  //       title='Client Info'
  //       description='Manage Client Info and Work Orders'>
  //       <div className='text-sm text-red-600'>Failed to load client.</div>
  //     </Wrapper>
  //   );
  // }

  const client = clientQuery.data?.client;
  const clientUsers = clientQuery.data?.clientUsers;
  const stats = statsQuery.data;

  return (
    <Wrapper
      title={capitalFirstLetter(client?.name ?? "Client Info")}
      description='Manage Client Info and Work Orders'
      backClick={() => router.push("/dashboard/client")}
      button={
        <CustomButton
          text='Edit details'
          variant='primary'
          Icon={PencilLine}
          onClick={() => setParam("dialog", "update-client")}
        />
      }>
      {client ? (
        <div className='mt-4 space-y-6'>
          <ClientDetailsCard
            client={client}
            clientUsers={clientUsers ?? []}
          />
          <ClientStats
            stats={stats}
            clientId={clientId}
          />
          <Suspense
            fallback={
              <div className='h-[200px] w-full animate-pulse rounded-lg bg-gray-200' />
            }>
            <ProposalWOMain clientId={clientId} />
          </Suspense>
        </div>
      ) : (
        <NoFetchData
          Icon={Users}
          description='No client found'
          title='Client not found'
        />
      )}
    </Wrapper>
  );
};

export default Client;
