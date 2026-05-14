import React from "react";
import Input from "../shared/input";
import { Search } from "lucide-react";
import CustomButton from "../shared/btn";
import { X } from "lucide-react";

const OfficeSiteFilter = ({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  resetFilters,
  isOfficesQueryLoading,
  hasActiveFilters,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    status: "active" | "inactive" | "all";
  };
  setFilters: (filters: { status: "active" | "inactive" | "all" }) => void;
  resetFilters: () => void;
  isOfficesQueryLoading: boolean;
  hasActiveFilters: boolean;
}) => {
  return (
    <div className='flex justify-between items-center mb-6'>
      <div className='flex items-center gap-4'>
        <div className='flex-1 w-80'>
          <Input
            mode='standalone'
            type='text'
            isWhiteBg={true}
            placeholder='Search offices by name, address, contact...'
            value={searchQuery}
            onChange={setSearchQuery}
            inputIcon={Search}
            className='h-8 placeholder:text-xs'
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
  );
};

export default OfficeSiteFilter;
