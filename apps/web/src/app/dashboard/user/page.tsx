import Wrapper from "@/components/wrapper/index";
import UserPage from "./_components/UserPage";
import CreateUserButton from "./_components/CreateUserButton";

import React from "react";

const page = () => {
  return (
    <React.Suspense fallback={<div>Loading users...</div>}>
      <Wrapper
        title='User Management'
        description='Manage users, assign them to offices, and track their work locations'
        button={<CreateUserButton />}>
        <UserPage />
      </Wrapper>
    </React.Suspense>
  );
};

export default page;
