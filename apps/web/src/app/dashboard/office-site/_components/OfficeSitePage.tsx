"use client";
import { Building2, Search, X } from "lucide-react";
import OfficeCard from "./OfficeCard";
import NoFetchData from "@/components/NoFetchData";
import CreateOfficeDialog from "./office-site-dialogs/CreateOfficeDialog";
import { trpc } from "@/lib/trpc";
import { useOfficeManagementContext } from "@/contexts/OfficeManagementContext";
import CustomInput from "@/components/CustomInput";
import PageLoading from "@/components/PageLoading";
import CustomButton from "@/components/CustomButton";

const OfficeSitePage = () => {
  const { setSearchQuery, filters, setFilters, searchQuery, resetFilters } =
    useOfficeManagementContext();

  const { data: officesQuery, isLoading: officesLoading } =
    trpc.officeQuery.getOffices.useQuery({
      status: filters.status,
      searchQuery: searchQuery,
    });
  const isOffice = (officesQuery?.offices?.length ?? 0) > 0;
  const offices = officesQuery?.offices ?? [];

  const hasActiveFilters = searchQuery !== "" || filters.status !== "all";

  if (officesLoading) {
    return <PageLoading />;
  }

  return (
    <>
      <div className='w-full mt-8'>
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center gap-4'>
            <div className='flex-1 w-80'>
              <CustomInput
                mode='standalone'
                type='text'
                placeholder='Search offices by name, address, contact...'
                value={searchQuery}
                onChange={setSearchQuery}
                inputIcon={Search}
                className='h-8'
              />
            </div>
            <div className='flex items-center gap-3 text-xs'>
              {/* Status Filter */}
              <CustomInput
                mode='standalone'
                isSelect
                selectOptions={[
                  { label: "All Status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                placeholder='All Status'
                value={filters.status}
                onChange={(value) =>
                  setFilters({ status: value as "all" | "active" | "inactive" })
                }
                className='!h-8 w-[140px] text-xs'
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

        {isOffice ? (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-1 gap-4'>
              {offices.map((office) => (
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
      </div>
      <CreateOfficeDialog />
    </>
  );
};

export default OfficeSitePage;
