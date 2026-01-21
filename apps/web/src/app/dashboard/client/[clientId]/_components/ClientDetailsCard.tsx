import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import { Edit, MapPin, Phone, Users, Eye, EyeOff } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import ContactDialog from "./ContactDialog";
import { capitalFirstLetter } from "@pkg/utils";
import { type clientTypes } from "@pkg/schema";

interface Props {
  client: clientTypes.clientType;
  clientUsers: clientTypes.clientUsersType[];
}

const ClientDetailsCard = ({ client, clientUsers }: Props) => {
  const formatDate = (d?: string) => {
    try {
      return d ? format(new Date(d), "dd MMM yyyy") : "-";
    } catch (e) {
      return d ?? "-";
    }
  };

  const statusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "active" || s === "enabled")
      return "bg-emerald-100 text-emerald-800";
    if (s === "inactive" || s === "disabled")
      return "bg-amber-100 text-amber-800";
    return "bg-slate-100 text-slate-800";
  };
  const maskGst = (gst?: string) => {
    if (!gst) return "-";
    if (gst.length <= 6) return gst;
    return `${gst.slice(0, 3)}...${gst.slice(-3)}`;
  };
  const [isContactsOpen, setContactsOpen] = useState(false);
  const [showFullGst, setShowFullGst] = useState(false);
  return (
    <Card className='relative shadow border bg-linear-to-br border-emerald-400 from-white to-gray-50 py-5'>
      <CardHeader className='pb-0'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <div className='flex items-center gap-3 mt-2 text-xs'>
              <Badge className={`${statusColor(client.status)} rounded-md`}>
                {capitalFirstLetter(client.status)}
              </Badge>
              {client.gst_number ? (
                <div className='text-slate-500'>
                  GST:
                  <button
                    type='button'
                    onClick={() => setShowFullGst((s) => !s)}
                    aria-expanded={showFullGst}
                    aria-label={
                      showFullGst ? "Hide GST number" : "Show GST number"
                    }
                    className='text-slate-700 font-medium ml-1 inline-flex items-center gap-2 hover:underline cursor-pointer'>
                    <span className='truncate'>
                      {showFullGst
                        ? client.gst_number
                        : maskGst(client.gst_number)}
                    </span>
                    {showFullGst ? (
                      <EyeOff className='size-3 text-gray-500' />
                    ) : (
                      <Eye className='size-3 text-gray-500' />
                    )}
                  </button>
                </div>
              ) : null}
              <div className='text-slate-400'>
                Created: {formatDate(client.created_at)}
              </div>
              <div className='text-slate-400'>
                Updated: {formatDate(client.updated_at)}
              </div>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <CustomButton
              text='Contacts'
              Icon={Users}
              variant='outline'
              onClick={() => setContactsOpen(true)}
            />

            <CustomButton
              Icon={Edit}
              text='Edit'
              variant='outline'
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className='gap-6 text-sm'>
          <div className='flex justify-between'>
            <div className='flex items-start gap-4 flex-1'>
              <div className='size-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center'>
                <MapPin className='size-3.5 text-cyan-800' />
              </div>
              <div className='min-w-0'>
                <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                  Address
                </div>
                <p className='text-gray-700 font-medium wrap-break-word text-xs'>
                  {client.address}
                </p>
                <p className='text-gray-500 text-xs'>
                  {client.city}, {client.state} - {client.pincode}
                </p>
              </div>
            </div>

            <div className='flex-1 gap-4'>
              <div className='flex items-start gap-3'>
                <div className='size-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center'>
                  <Phone className='size-3.5 text-cyan-800' />
                </div>
                <div>
                  <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                    Company Contacts
                  </div>
                  <div className='flex text-xs items-center gap-2'>
                    <a
                      href={`tel:${client.contact_number}`}
                      className='text-gray-700 font-medium hover:underline'>
                      {client.contact_number || "-"}
                    </a>
                    <span>|</span>
                    <a
                      href={`mailto:${client.email}`}
                      className='text-gray-700 font-medium hover:underline truncate block max-w-full'>
                      {client.email || "-"}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className='flex flex-1 gap-3'>
              <div className='size-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center'>
                <Mail className='size-3.5 text-cyan-800' />
              </div>
              <div className='min-w-0'>
                <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                  Email
                </div>
                <a
                  href={`mailto:${client.email}`}
                  className='text-gray-700 font-medium hover:underline truncate block max-w-full'>
                  {client.email || "-"}
                </a>
              </div>
            </div> */}
          </div>
        </div>
      </CardContent>
      <ContactDialog
        open={Boolean(isContactsOpen)}
        onClose={() => setContactsOpen(false)}
        users={clientUsers}
      />
    </Card>
  );
};

export default ClientDetailsCard;
