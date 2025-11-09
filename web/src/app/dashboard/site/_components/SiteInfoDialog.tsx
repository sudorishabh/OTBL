import DialogWindow from "@/components/DialogWindow";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, User, Building } from "lucide-react";
import React from "react";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  site?: any;
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <div className='flex items-start gap-3'>
    <Icon className='h-4 w-4 text-muted-foreground mt-0.5' />
    <div className='flex-1'>
      <p className='text-xs font-medium text-muted-foreground'>{label}</p>
      <p className='text-sm font-medium'>{value}</p>
    </div>
  </div>
);

const SiteInfoDialog = ({ open, setOpen, site }: Props) => {
  if (!site) return null;

  return (
    <DialogWindow
      title='Site Information'
      description='View detailed information about this site'
      open={open}
      setOpen={setOpen}
      size='md'>
      <div className='space-y-6'>
        {/* Basic Info */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>{site.name}</h3>
            <Badge
              variant={site.status === "active" ? "default" : "secondary"}
              className={`${
                site.status === "active"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-500"
              }`}>
              {site.status}
            </Badge>
          </div>

          <div className='grid grid-cols-1 gap-4'>
            <InfoRow
              icon={MapPin}
              label='Address'
              value={site.address}
            />

            <div className='grid grid-cols-2 gap-4'>
              <InfoRow
                icon={Building}
                label='City'
                value={site.city}
              />
              <InfoRow
                icon={Building}
                label='State'
                value={site.state}
              />
            </div>

            <InfoRow
              icon={MapPin}
              label='Pincode'
              value={site.pincode}
            />

            <InfoRow
              icon={User}
              label='Contact Person'
              value={site.contact_person}
            />

            <InfoRow
              icon={Phone}
              label='Contact Number'
              value={site.contact_number}
            />

            <InfoRow
              icon={Mail}
              label='Email'
              value={site.email}
            />
          </div>
        </div>
      </div>
    </DialogWindow>
  );
};

export default SiteInfoDialog;
