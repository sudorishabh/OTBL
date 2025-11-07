"use client";
import Wrapper from "@/components/Wrapper";
import React, { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import AddUserDialog from "./_components/UserManagementDialogs/AddUserDialog";
import AssignOfficeDialog from "./_components/UserManagementDialogs/AssignOfficeDialog";
import AssignSiteDialog from "./_components/UserManagementDialogs/AssignSiteDialog";
import DeleteUserDialog from "./_components/UserManagementDialogs/DeleteUserDialog";
import UserWorkLocationsDialog from "./_components/UserManagementDialogs/UserWorkLocationsDialog";
import UserTable from "./_components/UserTable";
import UserFilters from "./_components/UserFilters";
import CategorizedUsers from "./_components/CategorizedUsers";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

const User = () => {
  const [isAddUserDialog, setIsAddUserDialog] = useState(false);
  const [isAssignOfficeDialog, setIsAssignOfficeDialog] = useState(false);
  const [isAssignSiteDialog, setIsAssignSiteDialog] = useState(false);
  const [isDeleteUserDialog, setIsDeleteUserDialog] = useState(false);
  const [isWorkLocationsDialog, setIsWorkLocationsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
  });
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    name: string;
    email: string;
    contact_number?: string | null;
    role: string;
    status: string;
    offices?: any[];
  } | null>(null);

  // /////////////////////////////////////////////////////////////////////////////////////////////

  const getAllUsersQuery = trpc.userQuery.getAll.useQuery();
  const allUsers = getAllUsersQuery?.data || [];

  console.log("All Users:", allUsers);

  // Advanced filtering with search and multiple criteria
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user: any) => {
      // Search filter
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.contact_number &&
          user.contact_number
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      // Role filter
      const matchesRole = filters.role === "all" || user.role === filters.role;

      // Status filter
      const matchesStatus =
        filters.status === "all" || user.status === filters.status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchQuery, filters, allUsers]);

  // /////////////////////////////////////////////////////////////////////////////////////////////

  if (getAllUsersQuery.isLoading || !getAllUsersQuery.data) {
    return (
      <Wrapper
        title='User Management'
        description='Manage users, assign them to offices, and track their work locations'>
        <div>Loading users...</div>
      </Wrapper>
    );
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsAddUserDialog(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setIsDeleteUserDialog(true);
  };

  const handleAssignOffice = (user: any) => {
    setSelectedUser(user);
    setIsAssignOfficeDialog(true);
  };

  const handleAssignSite = (user: any) => {
    setSelectedUser(user);
    setIsAssignSiteDialog(true);
  };

  const handleViewWorkLocations = (user: any) => {
    setSelectedUser(user);
    setIsWorkLocationsDialog(true);
  };

  const handleConfirmDelete = () => {
    console.log("Delete user:", selectedUser?.id);
    // TODO: Implement actual delete mutation
    // await deleteUser.mutateAsync({ id: selectedUser.id });
  };

  return (
    <Wrapper
      title='User Management'
      description='Manage users, assign them to offices, and track their work locations'
      button={
        <CustomButton
          text='Add User'
          Icon={Plus}
          onClick={() => {
            setSelectedUser(null);
            setIsAddUserDialog(true);
          }}
          variant='primary'
        />
      }>
      {/* Filters and Search Bar */}

      {/* Results count */}
      {/* <div className='mb-4 flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          Showing <span className='font-medium'>{filteredUsers?.length}</span>{" "}
          {filteredUsers?.length === 1 ? "user" : "users"}
          {(searchQuery ||
            filters.role !== "all" ||
            filters.status !== "all") && (
            <span> (filtered from {allUsers.length} total)</span>
          )}
        </p>
      </div> */}

      {/* Tabs for Categorized and Show All */}
      <Tabs
        defaultValue='all'
        value={activeTab}
        onValueChange={setActiveTab}
        className='w-full mt-8'>
        <div className='flex justify-between items-center'>
          <TabsList>
            <TabsTrigger value='all'>Show All</TabsTrigger>
            <TabsTrigger value='categorized'>Categorized</TabsTrigger>
          </TabsList>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              Showing
              <span className='font-medium'>{filteredUsers?.length}</span>{" "}
              {filteredUsers?.length === 1 ? "user" : "users"}
              {(searchQuery ||
                filters.role !== "all" ||
                filters.status !== "all") && (
                <span> (filtered from {allUsers.length} total)</span>
              )}
            </p>
          </div>
        </div>
        <TabsContent value='all'>
          <div className='my-5 flex items-center gap-4'>
            <UserFilters
              filters={filters}
              setFilters={setFilters}
            />
            <div className='relative flex-1 max-w-md bg-white'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                type='text'
                placeholder='Search users by name, email, role, or contact...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
          <UserTable
            users={filteredUsers}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onAssignOffice={handleAssignOffice}
            onAssignSite={handleAssignSite}
            onViewWorkLocations={handleViewWorkLocations}
          />
        </TabsContent>

        <TabsContent value='categorized'>
          <CategorizedUsers
            users={filteredUsers}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onAssignOffice={handleAssignOffice}
            onAssignSite={handleAssignSite}
            onViewWorkLocations={handleViewWorkLocations}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddUserDialog
        open={isAddUserDialog}
        setOpen={setIsAddUserDialog}
        isEditInfo={selectedUser}
        setIsEditInfo={setSelectedUser}
      />

      <AssignOfficeDialog
        open={isAssignOfficeDialog}
        setOpen={setIsAssignOfficeDialog}
        userId={selectedUser?.id ?? null}
        userName={selectedUser?.name ?? ""}
        currentOffices={selectedUser?.offices ?? []}
      />

      <AssignSiteDialog
        open={isAssignSiteDialog}
        setOpen={setIsAssignSiteDialog}
        userId={selectedUser?.id ?? null}
        userName={selectedUser?.name ?? ""}
      />

      <DeleteUserDialog
        open={isDeleteUserDialog}
        setOpen={setIsDeleteUserDialog}
        userId={selectedUser?.id ?? null}
        userName={selectedUser?.name ?? ""}
        onConfirm={handleConfirmDelete}
      />

      {/* <UserWorkLocationsDialog
        open={isWorkLocationsDialog}
        setOpen={setIsWorkLocationsDialog}
        userName={selectedUser?.name ?? ""}
        workLocations={mockWorkLocations}
      /> */}
    </Wrapper>
  );
};

export default User;
