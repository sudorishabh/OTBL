"use client";
import { PageWrapper } from "@/components/wrapper/PageWrapper";
import React from "react";
import CreateOfficeButton from "./_components/CreateOfficeButton";
import OfficeSitePage from "./_components/OfficeSitePage";

const page = () => {
  return (
    <React.Suspense fallback={<div>Loading office sites...</div>}>
      <PageWrapper
        title='Offices & Sites'
        description='Manage your office locations and work sites'
        button={<CreateOfficeButton />}>
        <OfficeSitePage />
      </PageWrapper>
    </React.Suspense>
  );
};

export default page;
