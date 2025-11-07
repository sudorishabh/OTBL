import React, { useState } from "react";
import UserTable from "./UserTable";
import CategoryDialog from "./UserManagementDialogs/CategoryDialog";
import CustomButton from "@/components/CustomButton";
import { ArrowUpRight, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserCardTable from "./UserCardTable";

interface Office {
  id: number;
  name: string;
  city: string;
  state: string;
}

interface UserOffice {
  id: number;
  office_id: number;
  role: string;
  office: Office;
}

interface User {
  id: number;
  name: string;
  email: string;
  contact_number?: string | null;
  role: string;
  status: string;
  created_at: string;
  offices: UserOffice[];
}

interface Props {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onAssignOffice: (user: User) => void;
  onAssignSite: (user: User) => void;
  onViewWorkLocations: (user: User) => void;
}

const CategorizedUsers = ({
  users,
  onEdit,
  onDelete,
  onAssignOffice,
  onAssignSite,
  onViewWorkLocations,
}: Props) => {
  // State for dialog management
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  // Categorize users by role
  const managerUsers = users?.filter((user) => user.role === "manager");
  const staffUsers = users?.filter((user) => user.role === "staff");
  const operatorUsers = users?.filter((user) => user.role === "operator");
  const viewerUsers = users?.filter((user) => user.role === "viewer");

  const CategoryCard = ({
    title,
    description,
    users,
    roleType,
    icon,
  }: {
    title: string;
    description: string;
    users: User[];
    roleType: string;
    icon?: React.ReactNode;
  }) => {
    // Show only first 3 users as preview
    const previewUsers = users?.slice(0, 3);

    return (
      <Card className='flex flex-col h-full py-4 gap-4'>
        <CardHeader className='px-4'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription className='mt-1'>
                {users?.length} {users?.length === 1 ? "user" : "users"}
              </CardDescription>
            </div>
            <div className='h-8 w-8 rounded-full bg-white border group hover:border-0 flex items-center justify-center hover:bg-emerald-600 relative cursor-pointer'>
              <ArrowUpRight className='h-4 w-4 text-emerald-700 group-hover:text-white' />
            </div>
          </div>
        </CardHeader>
        <CardContent className='flex-1 px-4'>
          {users.length > 0 ? (
            <div className='space-y-2'>
              <UserCardTable
                users={previewUsers}
                onEdit={onEdit}
                onDelete={onDelete}
                onAssignOffice={onAssignOffice}
                onAssignSite={onAssignSite}
                onViewWorkLocations={onViewWorkLocations}
              />
              {users.length > 3 && (
                <p className='text-xs text-muted-foreground text-center pt-2'>
                  and {users.length - 3} more{" "}
                  {users.length - 3 === 1 ? "user" : "users"}...
                </p>
              )}
            </div>
          ) : (
            <div className='text-center py-8 text-sm text-muted-foreground'>
              No {title.toLowerCase()} found
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        <CategoryCard
          title='Manager Users'
          description='Users with manager role'
          users={managerUsers}
          roleType='manager'
        />
        <CategoryCard
          title='Operator Users'
          description='Users with operator role'
          users={operatorUsers}
          roleType='operator'
        />
        <CategoryCard
          title='Staff Users'
          description='Users with staff role'
          users={staffUsers}
          roleType='staff'
        />
        <CategoryCard
          title='Viewer Users'
          description='Users with viewer role'
          users={viewerUsers}
          roleType='viewer'
        />
      </div>

      {users?.length === 0 && (
        <div className='text-center py-12 text-muted-foreground border rounded-lg bg-white'>
          <p>No users found matching the current filters</p>
        </div>
      )}

      {/* Dialogs for each category */}
      <CategoryDialog
        open={openDialog === "manager"}
        setOpen={(open) => setOpenDialog(open ? "manager" : null)}
        title='Manager Users'
        description={`All users with manager role (${managerUsers.length} total)`}
        users={managerUsers}
        onEdit={onEdit}
        onDelete={onDelete}
        onAssignOffice={onAssignOffice}
        onAssignSite={onAssignSite}
        onViewWorkLocations={onViewWorkLocations}
      />

      <CategoryDialog
        open={openDialog === "operator"}
        setOpen={(open) => setOpenDialog(open ? "operator" : null)}
        title='Operator Users'
        description={`All users with operator role (${operatorUsers.length} total)`}
        users={operatorUsers}
        onEdit={onEdit}
        onDelete={onDelete}
        onAssignOffice={onAssignOffice}
        onAssignSite={onAssignSite}
        onViewWorkLocations={onViewWorkLocations}
      />

      <CategoryDialog
        open={openDialog === "staff"}
        setOpen={(open) => setOpenDialog(open ? "staff" : null)}
        title='Staff Users'
        description={`All users with staff role (${staffUsers.length} total)`}
        users={staffUsers}
        onEdit={onEdit}
        onDelete={onDelete}
        onAssignOffice={onAssignOffice}
        onAssignSite={onAssignSite}
        onViewWorkLocations={onViewWorkLocations}
      />

      <CategoryDialog
        open={openDialog === "viewer"}
        setOpen={(open) => setOpenDialog(open ? "viewer" : null)}
        title='Viewer Users'
        description={`All users with viewer role (${viewerUsers.length} total)`}
        users={viewerUsers}
        onEdit={onEdit}
        onDelete={onDelete}
        onAssignOffice={onAssignOffice}
        onAssignSite={onAssignSite}
        onViewWorkLocations={onViewWorkLocations}
      />
    </div>
  );
};

export default CategorizedUsers;
