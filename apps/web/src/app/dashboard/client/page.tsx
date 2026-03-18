import { PageWrapper } from "@/components/wrapper/page-wrapper";
import React from "react";
import CreateClientButton from "./_components/CreateClientButton";
import ClientsPage from "./_components/ClientsPage";

const page = () => {
  return (
    <React.Suspense fallback={<div>Loading clients...</div>}>
      <PageWrapper
        title='Clients'
        description='Manage and monitor all your clients and their contacts'
        button={<CreateClientButton />}>
        <ClientsPage />
      </PageWrapper>
    </React.Suspense>
  );
};

export default page;
