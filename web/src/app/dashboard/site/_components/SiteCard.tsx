import React from "react";
import { MapPin, Phone, Mail, User, Calendar, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Site {
  id: number;
  name: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  contact_person: string;
  contact_number: string;
  email: string;
  created_at?: string | Date;
  updated_at?: string | Date;
}

interface SiteCardProps {
  site: Site;
  isSiteInfoDialog: boolean;
  setIsSiteInfoDialog: (isSiteInfoDialog: boolean) => void;
}

const SiteCard: React.FC<SiteCardProps> = ({
  site,
  isSiteInfoDialog,
  setIsSiteInfoDialog,
}) => {
  return (
    <div
      className='bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg hover:border-[#00d57f]/20 transition-all duration-300 overflow-hidden group cursor-pointer'
      onClick={() => setIsSiteInfoDialog(!isSiteInfoDialog)}>
      {/* Header Section */}
      <div className='bg-gradient-to-r from-[#035864] to-[#035864]/90 px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2 w-2/3'>
            <MapPin className='h-4 w-4 text-white/80 flex-shrink-0' />
            <h3 className='text-lg font-semibold text-white line-clamp-1 group-hover:text-[#00d57f] transition-colors'>
              {site.name}
            </h3>
          </div>
          <div className='flex items-center space-x-2'>
            {site.created_at && (
              <div className='text-xs text-white/70 flex items-center space-x-1'>
                <Calendar className='h-3 w-3' />
                <span>{format(site.created_at, "dd MMM, yyyy")}</span>
              </div>
            )}
            <Badge
              variant='secondary'
              className='text-xs bg-white/20 text-white border-white/30'>
              Site
            </Badge>
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
              {site.address}
            </p>
            <p className='text-sm text-gray-500 mt-1'>
              {site.city}, {site.state} - {site.pincode}
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
            <p className='text-sm text-gray-600'>{site.contact_person}</p>
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
                onClick={(e) => e.stopPropagation()}
                href={`tel:${site.contact_number}`}
                className='text-sm text-[#00d57f] hover:text-[#035864] transition-colors truncate block font-medium'>
                {site.contact_number}
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
                href={`mailto:${site.email}`}
                className='text-sm text-[#00d57f] hover:text-[#035864] transition-colors truncate block font-medium'
                title={site.email}>
                {site.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteCard;
