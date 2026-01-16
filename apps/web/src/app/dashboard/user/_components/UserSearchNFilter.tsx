import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { useUserManagementContext } from "@/contexts/UserManagementContext";
import { Search, X } from "lucide-react";
import React from "react";

interface Props {
  showResetButton?: boolean;
  showRoleFilter?: boolean;
}

const UserSearchNFilter = ({
  showResetButton = true,
  showRoleFilter = true,
}: Props) => {
  const { searchQuery, setSearchQuery, filters, setFilters, resetFilters } =
    useUserManagementContext();

  const hasActiveFilters =
    searchQuery !== "" || filters.role !== "all" || filters.status !== "all";

  return (
    <div className=' flex items-center gap-4'>
      {/* Search Input */}
      <div className='flex-1 w-80'>
        <CustomInput
          mode='standalone'
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder='Search users by name, email, or contact...'
          inputIcon={Search}
        />
      </div>

      <div className='flex items-center gap-3 text-xs'>
        {/* Role Filter */}
        {showRoleFilter && (
          <CustomInput
            mode='standalone'
            value={filters.role}
            onChange={(value) =>
              setFilters({
                ...filters,
                role: value as
                  | "all"
                  | "manager"
                  | "staff"
                  | "viewer"
                  | "operator",
              })
            }
            isSelect
            selectOptions={[
              { label: "All Roles", value: "all" },
              { label: "Manager", value: "manager" },
              { label: "Operator", value: "operator" },
              { label: "Staff", value: "staff" },
              { label: "Viewer", value: "viewer" },
            ]}
            className='h-8! w-[140px] text-xs cursor-pointer'
          />
        )}

        {/* Status Filter */}
        <CustomInput
          mode='standalone'
          value={filters.status}
          onChange={(value) =>
            setFilters({
              ...filters,
              status: value as "all" | "active" | "inactive",
            })
          }
          isSelect
          selectOptions={[
            { label: "All Status", value: "all" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
          className='h-8! w-[140px] text-xs cursor-pointer'
        />

        {/* Reset Button */}
        {hasActiveFilters && showResetButton && (
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

export default UserSearchNFilter;
