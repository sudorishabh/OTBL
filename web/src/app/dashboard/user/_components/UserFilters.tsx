import React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CustomButton from "@/components/CustomButton";

interface FilterState {
  role: string;
  status: string;
}

interface Props {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const UserFilters = ({ filters, setFilters }: Props) => {
  const handleResetFilters = () => {
    setFilters({
      role: "all",
      status: "all",
    });
  };

  const hasActiveFilters = filters.role !== "all" || filters.status !== "all";

  const activeFilterCount = [
    filters.role !== "all",
    filters.status !== "all",
  ].filter(Boolean).length;

  return (
    <div className='flex items-center gap-3'>
      {/* Role Filter */}
      <div>
        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
          <option value='all'>All Roles</option>
          <option value='admin'>Admin</option>
          <option value='manager'>Manager</option>
          <option value='operator'>Operator</option>
          <option value='staff'>Staff</option>
          <option value='viewer'>Viewer</option>
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
          <option value='all'>All Status</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <CustomButton
          text='Reset'
          onClick={handleResetFilters}
          variant='outline'
          Icon={X}
          className='h-9 text-xs'
        />
      )}
    </div>
  );
};

export default UserFilters;
