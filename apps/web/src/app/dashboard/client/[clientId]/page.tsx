"use client";
import React, { use } from "react";
import Wrapper from "@/components/wrapper/Wrapper";
import { PencilLine } from "lucide-react";
import { capitalFirstLetter } from "@pkg/utils";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/CustomButton";
import useHandleParams from "@/hooks/useHandleParams";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import ClientInfoSkeleton from "./_components/skeleton/ClientInfoSkeleton";
import ClientProposalSkeleton from "./_components/skeleton/ClientProposalSkeleton";

const ClientDetailsCard = dynamic(
  () => import("./_components/ClientDetailsCard"),
);

const ProposalWOMain = dynamic(
  () => import("./_components/client-proposals-WO/proposal-wo/ProposalWOMain"),
);

const UpdateClientDialog = dynamic(
  () => import("./_components/UpdateClientDialog"),
);

type PageProps = {
  params: Promise<{ clientId: string }>;
};

const Client = ({ params }: PageProps) => {
  const { setParam, getParam } = useHandleParams();
  const { clientId } = use(params);
  const router = useRouter();

  return (
    <Wrapper
      title={capitalFirstLetter(getParam("name") || "Client Info")}
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
      <div className='mt-4 space-y-4'>
        <Suspense fallback={<ClientInfoSkeleton />}>
          <ClientDetailsCard clientId={clientId} />
        </Suspense>
        <Suspense fallback={<ClientProposalSkeleton />}>
          <ProposalWOMain clientId={clientId} />
        </Suspense>
      </div>
      <UpdateClientDialog clientId={clientId} />
    </Wrapper>
  );
};

export default Client;
