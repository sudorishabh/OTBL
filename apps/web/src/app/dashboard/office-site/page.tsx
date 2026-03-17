"use client";
import Wrapper from "@/components/wrapper;
import React from "react";
import CreateOfficeButton from "./_components/CreateOfficeButton";
import OfficeSitePage from "./_components/OfficeSitePage";

const page = () => {
  return (
    <React.Suspense fallback={<div>Loading office sites...</div>}>
      <Wrapper
        title='Offices & Sites'
        description='Manage your office locations and work sites'
        button={<CreateOfficeButton />}>
        <OfficeSitePage />
      </Wrapper>
    </React.Suspense>
  );
};

export default page;
