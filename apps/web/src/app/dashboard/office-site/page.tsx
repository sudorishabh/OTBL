import { PageWrapper } from "@/components/wrapper/page-wrapper";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import CreateOfficeButton from "@/components/office-site/create-office-btn";
import OfficeSitePage from "@/components/office-site/office-site-page";
const page = () => {
  return (
    <PageWrapper
      title='Offices & Sites'
      description='Manage your office locations and work sites'
      button={
        <Suspense fallback={null}>
          <CreateOfficeButton />
        </Suspense>
      }>
      <OfficeSitePage />
    </PageWrapper>
  );
};

export default page;
