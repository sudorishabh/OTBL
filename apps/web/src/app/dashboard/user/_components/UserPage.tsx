"use client";
import React from "react";
import { Plus } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import UserTable from "./UserTable";
import CategorizedUsers from "./CategorizedUsers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserSearchNFilter from "./UserSearchNFilter";
import AddUserDialog from "./CreateUserDialog";
import { useHandleParams } from "@/hooks/useHandleParams";
import ScrollToTop from "@/app/_components/ScrollToTop";

const UserPage = () => {
  const { getParam, setParam } = useHandleParams();
  const isUserTab = getParam("tab") || "all";

  return (
    <>
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
    </>
  );
};

export default UserPage;
