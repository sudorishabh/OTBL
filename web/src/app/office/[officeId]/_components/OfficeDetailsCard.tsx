import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Mail, MapPin, Phone, User } from "lucide-react";

interface Props {
  office: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    contact_person: string;
    id: number;
    name: string;
    contact_number: string;
    email: string;
    created_at: string;
    updated_at: string;
    status: "active" | "inactive" | null;
  };
}

const OfficeDetailsCard = ({ office }: Props) => {
  return (
    <Card className='relative shadow-sm border-emerald-500/60 bg-gradient-to-b from-white to-gray-50'>
      <CardContent>
        <div className=' flex flex-wrap items-center gap-x-8 gap-y-4 text-sm'>
          <div className='flex flex-1 items-center gap-3'>
            <div className='size-7 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center'>
              <MapPin className='size-3.5 text-sky-600' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                Address
              </div>
              <p className='text-gray-800 font-medium break-words line-clamp-3'>
                {office.address}
              </p>
              <p className='text-gray-500 break-words line-clamp-1'>
                {office.city}, {office.state} - {office.pincode}
              </p>
            </div>
          </div>

          <div className='hidden sm:block h-8 w-px bg-gray-200' />

          <div className='flex flex-1 items-center gap-3'>
            <div className='size-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center'>
              <User className='size-3.5 text-indigo-600' />
            </div>
            <div>
              <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                Contact Person
              </div>
              <div className='text-gray-800 font-medium'>
                {office.contact_person}
              </div>
            </div>
          </div>

          <div className='hidden sm:block h-8 w-px bg-gray-200' />

          <div className='flex flex-1 items-center gap-3'>
            <div className='size-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center'>
              <Phone className='size-3.5 text-emerald-600' />
            </div>
            <div>
              <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                Phone
              </div>
              <a
                href={`tel:${office.contact_number}`}
                className='text-green-700 font-medium hover:underline'>
                {office.contact_number}
              </a>
            </div>
          </div>

          <div className='hidden sm:block h-8 w-px bg-gray-200' />

          <div className='flex flex-1 items-center gap-3 min-w-0'>
            <div className='size-7 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center'>
              <Mail className='size-3.5 text-amber-600' />
            </div>
            <div className='min-w-0'>
              <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                Email
              </div>
              <a
                href={`mailto:${office.email}`}
                className='text-green-700 font-medium hover:underline truncate block max-w-[260px]'>
                {office.email}
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficeDetailsCard;
