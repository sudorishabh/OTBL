import { PageWrapper } from "@/components/wrapper/PageWrapper";
import React from "react";
import CreateClientButton from "./_components/CreateClientButton";
import ClientsPage from "./_components/ClientsPage";

const page = () => {
  return (
    <React.Suspense fallback={<div>Loading clients...</div>}>
      <Wrapper
        title='Clients'
        description='Manage and monitor all your clients and their contacts'
        button={<CreateClientButton />}>
        <ClientsPage />
      </Wrapper>
    </React.Suspense>
  );
};

export default page;
