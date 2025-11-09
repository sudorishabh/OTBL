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
import { Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
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

interface Props {
  clients: Client[];
  contacts: ClientContact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  } | null;
  handleLoadMore: () => void;
  isLoadingData: boolean;
  onEdit: (client: Client, contacts: ClientContact[]) => void;
}

const ClientTable = ({
  clients,
  contacts,
  pagination,
  onEdit,
  handleLoadMore,
  isLoadingData,
}: Props) => {
  const getStatusBadgeVariant = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  const getClientContacts = (clientId: number) => {
    return contacts.filter((contact) => contact.client_id === clientId);
  };

  return (
    <div className='border rounded-lg bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='pl-8 text-xs'>Client Name</TableHead>
            <TableHead className='text-xs'>Email</TableHead>
            <TableHead className='text-xs'>Contact</TableHead>
            <TableHead className='text-xs'>GST Number</TableHead>
            <TableHead className='text-xs'>Location</TableHead>
            <TableHead className='text-xs'>Contacts</TableHead>
            <TableHead className='text-xs text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients?.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className='text-center py-8 text-muted-foreground'>
                No clients found
              </TableCell>
            </TableRow>
          ) : (
            <>
              {clients?.map((client) => {
                const clientContacts = getClientContacts(client.id);
                return (
                  <TableRow key={client.id}>
                    <TableCell className='text-xs font-medium flex items-center gap-2'>
                      {client.status === "active" ? (
                        <div className='text-green-500 h-3 w-3 rounded-full bg-green-500'></div>
                      ) : (
                        <div className='text-red-500 h-3 w-3 rounded-full bg-red-500'></div>
                      )}
                      {client.name}
                    </TableCell>
                    <TableCell className='text-xs'>{client.email}</TableCell>
                    <TableCell className='text-xs'>
                      {client.contact_number}
                    </TableCell>
                    <TableCell className='text-xs font-mono'>
                      {client.gst_number}
                    </TableCell>
                    <TableCell className='text-xs'>
                      <div className='flex flex-col'>
                        <span className='font-medium'>{client.city}</span>
                        <span className='text-muted-foreground text-xs'>
                          {client.state}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='text-xs'>
                      {clientContacts.length > 0 ? (
                        <div className='flex flex-col gap-1'>
                          {clientContacts.slice(0, 2).map((contact) => (
                            <Badge
                              key={contact.id}
                              variant='outline'
                              className='text-xs'>
                              {contact.name}
                            </Badge>
                          ))}
                          {clientContacts.length > 2 && (
                            <Badge
                              variant='secondary'
                              className='text-xs'>
                              +{clientContacts.length - 2} more
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className='text-sm text-muted-foreground'>
                          No contacts
                        </span>
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
                            onClick={() => onEdit(client, clientContacts)}>
                            <Edit className='mr-2 h-4 w-4' />
                            Edit Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}

              {pagination?.hasMore && (
                <TableRow>
                  <TableCell
                    colSpan={8}
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

export default ClientTable;
