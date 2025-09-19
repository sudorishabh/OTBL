"use client";
import Wrapper from "@/components/Wrapper";
import React, { useState } from "react";
import OfficeFilterTab from "./_components/OfficeFilterTab";
import { Button } from "@/components/ui/button";
import OfficeCard from "./_components/OfficeCard";
import { Office } from "@/types/office.types";
import { Plus, Building2 } from "lucide-react";
import Icon from "@/components/custom/CustomIcon";
import CustomButton from "@/components/custom/CustomButton";
import NoFetchData from "@/components/NoFetchData";
import AddOfficeDialog from "./_components/AddOfficeDialog";
import { trpc } from "@/lib/trpc";
import PageFetchingData from "@/components/PageFetchingData";
import { Input } from "@/components/ui/input";

// const offices: Office[] = [];

const Offices = () => {
  const [open, setOpen] = useState(false);

  const getOffices = trpc.office.getOffices.useQuery();
  const officesData = getOffices.data;
  const isOffices = officesData && officesData.length > 0;
  const isOfficeLoading = getOffices.isLoading;

  if (isOfficeLoading) {
    return <PageFetchingData title='' />;
  }

  return (
    <Wrapper
      title='Offices'
      description='Manage and monitor all your office locations'
      button={
        <CustomButton
          text='Add Office'
          Icon={Plus}
          onClick={() => setOpen(true)}
        />
      }>
      {isOffices && <OfficeFilterTab officeLength={officesData.length} />}

      {isOffices ? (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {officesData.map((office) => (
              <OfficeCard
                key={office.id}
                office={office}
              />
            ))}
          </div>
        </div>
      ) : (
        <NoFetchData
          Icon={Building2}
          title='No offices found'
          description='Start by adding your first office location.'
        />
      )}
      <AddOfficeDialog
        open={open}
        setOpen={setOpen}
      />
    </Wrapper>
  );
};

export default Offices;
