"use client";
import React, { useState } from "react";
import Wrapper from "@/components/Wrapper";
import CustomButton from "@/components/CustomButton";
import { Plus, Building2, Search, Users, UserPlus } from "lucide-react";
import AddClientDialog from "./_components/AddClientDialog";
import AddClientContactDialog from "./_components/AddClientContactDialog";
import EditClientDialog from "./_components/EditClientDialog";
import ClientRow from "./_components/ClientRow";
import ClientContactsTable from "./_components/ClientContactsTable";
import NoFetchData from "@/components/NoFetchData";
import PageLoading from "@/components/PageLoading";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("clients");

  // Fetch clients and contacts from API
  const getClientsQuery = trpc.clientQuery.getClients.useQuery();
  const getContactsQuery = trpc.clientQuery.getAllClientContacts.useQuery();

  const clients = getClientsQuery.data || [];
  const allContacts = getContactsQuery.data || [];
  const isLoading = getClientsQuery.isLoading || getContactsQuery.isLoading;

  const filteredClients = clients.filter(
    (client: Client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.gst_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasClients = clients.length > 0;
  const hasFilteredClients = filteredClients.length > 0;

  // Convert contacts to the format expected by AddClientDialog
  const existingContactsForDialog = allContacts.map((contact: any) => ({
    ...contact,
    id: contact.id.toString(),
  }));

  const handleEditClient = (client: Client, contacts: ClientContact[]) => {
    setSelectedClient(client);
    setSelectedClientContacts(contacts);
    setIsEditClientDialog(true);
  };

  if (isLoading) {
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
        {/* Stats Bar */}
        <div className='grid grid-cols-3 gap-3'>
          <div className='bg-white border border-gray-200 rounded-lg p-3'>
            <div className='flex items-center gap-2'>
              {/* <Building2 className='h-4 w-4 text-[#035864]' /> */}
              <div>
                <p className='text-xs text-gray-500'>Total Clients</p>
                <p className='text-lg font-semibold text-gray-900'>
                  {clients.length}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white border border-gray-200 rounded-lg p-3'>
            <div className='flex items-center gap-2'>
              {/* <Badge className='h-4 w-4 bg-green-500'></Badge> */}
              <div>
                <p className='text-xs text-gray-500'>Active</p>
                <p className='text-lg font-semibold text-gray-900'>
                  {clients.filter((c: Client) => c.status === "active").length}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white border border-gray-200 rounded-lg p-3'>
            <div className='flex items-center gap-2'>
              {/* <Users className='h-4 w-4 text-[#035864]' /> */}
              <div>
                <p className='text-xs text-gray-500'>Total Contacts</p>
                <p className='text-lg font-semibold text-gray-900'>
                  {allContacts.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='w-full'>
          <div className='flex items-center justify-between mb-4'>
            <TabsList className='grid w-full max-w-md grid-cols-2'>
              <TabsTrigger
                value='clients'
                className='flex items-center gap-2'>
                <Building2 className='h-4 w-4' />
                Clients
                <Badge
                  variant='secondary'
                  className='ml-1'>
                  {clients.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value='contacts'
                className='flex items-center gap-2'>
                <Users className='h-4 w-4' />
                Contacts
                <Badge
                  variant='secondary'
                  className='ml-1'>
                  {allContacts.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Add Contact Button - Only show on Contacts tab */}
            {activeTab === "contacts" && (
              <CustomButton
                text='Add Contact'
                Icon={UserPlus}
                onClick={() => setIsAddContactDialog(true)}
                variant='primary'
              />
            )}
          </div>

          {/* Clients Tab */}
          <TabsContent
            value='clients'
            className='mt-4 space-y-4'>
            {hasClients ? (
              <>
                {/* Search Bar */}
                <div className='relative bg-white'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Search clients by name, email, GST number, or city...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10'
                  />
                </div>

                {/* Clients Table */}
                {hasFilteredClients ? (
                  <div className='bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'>
                    <Table>
                      <TableHeader>
                        <TableRow className='bg-gray-50 hover:bg-gray-50'>
                          <TableHead className='font-semibold text-gray-900'>
                            Client Name
                          </TableHead>
                          <TableHead className='font-semibold text-gray-900'>
                            Contact Info
                          </TableHead>
                          <TableHead className='font-semibold text-gray-900'>
                            Address
                          </TableHead>
                          <TableHead className='font-semibold text-gray-900'>
                            GST Number
                          </TableHead>
                          <TableHead className='font-semibold text-gray-900'>
                            Status
                          </TableHead>
                          <TableHead className='font-semibold text-gray-900'>
                            Contacts
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClients.map((client: Client) => {
                          const clientContacts = allContacts.filter(
                            (contact: any) => contact.client_id === client.id
                          );
                          return (
                            <ClientRow
                              key={client.id}
                              client={client}
                              contacts={clientContacts}
                              onEdit={handleEditClient}
                            />
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className='text-center py-12 bg-white rounded-lg border border-gray-200'>
                    <Search className='h-12 w-12 mx-auto text-gray-400 mb-3' />
                    <p className='text-gray-600 font-medium'>
                      No clients found
                    </p>
                    <p className='text-sm text-gray-500 mt-1'>
                      Try adjusting your search query
                    </p>
                  </div>
                )}
              </>
            ) : (
              <NoFetchData
                Icon={Building2}
                title='No clients found'
                description='Start by adding your first client to the system.'
              />
            )}
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent
            value='contacts'
            className='mt-4'>
            <ClientContactsTable
              contacts={allContacts}
              clients={clients}
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
