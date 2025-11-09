import CustomButton from "@/components/CustomButton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSiteManagementContext } from "@/contexts/SiteManagementContext";
import { Search, X } from "lucide-react";
import React from "react";

const SiteSearchNFilter = () => {
  const { searchQuery, setSearchQuery, filters, setFilters, resetFilters } =
    useSiteManagementContext();

  const hasActiveFilters = searchQuery !== "" || filters.status !== "all";

  return (
    <div className='flex items-center gap-4'>
      <div className='relative flex-1 w-80'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          type='text'
          placeholder='Search sites by name, address, contact...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='pl-10 h-8 bg-white'
        />
      </div>
      <div className='flex items-center gap-3 text-xs'>
        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ status: value })}>
          <SelectTrigger className='!h-8 w-[140px] bg-white text-xs cursor-pointer'>
            <SelectValue placeholder='All Status' />
          </SelectTrigger>
          <SelectContent className='text-xs'>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='inactive'>Inactive</SelectItem>
          </SelectContent>
        </Select>

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
  );
};

export default SiteSearchNFilter;
