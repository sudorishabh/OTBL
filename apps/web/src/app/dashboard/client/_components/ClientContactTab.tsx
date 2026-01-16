import React from "react";
import { trpc } from "@/lib/trpc";
import { useClientManagementContext } from "@/contexts/ClientManagementContext";
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
import { Loader, Trash2, Webhook } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import NoFetchData from "@/components/NoFetchData";
import { useApiError } from "@/hooks/useApiError";
import toast from "react-hot-toast";

interface Props {
  tab: string;
}

interface ClientContact {
  id: number;
  name: string;
  email: string;
  contact_number: string;
  designation?: string | null;
  contact_type?: string | null;
  client_id: number;
  client?: {
    id: number;
    name: string;
  };
}
const ClientContactTab = ({ tab }: Props) => {
  const isClientContactTab = tab === "contacts";
  const { contactSearchQuery, contactFilters } = useClientManagementContext();
  const utils = trpc.useUtils();
  const { handleError } = useApiError();

  const { data: contactsQueryData, isLoading: isAllContactQueryLoading } =
    trpc.clientQuery.getAllClientContacts.useQuery(
      {
        searchQuery: contactSearchQuery || undefined,
        clientId: contactFilters.clientId,
      },
      {
        enabled: isClientContactTab,
      }
    );

  const hasContacts = contactsQueryData?.length > 0;

  const deleteClientContact =
    trpc.clientMutation.deleteClientContact.useMutation({
      onSuccess: () => {
        toast.success("Contact deleted successfully");
        utils.clientQuery.getAllClientContacts.invalidate();
        utils.clientQuery.getClients.invalidate();
      },
      onError: (error) => {
        handleError(error, { showToast: true });
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

  const getClientName = (contact: ClientContact) => {
    return contact.client?.name || "Unknown Client";
  };

  if (isAllContactQueryLoading) {
    return <Loader />;
  }

  if (!hasContacts) {
    return (
      <NoFetchData
        Icon={Webhook}
        title='No Client Contacts Found'
        description='Add a contact to get started'
      />
    );
  }

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
          {contactsQueryData?.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className='text-center py-8 text-muted-foreground'>
                No contacts found
              </TableCell>
            </TableRow>
          ) : (
            <>
              {contactsQueryData?.map((contact: ClientContact) => (
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
                    {getClientName(contact)}
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
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientContactTab;
