"use client";
import React from "react";
import { Building2, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientSearchNFilter from "./ClientSearchNFilter";
import useHandleParams from "@/hooks/useHandleParams";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import ClientPageSkeleton from "./skeleton/ClientPageSkeleton";

const ClientsTab = dynamic(() => import("./ClientsTab"));
const ClientContactTab = dynamic(() => import("./ClientContactTab"));
const CreateClientDialog = dynamic(() => import("./CreateClientDialog"));
const CreateClientContactDialog = dynamic(
  () => import("./CreateClientContactDialog"),
);

const ClientsPage = () => {
  const { getParam, setParam } = useHandleParams();
  const clientsTab = getParam("tab") || "clients";

  const { data, isLoading: isClientsLoading } =
    trpc.clientQuery.totalClientAndContact.useQuery();

  const handleTabChange = (value: string) => {
    setParam("tab", value);
  };

  return (
    <>
      <div className='space-y-4 mt-8'>
        <Tabs
          value={clientsTab}
          onValueChange={handleTabChange}
          className='w-full'>
          <div className='flex items-center justify-between mb-4'>
            <ClientSearchNFilter
              isLoading={isClientsLoading}
              type={clientsTab === "clients" ? "clients" : "contacts"}
            />

            <TabsList className='bg-gray-300/60 h-8! mr-4'>
              <TabsTrigger
                value='clients'
                className='text-xs cursor-pointer flex items-center gap-2'>
                <Building2 className='h-4 w-4 text-gray-500' />
                Clients
                <Badge
                  variant='secondary'
                  className='ml-1 text-xs rounded-full'>
                  {data?.totalClients || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value='contacts'
                className='text-xs cursor-pointer flex items-center gap-2'>
                <Users className='h-4 w-4 text-gray-500' />
                Contacts
                <Badge
                  variant='secondary'
                  className='ml-1 text-xs rounded-full'>
                  {data?.totalContacts || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>
          <Suspense fallback={<ClientPageSkeleton />}>
            <TabsContent value='clients'>
              <ClientsTab tab={clientsTab} />
            </TabsContent>

            <TabsContent value='contacts'>
              <ClientContactTab tab={clientsTab} />
            </TabsContent>
          </Suspense>
        </Tabs>
      </div>

      <CreateClientDialog />
      <CreateClientContactDialog />
    </>
  );
};

export default ClientsPage;
