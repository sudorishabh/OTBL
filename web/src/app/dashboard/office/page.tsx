"use client";
import Wrapper from "@/components/Wrapper";
import React, { useState, useEffect } from "react";
import OfficeCard from "./_components/OfficeCard";
import { Office } from "@/types/office.types";
import { Plus, Building2 } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import NoFetchData from "@/components/NoFetchData";
import AddOfficeDialog from "./_components/AddOfficeDialog";
import { trpc } from "@/lib/trpc";
import PageLoading from "@/components/PageLoading";
import LoadMoreBtn from "@/components/LoadMoreBtn";
import OfficeSearchNFilter from "./_components/OfficeSearchNFilter";
import { useOfficeManagementContext } from "@/contexts/OfficeManagementContext";

const Offices = () => {
  const [isAddOfficeDialog, setIsAddOfficeDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allOffices, setAllOffices] = useState<Office[]>([]);

  const { searchQuery, filters, officeNamesOrder } =
    useOfficeManagementContext();

  const officesQueryLimit = 40;
  const getOfficesPaginated = trpc.officeQuery.getOfficesPaginated.useQuery({
    page: currentPage,
    limit: officesQueryLimit,
    searchQuery: searchQuery || undefined,
    status: filters.status,
    officeNamesOrder,
  });

  const isOfficesLoading = getOfficesPaginated.isLoading;
  const { offices, pagination } = getOfficesPaginated?.data || {
    offices: [],
    pagination: null,
  };

  const isInitialLoading =
    isOfficesLoading &&
    currentPage === 1 &&
    searchQuery === "" &&
    filters.status === "all" &&
    officeNamesOrder === "latest";

  const isFetchingMore = getOfficesPaginated.isFetching && currentPage > 1;

  useEffect(() => {
    setCurrentPage(1);
    setAllOffices([]);
  }, [searchQuery, filters.status]);

  useEffect(() => {
    if (!offices || isOfficesLoading) return;
    if (pagination?.page !== currentPage) return;

    if (currentPage === 1) {
      setAllOffices(offices);
    } else {
      setAllOffices((prev) => [...prev, ...offices]);
    }
  }, [offices, currentPage, isOfficesLoading]);

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const isOffices = allOffices.length > 0;

  if (isInitialLoading) {
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
      <div className='w-full mt-8'>
        <div className='flex justify-between items-center mb-6'>
          <OfficeSearchNFilter />
        </div>

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

            {pagination?.hasMore && (
              <LoadMoreBtn
                onClick={handleLoadMore}
                loading={isFetchingMore}
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
      </div>

      <AddOfficeDialog
        open={isAddOfficeDialog}
        setOpen={setIsAddOfficeDialog}
      />
    </Wrapper>
  );
};

export default Offices;
