"use client";
import React, { use, useState } from "react";
import Wrapper from "@/components/Wrapper/Wrapper";
import { trpc } from "@/lib/trpc";
import { PencilLine, Users } from "lucide-react";
import { capitalFirstLetter } from "@pkg/utils";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/CustomButton";
import ClientDetailsCard from "./_components/ClientDetailsCard";
import ClientStats from "./_components/client-stats/ClientStats";
import PageLoading from "@/components/PageLoading";
import ProposalWOComp from "./_components/client-proposals-WO/ProposalWOComp";
import NoFetchData from "@/components/NoFetchData";

type PageProps = {
  params: Promise<{ clientId: string }>;
};

const Client = ({ params }: PageProps) => {
  const [isEditOfficeDialog, setIsEditOfficeDialog] = useState<boolean>(false);

  const { clientId } = use(params);

  const router = useRouter();

  const clientQuery = trpc.clientQuery.getClient.useQuery(
    { id: Number(clientId) },
    { enabled: !!clientId }
  );

  const statsQuery = trpc.clientQuery.getClientStats.useQuery(
    { id: Number(clientId) },
    { enabled: !!clientId }
  );

  if (clientQuery.isLoading || statsQuery.isLoading) {
    return <PageLoading />;
  }

  if (clientQuery.isError) {
    return (
      <Wrapper
        title='Client Info'
        description='Manage Client Info and Work Orders'>
        <div className='text-sm text-red-600'>Failed to load client.</div>
      </Wrapper>
    );
  }

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
          onClick={() => setIsEditOfficeDialog(!isEditOfficeDialog)}
        />
      }>
      {client ? (
        <div className='mt-4 space-y-6'>
          <ClientDetailsCard
            client={client}
            clientUsers={clientUsers}
          />
          <ClientStats
            stats={stats}
            clientId={clientId}
          />
          <ProposalWOComp clientId={clientId} />
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
