import Wrapper from "@/components/wrapper/Wrapper";
import dynamic from "next/dynamic";
import { Suspense } from "react";
const UserPage = dynamic(() => import("./_components/UserPage"));
import CreateUserButton from "./_components/CreateUserButton";
import PageLoading from "@/components/loading/PageLoading";

const page = () => {
  return (
    <Wrapper
      title='User Management'
      description='Manage users, assign them to offices, and track their work locations'
      button={<CreateUserButton />}>
      <Suspense fallback={<PageLoading />}>
        <UserPage />
      </Suspense>
    </Wrapper>
  );
};

export default page;
