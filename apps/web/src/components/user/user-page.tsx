"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserSearchNFilter from "./User-search-filter";
import { useHandleParams } from "@/hooks/useHandleParams";
import ScrollToTop from "@/app/_components/ScrollToTop";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import UserTabSkeleton from "../skeleton/user/user-tab-skeleton";

const UserTable = dynamic(() => import("./user-table"));
const CategorizedUsers = dynamic(() => import("./categorized-users"));
const CreateUpdateUserDialog = dynamic(
  () => import("./create-update-user-dialog"),
);

const UserPage = () => {
  const { getParam, setParam } = useHandleParams();
  const currentTab = getParam("tab") || "all";

  return (
    <>
      <Tabs
        value={currentTab}
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

        <Suspense fallback={<UserTabSkeleton />}>
          <TabsContent value='all'>
            <UserTable />
          </TabsContent>

          <TabsContent value='categorized'>
            <CategorizedUsers />
          </TabsContent>
        </Suspense>
      </Tabs>
      <CreateUpdateUserDialog />
      <ScrollToTop />
    </>
  );
};

export default UserPage;
