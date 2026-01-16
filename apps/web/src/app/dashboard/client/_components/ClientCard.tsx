import React from "react";
import {
  MapPin,
  Calendar,
  ArrowRight,
  PhoneIcon,
  MailIcon,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { capitalFirstLetter } from "@pkg/utils";
import { Badge } from "@/components/ui/badge";
import CustomButton from "@/components/CustomButton";

interface ClientContact {
  id: number | string;
  client_id: number;
  name: string;
  contact_number?: string;
  email?: string;
}

interface Client {
  id: number | string;
  name: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  gst_number?: string;
  contact_number?: string;
  email?: string;
  status?: string;
  created_at?: string | Date;
  // optional work-related fields
  work_order_number?: string | number;
  proposal_number?: string | number;
  sites_work_done?: number;
}

interface ClientCardProps {
  client: Client;
  contacts?: ClientContact[];
  //   onEdit?: (client: Client, contacts: ClientContact[]) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  contacts = [],
  //   onEdit,
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/dashboard/client/${client.id}`);
  };

  return (
    <div
      className='bg-white rounded-xl cursor-pointer border-2 border-gray-50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group'
      onClick={handleCardClick}>
      <div className='flex flex-col gap-4'>
        <div className='flex items-start justify-between px-4 pt-4'>
          <div>
            <h3 className='text font-semibold text-gray-700 group-hover:text-[#035864] transition-colors line-clamp-1'>
              {capitalFirstLetter(client.name)}
            </h3>
            <div className='flex items-center space-x-1 text-xs text-gray-400 mt-1'>
              <Calendar className='h-3 w-3' />
              <span>
                Created:{" "}
                {client.created_at
                  ? format(new Date(client.created_at), "MMM dd, yyyy")
                  : "-"}
              </span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {client.status && (
              <Badge
                variant={client.status === "active" ? "secondary" : "outline"}
                className='text-xs'>
                {capitalFirstLetter(client.status || "N/A")}
              </Badge>
            )}
            <CustomButton
              variant='arrow'
              arrowType='right'
              className='group-hover:bg-emerald-600 border-0'
            />
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 bg-gray-100/60 m-2.5 rounded-lg p-4'>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2 mb-3'>
              <div className='p-[5px] bg-[#00d57f]/10 rounded-md'>
                <MapPin className='size-3.5 text-[#035864]' />
              </div>
              <span className='text-xs font-semibold text-gray-700 uppercase tracking-wide'>
                Location
              </span>
            </div>

            <div className='ml-1 space-y-2'>
              <p className='text-xs text-gray-700 leading-relaxed'>
                {client.address || "-"}
              </p>
              <p className='text-xs text-gray-700'>
                {client.city}, {client.state} - {client.pincode}
              </p>
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center space-x-2 mb-3'>
              <div className='p-[5px] bg-[#00d57f]/10 rounded-md'>
                <PhoneIcon className='size-3.5 text-[#035864]' />
              </div>
              <span className='text-xs font-semibold text-gray-700 uppercase tracking-wide'>
                Contact
              </span>
            </div>

            <div className='ml-1 space-y-2'>
              <div>
                <a
                  href={`tel:${client.contact_number}`}
                  className='flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors'>
                  <PhoneIcon className='size-3.5' />{" "}
                  {client.contact_number || "-"}
                </a>
              </div>
              <div>
                <a
                  href={`mailto:${client.email}`}
                  className='flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-medium truncate'
                  title={client.email}>
                  <MailIcon className='size-3.5' /> {client.email || "-"}
                </a>
              </div>
              {/* <div className='flex items-center gap-2 text-xs text-gray-600'>
                <FileText className='h-3 w-3' />
                <span>GST: {client.gst_number || "-"}</span>
              </div> */}
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center space-x-2 mb-3'>
              <div className='p-[5px] bg-[#00d57f]/10 rounded-md'>
                <FileText className='size-3.5 text-[#035864]' />
              </div>
              <span className='text-xs font-semibold text-gray-700 uppercase tracking-wide'>
                Work Info
              </span>
            </div>

            <div className='ml-1'>
              <div className='flex gap-2 flex-wrap'>
                <div className='bg-white px-3 py-2 rounded-md shadow-sm text-xs text-gray-700 flex-1'>
                  <div className='text-[11px] text-gray-500'>Work Order</div>
                  <div className='font-medium text-sm text-gray-800 truncate'>
                    {client.work_order_number ?? "-"}
                  </div>
                </div>

                <div className='bg-white px-3 py-2 rounded-md shadow-sm text-xs text-gray-700 flex-1'>
                  <div className='text-[11px] text-gray-500'>Proposal</div>
                  <div className='font-medium text-sm text-gray-800 truncate'>
                    {client.proposal_number ?? "-"}
                  </div>
                </div>

                <div className='bg-white px-3 py-2 rounded-md shadow-sm text-xs text-gray-700 flex-1'>
                  <div className='text-[11px] text-gray-500'>Sites Done</div>
                  <div className='font-medium text-sm text-gray-800'>
                    {client.sites_work_done ?? 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='px-4 pb-4 flex items-center justify-between'>
          <div className='text-xs text-gray-500'>
            Contacts: {contacts.length}
          </div>
          {/* {onEdit && (
            <button
              type='button'
              className='text-xs bg-emerald-600 text-white px-3 py-1 rounded-md hover:opacity-90'
              onClick={(e) => {
                e.stopPropagation();
                onEdit(client, contacts);
              }}>
              Edit
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
