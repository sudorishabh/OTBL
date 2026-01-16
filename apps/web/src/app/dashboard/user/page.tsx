"use client";
import Wrapper from "@/components/Wrapper/Wrapper";
import React from "react";
import { Plus } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import UserTable from "./_components/UserTable";
import CategorizedUsers from "./_components/CategorizedUsers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserSearchNFilter from "./_components/UserSearchNFilter";
import AddUserDialog from "./_components/CreateUserDialog";
import { useHandleParams } from "@/hooks/useHandleParams";
import ScrollToTop from "@/app/_components/ScrollToTop";

const User = () => {
  const { getParam, setParam } = useHandleParams();
  const isUserTab = getParam("tab") || "all";

  return (
    <Wrapper
      title='User Management'
      description='Manage users, assign them to offices, and track their work locations'
      button={
        <CustomButton
          text='Add User'
          Icon={Plus}
          variant='primary'
          onClick={() => setParam("dialog", "create-user")}
        />
      }>
      <Tabs
        value={isUserTab}
        onValueChange={(value) => setParam("tab", value)}
        className='w-full mt-8'>
        <div className='flex justify-between items-center flex-1 mb-4'>
          <UserSearchNFilter />
          <TabsList className='bg-gray-300/60 h-8!'>
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
          <UserTable />
        </TabsContent>

        <TabsContent value='categorized'>
          <CategorizedUsers />
        </TabsContent>
      </Tabs>
      <AddUserDialog />
      <ScrollToTop />
    </Wrapper>
  );
};

export default User;
