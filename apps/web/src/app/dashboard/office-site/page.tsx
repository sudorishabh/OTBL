import Wrapper from "@/components/Wrapper/Wrapper";
import React from "react";
import CreateOfficeButton from "./_components/CreateOfficeButton";
import OfficeSitePage from "./_components/OfficeSitePage";

const page = () => {
  return (
    <Wrapper
      title='Offices & Sites'
      description='Manage your office locations and work sites'
      button={<CreateOfficeButton />}>
      <OfficeSitePage />
    </Wrapper>
  );
};

export default page;
