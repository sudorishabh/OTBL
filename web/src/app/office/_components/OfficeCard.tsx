import React from "react";
import { Building2, MapPin, Phone, Mail, User, Calendar } from "lucide-react";
import { Office } from "@/types/office.types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface OfficeCardProps {
  office: Office;
}

const OfficeCard: React.FC<OfficeCardProps> = ({ office }) => {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className='bg-white rounded-lg cursor-pointer border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#00d57f]/20 transition-all duration-300 overflow-hidden group'
      onClick={() => router.push(`/offices/${office.id}`)}>
      {/* Header Section */}
      <div className='bg-gradient-to-r from-[#035864] to-[#035864]/90 px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2 w-2/3'>
            <Building2 className='h-4 w-4 text-white/80 flex-shrink-0' />
            <h3 className='text-lg font-semibold text-white line-clamp-1 group-hover:text-[#00d57f] transition-colors'>
              {office.name}
            </h3>
          </div>
          <div className='text-xs text-white/70 flex items-center space-x-1'>
            <Calendar className='h-3 w-3' />
            <span>{formatDate(office.created_at as typeof Date)}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className='p-4 space-y-4'>
        {/* Address */}
        <div className='flex items-start space-x-3'>
          <div className='p-1.5 bg-[#00d57f]/10 rounded-md'>
            <MapPin className='h-4 w-4 text-[#035864] flex-shrink-0' />
          </div>
          <div className='flex-1'>
            <p className='text-sm font-medium text-gray-800 mb-1'>Address</p>
            <p className='text-sm text-gray-600 leading-relaxed'>
              {office.address}
            </p>
            <p className='text-sm text-gray-500 mt-1'>
              {office.city}, {office.state} - {office.pincode}
            </p>
          </div>
        </div>

        {/* Contact Person */}
        <div className='flex items-center space-x-3'>
          <div className='p-1.5 bg-[#00d57f]/10 rounded-md'>
            <User className='h-4 w-4 text-[#035864] flex-shrink-0' />
          </div>
          <div className='flex-1'>
            <p className='text-sm font-medium text-gray-800 mb-1'>
              Contact Person
            </p>
            <p className='text-sm text-gray-600'>{office.contact_person}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='flex items-center space-x-3'>
            <div className='p-1.5 bg-[#00d57f]/10 rounded-md'>
              <Phone className='h-4 w-4 text-[#035864] flex-shrink-0' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-800 mb-1'>Phone</p>
              <a
                href={`tel:${office.contact_number}`}
                className='text-sm text-[#00d57f] hover:text-[#035864] transition-colors truncate block font-medium'>
                {office.contact_number}
              </a>
            </div>
          </div>

          <div className='flex items-center space-x-3'>
            <div className='p-1.5 bg-[#00d57f]/10 rounded-md'>
              <Mail className='h-4 w-4 text-[#035864] flex-shrink-0' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-800 mb-1'>Email</p>
              <a
                href={`mailto:${office.email}`}
                className='text-sm text-[#00d57f] hover:text-[#035864] transition-colors truncate block font-medium'
                title={office.email}>
                {office.email}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className='px-4 py-3 bg-gray-50/50 border-t border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='text-xs text-gray-500'>Click to view details</div>
          <div className='text-xs text-[#00d57f] font-medium group-hover:text-[#035864] transition-colors'>
            View Details →
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeCard;
