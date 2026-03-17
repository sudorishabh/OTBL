import React from "react";
import UserPage from "./_components/UserPage";
import { PageWrapper } from "@/components/wrapper/PageWrapper";
import CreateUserButton from "./_components/CreateUserButton";

const page = () => {
  return (
    <React.Suspense fallback={<div>Loading users...</div>}>
      <PageWrapper
        title='User Management'
        description='Manage users, assign them to offices, and track their work locations'
        button={<CreateUserButton />}>
        <UserPage />
      </PageWrapper>
    </React.Suspense>
  );
};

export default page;
