import { PageWrapper } from "@/components/wrapper/page-wrapper";
import React, { Suspense } from "react";
import CreateOfficeButton from "../../../components/office-site/create-office-btn";
import OfficeSitePage from "../../../components/office-site/office-site-page";
import OfficeSitePageSkeleton from "@/components/skeleton/office-site/office-site-page-skeleton";

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
      <Suspense fallback={<OfficeSitePageSkeleton />}>
        <OfficeSitePage />
      </Suspense>
    </PageWrapper>
  );
};

export default page;
