"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserSearchNFilter from "./UserSearchNFilter";
import { useHandleParams } from "@/hooks/useHandleParams";
import ScrollToTop from "@/app/_components/ScrollToTop";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import UserPageSkeleton from "./skeleton/UserPageSkeleton";

const UserTable = dynamic(() => import("./UserTable"));
const CategorizedUsers = dynamic(() => import("./CategorizedUsers"));
const CreateUpdateUserDialog = dynamic(
  () => import("./CreateUpdateUserDialog"),
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

        <Suspense fallback={<UserPageSkeleton />}>
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
