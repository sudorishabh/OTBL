import React from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  ArrowRight,
  PhoneIcon,
  MailIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Office } from "@/types/office.types";
import { useRouter } from "next/navigation";
import { capitalFirstLetter } from "@/utils/capitalFirstLetter";

interface OfficeCardProps {
  office: Office;
}

const OfficeCard: React.FC<OfficeCardProps> = ({ office }) => {
  const router = useRouter();

  return (
    <div
      className='bg-white rounded-xl cursor-pointer border border-gray-200/60 shadow-sm hover:shadow-lg hover:border-[#00d57f]/30 transition-all duration-300 overflow-hidden group'
      onClick={() => router.push(`/office/${office.id}`)}>
      {/* Main Content - Horizontal Layout */}

      <div className='flex flex-col gap-4'>
        {/* Header */}
        <div className='flex items-start justify-between px-6 pt-6'>
          <div>
            <h3 className='text-xl font-bold text-gray-700 group-hover:text-[#035864] transition-colors line-clamp-1'>
              {capitalFirstLetter(office.name)}
            </h3>
            <div className='flex items-center space-x-1 text-xs text-gray-400 mt-1'>
              <Calendar className='h-3 w-3' />
              <span>Created: {format(office.created_at, "MMM dd, yyyy")}</span>
            </div>
          </div>

          <div className=' transition-opacity duration-300'>
            <ArrowRight className='h-5 w-5 text-emerald-600' />
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 bg-gray-50 m-2.5 rounded-lg p-4'>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2 mb-3'>
              <div className='p-1.5 bg-[#00d57f]/10 rounded-md'>
                <MapPin className='h-4 w-4 text-[#035864]' />
              </div>
              <span className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
                Location
              </span>
            </div>
            <div className='space-y-1'>
              <p className='text-sm text-gray-700 leading-relaxed'>
                {office.address}
              </p>
              <p className='text-sm text-gray-700'>
                {office.city}, {office.state} - {office.pincode}
              </p>
            </div>
          </div>

          {/* Contact Person Section */}
          <div className='space-y-2'>
            <div className='flex items-center space-x-2 mb-3'>
              <div className='p-1.5 bg-[#00d57f]/10 rounded-md'>
                <User className='h-4 w-4 text-[#035864]' />
              </div>
              <span className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
                Contact
              </span>
            </div>
            <div className='space-y-1'>
              <p className='text-sm font-medium text-gray-700'>
                {office.contact_person}{" "}
                <span className='text-gray-500 text-xs'>(Primary Contact)</span>
              </p>
              <div>
                <a
                  href={`tel:${office.contact_number}`}
                  className='flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 transition-colors'>
                  <PhoneIcon className='size-3.5' /> {office.contact_number}
                </a>
              </div>
              <div>
                <a
                  href={`mailto:${office.email}`}
                  className='flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 transition-colors font-medium truncate'
                  title={office.email}>
                  <MailIcon className='size-3.5' /> {office.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeCard;
