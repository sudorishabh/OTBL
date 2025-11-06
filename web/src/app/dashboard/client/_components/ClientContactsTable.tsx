import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Mail,
  Phone,
  User,
  Briefcase,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
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
  email: string;
  contact_number: string;
}

interface ClientContactsTableProps {
  contacts: ClientContact[];
  clients: Client[];
}

const ClientContactsTable: React.FC<ClientContactsTableProps> = ({
  contacts,
  clients,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const utils = trpc.useUtils();

  const deleteClientContact =
    trpc.clientMutation.deleteClientContact.useMutation({
      onSuccess: () => {
        utils.clientQuery.getAllClientContacts.invalidate();
        utils.clientQuery.getClients.invalidate();
      },
      onError: (error: unknown) => {
        console.error("Error deleting client contact:", error);
        alert("Failed to delete contact. Please try again.");
      },
    });

  const handleDeleteContact = async (
    contactId: number,
    contactName: string
  ) => {
    if (
      window.confirm(
        `Are you sure you want to delete contact "${contactName}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteClientContact.mutateAsync({ id: contactId });
      } catch (error) {
        console.error("Error deleting contact:", error);
      }
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.designation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getClientName = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  return (
    <div className='space-y-4'>
      {/* Search Bar */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
        <Input
          placeholder='Search contacts by name, email, or designation...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='pl-10'
        />
      </div>

      {/* Contacts Table */}
      {filteredContacts.length > 0 ? (
        <div className='bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50 hover:bg-gray-50'>
                <TableHead className='font-semibold text-gray-900'>
                  Contact Person
                </TableHead>
                <TableHead className='font-semibold text-gray-900'>
                  Designation
                </TableHead>
                <TableHead className='font-semibold text-gray-900'>
                  Contact Info
                </TableHead>
                <TableHead className='font-semibold text-gray-900'>
                  Client
                </TableHead>
                <TableHead className='font-semibold text-gray-900'>
                  Type
                </TableHead>
                <TableHead className='font-semibold text-gray-900'>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow
                  key={contact.id}
                  className='hover:bg-[#035864]/5 transition-colors'>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-[#00d57f]/10 rounded-lg'>
                        <User className='h-4 w-4 text-[#035864]' />
                      </div>
                      <div>
                        <p className='font-semibold text-gray-900'>
                          {contact.name}
                        </p>
                        <p className='text-xs text-gray-500'>
                          ID: {contact.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Briefcase className='h-3.5 w-3.5 text-gray-400' />
                      <span className='text-sm text-gray-700'>
                        {contact.designation || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <Mail className='h-3.5 w-3.5 text-gray-400' />
                        <a
                          href={`mailto:${contact.email}`}
                          className='text-sm text-blue-600 hover:underline'>
                          {contact.email}
                        </a>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Phone className='h-3.5 w-3.5 text-gray-400' />
                        <a
                          href={`tel:${contact.contact_number}`}
                          className='text-sm text-gray-700 hover:text-blue-600'>
                          {contact.contact_number}
                        </a>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className='text-sm text-gray-700'>
                      {getClientName(contact.client_id)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {contact.contact_type && (
                      <Badge
                        variant='outline'
                        className='text-xs'>
                        {contact.contact_type}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0 hover:bg-blue-50'
                        title='Edit contact'>
                        <Edit className='h-4 w-4 text-blue-600' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0 hover:bg-red-50'
                        onClick={() =>
                          handleDeleteContact(contact.id, contact.name)
                        }
                        disabled={deleteClientContact.isPending}
                        title='Delete contact'>
                        <Trash2 className='h-4 w-4 text-red-600' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className='text-center py-12 bg-white rounded-lg border border-gray-200'>
          <User className='h-12 w-12 mx-auto text-gray-400 mb-3' />
          <p className='text-gray-600 font-medium'>No contacts found</p>
          <p className='text-sm text-gray-500 mt-1'>
            {searchQuery
              ? "Try adjusting your search query"
              : "No contacts have been added yet"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientContactsTable;
