import React from "react";
import {
  MapPin,
  User,
  Calendar,
  ArrowRight,
  PhoneIcon,
  MailIcon,
  FileText,
  UserCheck,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { Office } from "@/types/office.types";
import { useRouter } from "next/navigation";
import { capitalFirstLetter } from "@/utils/capitalFirstLetter";
import { Badge } from "@/components/ui/badge";

interface OfficeCardProps {
  office: Office;
}

const OfficeCard: React.FC<OfficeCardProps> = ({ office }) => {
  const router = useRouter();

  return (
    <div
      className='bg-white rounded-xl cursor-pointer border-2 border-gray-50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group'
      onClick={() => router.push(`/dashboard/office/${office.id}`)}>
      {/* Main Content - Horizontal Layout */}

      <div className='flex flex-col gap-4'>
        {/* Header */}
        <div className='flex items-start justify-between px-4 pt-4'>
          <div>
            <h3 className='text font-semibold text-gray-700 group-hover:text-[#035864] transition-colors line-clamp-1'>
              {capitalFirstLetter(office.name)}
            </h3>
            <div className='flex items-center space-x-1 text-xs text-gray-400 mt-1'>
              <Calendar className='h-3 w-3' />
              <span>Created: {format(office.created_at, "MMM dd, yyyy")}</span>
            </div>
          </div>

          <div className=' transition-opacity duration-300 group-hover:bg-emerald-600 p-2 rounded-full'>
            <ArrowRight className='h-5 w-5 text-emerald-600 group-hover:text-white' />
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 bg-gray-100/60 m-2.5 rounded-lg p-4'>
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
                {office.address}
              </p>
              <p className='text-xs text-gray-700'>
                {office.city}, {office.state} - {office.pincode}
              </p>

              <p className=' text-xs text-gray-600'>PIN - {office.pincode}</p>
            </div>
          </div>

          {/* Contact Person Section */}
          <div className='space-y-2'>
            <div className='flex items-center space-x-2 mb-3'>
              <div className='p-[5px] bg-[#00d57f]/10 rounded-md'>
                <User className='size-3.5 text-[#035864]' />
              </div>
              <span className='text-xs font-semibold text-gray-700 uppercase tracking-wide'>
                Contact
              </span>
            </div>
            <div className='ml-1 space-y-2'>
              <p className='text-xs font-medium text-gray-700'>
                {office.contact_person}
                <span className='text-gray-500 text-xs ml-1'>
                  (Primary Contact)
                </span>
              </p>
              <div>
                <a
                  href={`tel:${office.contact_number}`}
                  className='flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors'>
                  <PhoneIcon className='size-3.5' /> {office.contact_number}
                </a>
              </div>
              <div>
                <a
                  href={`mailto:${office.email}`}
                  className='flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-medium truncate'
                  title={office.email}>
                  <MailIcon className='size-3.5' /> {office.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Section */}
        {(office.manager ||
          (office.operators && office.operators.length > 0)) && (
          <div className='px-4 pb-4 space-y-3'>
            {office.manager && (
              <div className='flex items-center gap-2'>
                <UserCheck className='size-4 text-[#035864]' />
                <span className='text-xs font-semibold text-gray-600'>
                  Manager:
                </span>
                <Badge
                  variant='outline'
                  className='text-xs'>
                  {office.manager.name}
                </Badge>
              </div>
            )}

            {office.operators && office.operators.length > 0 && (
              <div className='flex items-start gap-2'>
                <Users className='size-4 text-[#035864] mt-0.5' />
                <div className='flex items-center flex-1 gap-2'>
                  <span className='text-xs font-semibold text-gray-600 text-nowrap'>
                    Operators ({office.operators.length}):
                  </span>
                  <div className='flex flex-wra gap-1 mt-1 line-clamp-1'>
                    {office.operators.map((operator) => (
                      <Badge
                        key={operator.id}
                        variant='secondary'
                        className='text-xs'>
                        {operator.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficeCard;
