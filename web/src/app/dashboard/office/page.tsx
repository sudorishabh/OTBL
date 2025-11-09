"use client";
import Wrapper from "@/components/Wrapper";
import React, { useState, useEffect } from "react";
import OfficeFilterTab from "./_components/OfficeFilterTab";
import OfficeCard from "./_components/OfficeCard";
import { Office } from "@/types/office.types";
import { Plus, Building2 } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import NoFetchData from "@/components/NoFetchData";
import AddOfficeDialog from "./_components/AddOfficeDialog";
import { trpc } from "@/lib/trpc";
import PageLoading from "@/components/PageLoading";
import LoadMoreBtn from "@/components/LoadMoreBtn";

const Offices = () => {
  const [isAddOfficeDialog, setIsAddOfficeDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allOffices, setAllOffices] = useState<Office[]>([]);

  const officesQueryLimit = 40;
  const getOfficesPaginated = trpc.officeQuery.getOfficesPaginated.useQuery({
    page: currentPage,
    limit: officesQueryLimit,
  });

  const isOfficesLoading = getOfficesPaginated.isLoading;
  const officesData = getOfficesPaginated.data;

  useEffect(() => {
    if (officesData && !isOfficesLoading) {
      if (currentPage === 1) {
        setAllOffices(officesData.offices);
      } else {
        setAllOffices((prev) => [...prev, ...officesData.offices]);
      }
    }
  }, [officesData, currentPage]);

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const isOffices = allOffices.length > 0;

  if (isOfficesLoading) {
    return <PageLoading />;
  }

  return (
    <Wrapper
      title='Offices'
      description='Manage and monitor all your office locations'
      button={
        <CustomButton
          text='Add Office'
          Icon={Plus}
          onClick={() => setIsAddOfficeDialog(true)}
          variant='primary'
        />
      }>
      {isOffices && (
        <OfficeFilterTab
          officeLength={officesData?.pagination.total || allOffices.length}
        />
      )}

      {isOffices ? (
        <div className='space-y-6'>
          <div className='grid grid-cols-2 gap-5'>
            {allOffices.map((office) => (
              <OfficeCard
                key={office.id}
                office={office}
              />
            ))}
          </div>

          {officesData?.pagination.hasMore && (
            <LoadMoreBtn
              onClick={handleLoadMore}
              loading={isOfficeLoading}
            />
          )}
        </div>
      ) : (
        <NoFetchData
          Icon={Building2}
          title='No offices found'
          description='Start by adding your first office location.'
        />
      )}
      <AddOfficeDialog
        open={isAddOfficeDialog}
        setOpen={setIsAddOfficeDialog}
      />
    </Wrapper>
  );
};

export default Offices;
