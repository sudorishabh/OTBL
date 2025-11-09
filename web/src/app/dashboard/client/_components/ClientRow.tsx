import React, { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  ChevronDown,
  ChevronUp,
  User,
  Briefcase,
  Users,
  Edit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface ClientRowProps {
  client: Client;
  contacts?: ClientContact[];
  onEdit?: (client: Client, contacts: ClientContact[]) => void;
}

const ClientRow: React.FC<ClientRowProps> = ({
  client,
  contacts = [],
  onEdit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Main Client Row */}
      <TableRow className='hover:bg-[#035864]/5 transition-colors'>
        <TableCell className='font-medium text-xs'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-[#00d57f]/10 rounded-lg'>
              <Building2 className='h-4 w-4 text-[#035864]' />
            </div>
            <div>
              <p className='font-semibold text-gray-900'>{client.name}</p>
              <p className='text-xs text-gray-500'>ID: {client.id}</p>
            </div>
          </div>
        </TableCell>
        <TableCell className='text-xs'>
          <div className='flex items-center gap-2'>
            <Mail className='h-3.5 w-3.5 text-gray-400' />
            <span className=' text-gray-700'>{client.email}</span>
          </div>
          <div className='flex items-center gap-2 mt-1'>
            <Phone className='h-3.5 w-3.5 text-gray-400' />
            <span className=' text-gray-700'>{client.contact_number}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className='flex items-start gap-2 text-xs'>
            <MapPin className='h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0' />
            <div className=' text-gray-700'>
              <p>{client.address}</p>
              <p className=' text-gray-500 mt-0.5'>
                {client.city}, {client.state} - {client.pincode}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className='flex items-center gap-2 text-xs'>
            <FileText className='h-3.5 w-3.5 text-gray-400' />
            <span className=' font-mono text-gray-700'>
              {client.gst_number}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <Badge
            variant={client.status === "active" ? "default" : "secondary"}
            className={
              client.status === "active"
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : "bg-gray-100 text-gray-700 hover:bg-gray-100"
            }>
            {client.status}
          </Badge>
        </TableCell>
        <TableCell>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsExpanded(!isExpanded)}
              className='flex items-center gap-2 hover:bg-[#035864]/10'>
              <Users className='h-4 w-4' />
              <span className='text-sm font-medium'>
                {contacts.length} Contact{contacts.length !== 1 ? "s" : ""}
              </span>
              {isExpanded ? (
                <ChevronUp className='h-4 w-4' />
              ) : (
                <ChevronDown className='h-4 w-4' />
              )}
            </Button>
            {onEdit && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => onEdit(client, contacts)}
                className='flex items-center gap-2 hover:bg-[#035864]/10'>
                <Edit className='h-4 w-4' />
                <span className='text-sm font-medium'>Edit</span>
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Expandable Contacts Section */}
      {isExpanded && (
        <TableRow className='bg-gray-50/50'>
          <TableCell
            colSpan={6}
            className='p-0'>
            <div className='px-6 py-4'>
              {contacts.length > 0 ? (
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Users className='h-4 w-4 text-[#035864]' />
                    <h4 className='font-semibold text-sm text-gray-900'>
                      Contact Persons
                    </h4>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                        <div className='flex items-start gap-3'>
                          <div className='p-2 bg-[#00d57f]/10 rounded-lg'>
                            <User className='h-4 w-4 text-[#035864]' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='font-semibold text-sm text-gray-900 truncate'>
                              {contact.name}
                            </p>
                            {contact.designation && (
                              <div className='flex items-center gap-1.5 mt-1'>
                                <Briefcase className='h-3 w-3 text-gray-400' />
                                <p className='text-xs text-gray-600 truncate'>
                                  {contact.designation}
                                </p>
                              </div>
                            )}
                            <div className='space-y-1 mt-2'>
                              <div className='flex items-center gap-1.5'>
                                <Mail className='h-3 w-3 text-gray-400 flex-shrink-0' />
                                <a
                                  href={`mailto:${contact.email}`}
                                  className='text-xs text-blue-600 hover:underline truncate'>
                                  {contact.email}
                                </a>
                              </div>
                              <div className='flex items-center gap-1.5'>
                                <Phone className='h-3 w-3 text-gray-400 flex-shrink-0' />
                                <a
                                  href={`tel:${contact.contact_number}`}
                                  className='text-xs text-gray-700 hover:text-blue-600 truncate'>
                                  {contact.contact_number}
                                </a>
                              </div>
                            </div>
                            {contact.contact_type && (
                              <Badge
                                variant='outline'
                                className='mt-2 text-xs'>
                                {contact.contact_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  <Users className='h-8 w-8 mx-auto mb-2 text-gray-400' />
                  <p className='text-sm'>
                    No contacts added for this client yet
                  </p>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default ClientRow;
