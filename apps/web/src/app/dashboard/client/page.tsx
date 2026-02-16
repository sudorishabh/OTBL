import Wrapper from "@/components/wrapper/Wrapper";
import React from "react";
import CreateClientButton from "./_components/CreateClientButton";
import ClientsPage from "./_components/ClientsPage";

const page = () => {
  return (
    <Wrapper
      title='Clients'
      description='Manage and monitor all your clients and their contacts'
      button={<CreateClientButton />}>
      <ClientsPage />
    </Wrapper>
  );
};

export default page;
