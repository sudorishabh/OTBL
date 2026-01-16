"use client";
import React from "react";
import Wrapper from "@/components/Wrapper/Wrapper";
import CustomButton from "@/components/CustomButton";
import { Building2, Plus, Users } from "lucide-react";
import AddClientDialog from "./_components/AddClientDialog";
import AddClientContactDialog from "./_components/AddClientContactDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import ClientContactTab from "./_components/ClientContactTab";
import ClientsTab from "./_components/ClientsTab";
import ClientSearchNFilter from "./_components/ClientSearchNFilter";
import useHandleParams from "@/hooks/useHandleParams";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";

interface Client {
  id: number;
  name: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  gst_number: string;
  contact_number: string;
  email: string;
  status: "active" | "inactive";
  created_at?: string | Date;
  updated_at?: string | Date;
}

const Client = () => {
  const { getParam, setParam } = useHandleParams();
  const clientsTab = getParam("tab") || "clients";

  const { data, isLoading: isClientsLoading } =
    trpc.clientQuery.totalClientAndContact.useQuery();

  const handleTabChange = (value: string) => {
    setParam("tab", value);
  };

  const handleAddClient = () => {
    setParam("mode", "client-add");
  };

  return (
    <Wrapper
      title='Clients'
      description='Manage and monitor all your clients and their contacts'
      button={
        <CustomButton
          text='Add Client'
          Icon={Plus}
          onClick={handleAddClient}
          variant='primary'
        />
      }>
      <div className='space-y-4 mt-8'>
        <Tabs
          value={clientsTab}
          onValueChange={handleTabChange}
          className='w-full'>
          <div className='flex items-center justify-between mb-4'>
            <ClientSearchNFilter
              type={clientsTab === "clients" ? "clients" : "contacts"}
            />

            <TabsList className='bg-gray-300/60 h-8! mr-4'>
              <TabsTrigger
                value='clients'
                className='text-xs cursor-pointer flex items-center gap-2'>
                <Building2 className='h-4 w-4' />
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
                <Users className='h-4 w-4' />
                Contacts
                <Badge
                  variant='secondary'
                  className='ml-1 text-xs rounded-full'>
                  {data?.totalContacts || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='clients'>
            <ClientsTab tab={clientsTab} />
          </TabsContent>

          <TabsContent value='contacts'>
            <ClientContactTab tab={clientsTab} />
          </TabsContent>
        </Tabs>
      </div>

      <AddClientDialog />

      <AddClientContactDialog />
    </Wrapper>
  );
};

export default Client;
