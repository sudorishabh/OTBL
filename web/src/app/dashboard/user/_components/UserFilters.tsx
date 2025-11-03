import React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CustomButton from "@/components/CustomButton";

interface Office {
  id: number;
  name: string;
}

interface FilterState {
  role: string;
  status: string;
  officeId: string;
  hasOffices: string;
}

interface Props {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableOffices: Office[];
}

const UserFilters = ({ filters, setFilters, availableOffices }: Props) => {
  const handleResetFilters = () => {
    setFilters({
      role: "all",
      status: "all",
      officeId: "all",
      hasOffices: "all",
    });
  };

  const hasActiveFilters =
    filters.role !== "all" ||
    filters.status !== "all" ||
    filters.officeId !== "all" ||
    filters.hasOffices !== "all";

  const activeFilterCount = [
    filters.role !== "all",
    filters.status !== "all",
    filters.officeId !== "all",
    filters.hasOffices !== "all",
  ].filter(Boolean).length;

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-medium'>Filters</h3>
        {hasActiveFilters && (
          <div className='flex items-center gap-2'>
            <Badge variant='secondary'>{activeFilterCount} active</Badge>
            <CustomButton
              text='Reset'
              onClick={handleResetFilters}
              variant='outline'
              Icon={X}
              className='h-8 text-xs'
            />
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
        {/* Role Filter */}
        <div>
          <label className='text-xs font-medium text-muted-foreground mb-1.5 block'>
            Role
          </label>
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
          <label className='text-xs font-medium text-muted-foreground mb-1.5 block'>
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
            <option value='all'>All Status</option>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
          </select>
        </div>

        {/* Office Filter */}
        <div>
          <label className='text-xs font-medium text-muted-foreground mb-1.5 block'>
            Office
          </label>
          <select
            value={filters.officeId}
            onChange={(e) =>
              setFilters({ ...filters, officeId: e.target.value })
            }
            className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
            <option value='all'>All Offices</option>
            {availableOffices.map((office) => (
              <option
                key={office.id}
                value={office.id}>
                {office.name}
              </option>
            ))}
          </select>
        </div>

        {/* Has Office Assignment Filter */}
        <div>
          <label className='text-xs font-medium text-muted-foreground mb-1.5 block'>
            Office Assignment
          </label>
          <select
            value={filters.hasOffices}
            onChange={(e) =>
              setFilters({ ...filters, hasOffices: e.target.value })
            }
            className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
            <option value='all'>All Users</option>
            <option value='assigned'>With Offices</option>
            <option value='unassigned'>Without Offices</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
