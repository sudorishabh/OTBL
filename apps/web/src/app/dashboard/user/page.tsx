import Wrapper from "@/components/Wrapper/Wrapper";
import React from "react";
import UserPage from "./_components/UserPage";
import CreateUserButton from "./_components/CreateUserButton";
const page = () => {
  return (
    <Wrapper
      title='User Management'
      description='Manage users, assign them to offices, and track their work locations'
      button={<CreateUserButton />}>
      <UserPage />
    </Wrapper>
  );
};

export default page;
