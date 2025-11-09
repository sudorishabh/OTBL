"use client";
import React, { useState, useEffect } from "react";
import Wrapper from "@/components/Wrapper";
import CustomButton from "@/components/CustomButton";
import { Plus, Building2, Users } from "lucide-react";
import AddClientDialog from "./_components/AddClientDialog";
import AddClientContactDialog from "./_components/AddClientContactDialog";
import EditClientDialog from "./_components/EditClientDialog";
import ClientTable from "./_components/ClientTable";
import ClientContactsTable from "./_components/ClientContactsTable";
import PageLoading from "@/components/PageLoading";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useClientManagementContext } from "@/contexts/ClientManagementContext";
import ClientSearchNFilter from "./_components/ClientSearchNFilter";

interface ClientContact {
  id: number;
  client_id: number;
  name: string;
  designation?: string;
  contact_number: string;
  email: string;
  contact_type?: string;
}

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
  const [isAddClientDialog, setIsAddClientDialog] = useState(false);
  const [isAddContactDialog, setIsAddContactDialog] = useState(false);
  const [isEditClientDialog, setIsEditClientDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedClientContacts, setSelectedClientContacts] = useState<
    ClientContact[]
  >([]);
  const [activeTab, setActiveTab] = useState("clients");
  const [currentPage, setCurrentPage] = useState(1);
  const [allClientsList, setAllClientsList] = useState<Client[]>([]);

  const {
    clientSearchQuery,
    clientFilters,
    contactSearchQuery,
    contactFilters,
  } = useClientManagementContext();

  const allClientsQueryLimit = 40;
  const getClientsQuery = trpc.clientQuery.getClients.useQuery({
    page: currentPage,
    limit: allClientsQueryLimit,
    searchQuery: clientSearchQuery || undefined,
    status: clientFilters.status,
  });

  const [contactsCurrentPage, setContactsCurrentPage] = useState(1);
  const [allContactsList, setAllContactsList] = useState<ClientContact[]>([]);

  const getContactsQuery = trpc.clientQuery.getAllClientContacts.useQuery({
    page: contactsCurrentPage,
    limit: allClientsQueryLimit,
    searchQuery: contactSearchQuery || undefined,
    clientId: contactFilters.clientId,
  });

  const isAllClientQueryLoading = getClientsQuery.isLoading;
  const { clients, pagination } = getClientsQuery?.data || {
    clients: [],
    pagination: null,
  };

  const isAllContactQueryLoading = getContactsQuery.isLoading;
  const { contacts: fetchedContacts, pagination: contactsPagination } =
    getContactsQuery?.data || {
      contacts: [],
      pagination: null,
    };

  const isInitialLoading =
    isAllClientQueryLoading &&
    currentPage === 1 &&
    clientSearchQuery === "" &&
    clientFilters.status === "all";

  const isFetchingMore = getClientsQuery.isFetching && currentPage > 1;
  const isFetchingMoreContacts =
    getContactsQuery.isFetching && contactsCurrentPage > 1;

  useEffect(() => {
    setCurrentPage(1);
    setAllClientsList([]);
  }, [clientSearchQuery, clientFilters.status]);

  useEffect(() => {
    setContactsCurrentPage(1);
    setAllContactsList([]);
  }, [contactSearchQuery, contactFilters.clientId]);

  useEffect(() => {
    if (!clients || isAllClientQueryLoading) return;
    if (pagination?.page !== currentPage) return;

    if (currentPage === 1) {
      setAllClientsList(clients);
    } else {
      setAllClientsList((prev) => [...prev, ...clients]);
    }
  }, [clients, currentPage, isAllClientQueryLoading, pagination?.page]);

  useEffect(() => {
    if (!fetchedContacts || isAllContactQueryLoading) return;
    if (contactsPagination?.page !== contactsCurrentPage) return;

    if (contactsCurrentPage === 1) {
      setAllContactsList(fetchedContacts);
    } else {
      setAllContactsList((prev) => [...prev, ...fetchedContacts]);
    }
  }, [
    fetchedContacts,
    contactsCurrentPage,
    isAllContactQueryLoading,
    contactsPagination?.page,
  ]);

  const hasClients = allClientsList.length > 0;
  const hasContacts = allContactsList.length > 0;

  // Convert contacts to the format expected by AddClientDialog
  const existingContactsForDialog = allContactsList.map((contact: any) => ({
    ...contact,
    id: contact.id.toString(),
  }));

  const handleEditClient = (client: Client, contacts: ClientContact[]) => {
    setSelectedClient(client);
    setSelectedClientContacts(contacts);
    setIsEditClientDialog(true);
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleLoadMoreContacts = () => {
    setContactsCurrentPage((prev) => prev + 1);
  };

  if (isInitialLoading) {
    return <PageLoading />;
  }

  return (
    <Wrapper
      title='Clients'
      description='Manage and monitor all your clients and their contacts'
      button={
        <CustomButton
          text='Add Client'
          Icon={Plus}
          onClick={() => setIsAddClientDialog(true)}
          variant='primary'
        />
      }>
      <div className='space-y-4 mt-8'>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='w-full'>
          <div className='flex items-center justify-between mb-4'>
            <ClientSearchNFilter
              type={activeTab === "clients" ? "clients" : "contacts"}
              clients={allClientsList}
              onAddContact={() => setIsAddContactDialog(true)}
            />

            <TabsList className='bg-gray-300/60 !h-8 mr-4'>
              <TabsTrigger
                value='clients'
                className='text-xs cursor-pointer flex items-center gap-2'>
                {/* <Building2 className='h-4 w-4' /> */}
                Clients
                <Badge
                  variant='secondary'
                  className='ml-1 text-xs rounded-full'>
                  {pagination?.total || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value='contacts'
                className='text-xs cursor-pointer flex items-center gap-2'>
                {/* <Users className='h-4 w-4' /> */}
                Contacts
                <Badge
                  variant='secondary'
                  className='ml-1 text-xs rounded-full'>
                  {contactsPagination?.total || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Clients Tab */}
          <TabsContent value='clients'>
            <ClientTable
              clients={allClientsList}
              contacts={allContactsList}
              pagination={pagination}
              onEdit={handleEditClient}
              handleLoadMore={handleLoadMore}
              isLoadingData={isFetchingMore}
            />
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value='contacts'>
            <ClientContactsTable
              contacts={allContactsList}
              clients={allClientsList}
              pagination={contactsPagination}
              handleLoadMore={handleLoadMoreContacts}
              isLoadingData={isFetchingMoreContacts}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AddClientDialog
        open={isAddClientDialog}
        setOpen={setIsAddClientDialog}
        existingContacts={existingContactsForDialog}
      />

      <AddClientContactDialog
        open={isAddContactDialog}
        setOpen={setIsAddContactDialog}
        clients={clients}
      />

      <EditClientDialog
        open={isEditClientDialog}
        setOpen={setIsEditClientDialog}
        client={selectedClient}
        existingContacts={selectedClientContacts}
      />
    </Wrapper>
  );
};

export default Client;
