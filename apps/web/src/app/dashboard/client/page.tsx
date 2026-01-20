import Wrapper from "@/components/Wrapper/Wrapper";
import React from "react";
import CreateClientButton from "./_components/CreateClientButton";
import ClientPage from "./_components/ClientPage";

const page = () => {
  return (
    <Wrapper
      title='Clients'
      description='Manage and monitor all your clients and their contacts'
      button={<CreateClientButton />}>
      <ClientPage />
    </Wrapper>
  );
};

export default page;
