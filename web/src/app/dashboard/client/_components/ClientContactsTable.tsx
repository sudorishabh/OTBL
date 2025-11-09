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
import { Mail, Phone, User, Briefcase, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { trpc } from "@/lib/trpc";
import LoadMoreBtn from "@/components/LoadMoreBtn";

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
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  } | null;
  handleLoadMore: () => void;
  isLoadingData: boolean;
}

const ClientContactsTable: React.FC<ClientContactsTableProps> = ({
  contacts,
  clients,
  pagination,
  handleLoadMore,
  isLoadingData,
}) => {
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

  const getClientName = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  return (
    <div className='border rounded-lg bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='pl-8 text-xs'>Contact Person</TableHead>
            <TableHead className='text-xs'>Email</TableHead>
            <TableHead className='text-xs'>Phone</TableHead>
            <TableHead className='text-xs'>Designation</TableHead>
            <TableHead className='text-xs'>Client</TableHead>
            <TableHead className='text-xs'>Type</TableHead>
            <TableHead className='text-xs text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts?.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className='text-center py-8 text-muted-foreground'>
                No contacts found
              </TableCell>
            </TableRow>
          ) : (
            <>
              {contacts?.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className='text-xs font-medium'>
                    {contact.name}
                  </TableCell>
                  <TableCell className='text-xs'>{contact.email}</TableCell>
                  <TableCell className='text-xs'>
                    {contact.contact_number}
                  </TableCell>
                  <TableCell className='text-xs'>
                    {contact.designation || "N/A"}
                  </TableCell>
                  <TableCell className='text-xs'>
                    {getClientName(contact.client_id)}
                  </TableCell>
                  <TableCell className='text-xs'>
                    {contact.contact_type && (
                      <Badge
                        variant='outline'
                        className='text-xs'>
                        {contact.contact_type}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          className='h-8 w-8 p-0'>
                          <span className='sr-only'>Open menu</span>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          className='text-destructive'
                          onClick={() =>
                            handleDeleteContact(contact.id, contact.name)
                          }
                          disabled={deleteClientContact.isPending}>
                          <Trash2 className='mr-2 h-4 w-4' />
                          Delete Contact
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {pagination?.hasMore && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-center'>
                    <LoadMoreBtn
                      onClick={handleLoadMore}
                      loading={isLoadingData}
                    />
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientContactsTable;
