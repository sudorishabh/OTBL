"use client";
import { Building2, Search, X } from "lucide-react";
import NoFetchData from "@/components/NoFetchData";
import { trpc } from "@/lib/trpc";
import { useOfficeManagementContext } from "@/contexts/OfficeManagementContext";
import Input from "@/components/custom-form-input/Input";
import CustomButton from "@/components/CustomButton";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import OfficeClientPageSkeleton from "./skeleton/OfficeClientPageSkeleton";
import Error from "@/components/Error";

const CreateOfficeDialog = dynamic(
  () => import("./office-site-dialogs/CreateOfficeDialog"),
);
const OfficeDetailsDialog = dynamic(
  () => import("./office-site-dialogs/OfficeDetailsDialog"),
);
const OfficeCard = dynamic(() => import("./OfficeCard"));

const OfficeSitePage = () => {
  const { setSearchQuery, filters, setFilters, searchQuery, resetFilters } =
    useOfficeManagementContext();

  const {
    data: officesQuery,
    isLoading: isOfficesQueryLoading,
    isError,
    error,
  } = trpc.officeQuery.getOffices.useQuery({
    status: filters.status,
    searchQuery: searchQuery,
  });
  const isOffice = (officesQuery?.offices?.length ?? 0) > 0;
  const offices = officesQuery?.offices ?? [];

  const hasActiveFilters = searchQuery !== "" || filters.status !== "all";

  return (
    <Suspense fallback={<OfficeClientPageSkeleton />}>
      {isOfficesQueryLoading ? (
        <OfficeClientPageSkeleton />
      ) : isError && error ? (
        <Error
          variant='default'
          message={error.message}
        />
      ) : !isOffice ? (
        <NoFetchData
          Icon={Building2}
          title={hasActiveFilters ? "No Results Found" : "No Offices Found"}
          description={
            hasActiveFilters
              ? "Try adjusting your search or filters"
              : "Add offices to manage them"
          }
        />
      ) : (
        <div className='w-full mt-8'>
          <div className='flex justify-between items-center mb-6'>
            <div className='flex items-center gap-4'>
              <div className='flex-1 w-80'>
                <Input
                  mode='standalone'
                  type='text'
                  isWhiteBg={true}
                  placeholder='Search offices by name, address, contact...'
                  disabled={isOfficesQueryLoading}
                  value={searchQuery}
                  onChange={setSearchQuery}
                  inputIcon={Search}
                  className='h-8'
                />
              </div>
              <div className='flex items-center gap-3 text-xs'>
                <Input
                  mode='standalone'
                  isWhiteBg={true}
                  isSelect
                  selectOptions={[
                    { label: "All Status", value: "all" },
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                  ]}
                  disabled={isOfficesQueryLoading}
                  placeholder='All Status'
                  value={filters.status}
                  onChange={(value) =>
                    setFilters({
                      status: value as "all" | "active" | "inactive",
                    })
                  }
                  className='h-8! w-[140px] text-xs'
                />

                {/* Reset Button */}
                {hasActiveFilters && (
                  <CustomButton
                    text='Reset'
                    onClick={resetFilters}
                    variant='outline'
                    Icon={X}
                    className='h-8 text-xs'
                  />
                )}
              </div>
            </div>
          </div>
          <div className='space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-1 gap-4'>
              {offices.map((office: any) => (
                <OfficeCard
                  key={office.id}
                  office={office}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <CreateOfficeDialog />
      <OfficeDetailsDialog />
    </Suspense>
  );
};

export default OfficeSitePage;
