import React from "react";
import { Building2, MapPin, Phone, Mail, User, Calendar } from "lucide-react";
import { Office } from "@/types/office.types";
import { Button } from "@/components/ui/button";

interface OfficeCardProps {
  office: Office;
}

const OfficeCard: React.FC<OfficeCardProps> = ({ office }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className='bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group'>
      {/* Header Section */}
      <div className='bg-gradient-to-r from-green-50 to-teal-50 px-4 py-2 border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2 w-2/3'>
            <h3 className='text-lg font-semibold text-gray-900  line-clamp-1 group-hover:text-green-700 transition-colors'>
              {office.office_name}
            </h3>
          </div>
          <div className='text-xs text-gray-400 flex items-center space-x-1'>
            <Calendar className='h-3 w-3' />
            <span>{formatDate(office.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className='p-4 space-y-3'>
        {/* Address */}
        <div className='flex items-start space-x-2'>
          <MapPin className='h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0' />
          <div className='flex-1'>
            <p className='text-sm font-medium text-gray-700'>Address</p>
            <p className='text-sm text-gray-600 mt-0.5 leading-relaxed'>
              {office.office_address}
            </p>
            <p className='text-sm text-gray-500'>
              {office.office_city}, {office.office_state} -{" "}
              {office.office_pincode}
            </p>
          </div>
        </div>

        {/* Contact Person */}
        <div className='flex items-center space-x-2'>
          <User className='h-3.5 w-3.5 text-gray-400 flex-shrink-0' />
          <div className='flex-1'>
            <p className='text-sm font-medium text-gray-700'>Contact Person</p>
            <p className='text-sm text-gray-600 mt-0.5'>
              {office.office_contact_person}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div className='flex items-center space-x-2'>
            <Phone className='h-3.5 w-3.5 text-gray-400 flex-shrink-0' />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-700'>Phone</p>
              <a
                href={`tel:${office.office_contact_number}`}
                className='text-sm text-green-600 hover:text-green-700 transition-colors truncate block'>
                {office.office_contact_number}
              </a>
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <Mail className='h-3.5 w-3.5 text-gray-400 flex-shrink-0' />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-700'>Email</p>
              <a
                href={`mailto:${office.office_email}`}
                className='text-sm text-green-600 hover:text-green-700 transition-colors truncate block'
                title={office.office_email}>
                {office.office_email}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className='px-4 py-3 bg-gray-50 border-t border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='text-xs text-gray-500'>
            Updated: {formatDate(office.updated_at)}
          </div>
          {/* <div className='flex space-x-1.5'> */}
          <Button className='inline-flex items-center px-2.5 py-1 text-sm font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors'>
            View
          </Button>
          {/* <button className='inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors'>
              Edit
            </button> */}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};

export default OfficeCard;
