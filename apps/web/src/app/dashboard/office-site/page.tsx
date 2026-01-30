import Wrapper from "@/components/wrapper/Wrapper";
import React from "react";
import dynamic from "next/dynamic";
import CreateOfficeButton from "./_components/CreateOfficeButton";
import { Suspense } from "react";
import PageLoading from "@/components/loading/PageLoading";

const OfficeSitePage = dynamic(() => import("./_components/OfficeSitePage"));

const page = () => {
  return (
    <Wrapper
      title='Offices & Sites'
      description='Manage your office locations and work sites'
      button={<CreateOfficeButton />}>
      <Suspense fallback={<PageLoading />}>
        <OfficeSitePage />
      </Suspense>
    </Wrapper>
  );
};

export default page;
