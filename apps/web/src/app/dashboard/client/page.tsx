import Wrapper from "@/components/wrapper/Wrapper";
import React from "react";
import CreateClientButton from "./_components/CreateClientButton";
import { Suspense } from "react";
import PageLoading from "@/components/loading/PageLoading";
import dynamic from "next/dynamic";

const ClientsPage = dynamic(() => import("./_components/ClientsPage"));

const page = () => {
  return (
    <Wrapper
      title='Clients'
      description='Manage and monitor all your clients and their contacts'
      button={<CreateClientButton />}>
      <Suspense fallback={<PageLoading />}>
        <ClientsPage />
      </Suspense>
    </Wrapper>
  );
};

export default page;
