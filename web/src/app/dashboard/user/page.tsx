"use client";
import Wrapper from "@/components/Wrapper";
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import AddUserDialog from "./_components/UserManagementDialogs/AddUserDialog";
import UserTable from "./_components/UserTable";
import CategorizedUsers from "./_components/CategorizedUsers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import PageLoading from "@/components/PageLoading";
import { useUserManagementContext } from "@/contexts/UserManagementContext";
import UserSearchNFilter from "./_components/UserSearchNFilter";

const User = () => {
  const [isAddUserDialog, setIsAddUserDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allUsersList, setAllUsersList] = useState<IUser[]>([]);

  const { searchQuery, filters, userNamesOrder } = useUserManagementContext();

  const allUsersQueryLimit = 40;
  const getAllUsersQuery = trpc.userQuery.getAll.useQuery({
    page: currentPage,
    limit: allUsersQueryLimit,
    searchQuery: searchQuery || undefined,
    role: filters.role,
    status: filters.status,
    userNamesOrder,
  });

  const isAllUserQueryLoading = getAllUsersQuery.isLoading;
  const { users, pagination } = getAllUsersQuery?.data || {
    users: [],
    pagination: null,
  };

  const isInitialLoading =
    isAllUserQueryLoading &&
    currentPage === 1 &&
    searchQuery === "" &&
    filters.role === "all" &&
    filters.status === "all" &&
    userNamesOrder === "latest";

  const isFetchingMore = getAllUsersQuery.isFetching && currentPage > 1;

  useEffect(() => {
    setCurrentPage(1);
    setAllUsersList([]);
  }, [searchQuery, filters.role, filters.status]);

  useEffect(() => {
    if (!users || isAllUserQueryLoading) return;
    if (pagination?.page !== currentPage) return;

    if (currentPage === 1) {
      setAllUsersList(users);
    } else {
      setAllUsersList((prev) => [...prev, ...users]);
    }
  }, [users, currentPage, isAllUserQueryLoading]);

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsAddUserDialog(true);
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  if (isInitialLoading) {
    return <PageLoading />;
  }

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
      <Tabs
        defaultValue='all'
        value={activeTab}
        onValueChange={setActiveTab}
        className='w-full mt-8'>
        <div className='flex justify-between items-center flex-1 mb-4'>
          <UserSearchNFilter />
          <TabsList className='bg-gray-300/60 !h-8'>
            <TabsTrigger
              value='all'
              className='text-xs cursor-pointer'>
              Show All
            </TabsTrigger>
            <TabsTrigger
              value='categorized'
              className='text-xs cursor-pointer'>
              Categorized
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='all'>
          <UserTable
            users={allUsersList}
            pagination={pagination}
            onEdit={handleEditUser}
            handleLoadMore={handleLoadMore}
            isLoadingData={isFetchingMore}
          />
        </TabsContent>

        <TabsContent value='categorized'>
          <CategorizedUsers
            users={allUsersList}
            onEdit={handleEditUser}
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
    </Wrapper>
  );
};

export default User;
