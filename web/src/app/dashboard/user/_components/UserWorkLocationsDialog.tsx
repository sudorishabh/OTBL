import DialogWindow from "@/components/DialogWindow";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Calendar, Briefcase } from "lucide-react";

interface WorkLocation {
  workOrderId: number;
  workOrderCode: string;
  workOrderTitle: string;
  siteName: string;
  siteCity: string;
  siteState: string;
  role: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  userName: string;
  workLocations: WorkLocation[];
}

const UserWorkLocationsDialog = ({
  open,
  setOpen,
  userName,
  workLocations,
}: Props) => {
  return (
    <DialogWindow
      title={`Work Locations - ${userName}`}
      description='View all current and past work assignments'
      open={open}
      setOpen={setOpen}
      size='lg'>
      <div className='space-y-4 px-3.5 py-4 max-h-[60vh] overflow-y-auto'>
        {workLocations.length === 0 ? (
          <div className='text-center py-8'>
            <MapPin className='h-12 w-12 mx-auto text-muted-foreground mb-3' />
            <p className='text-sm text-muted-foreground'>
              No work locations assigned yet
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {workLocations.map((location, index) => (
              <div
                key={index}
                className='border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors'>
                {/* Work Order Info */}
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <Briefcase className='h-4 w-4 text-muted-foreground' />
                      <span className='font-medium text-sm'>
                        {location.workOrderCode}
                      </span>
                    </div>
                    <p className='text-sm text-muted-foreground ml-6'>
                      {location.workOrderTitle}
                    </p>
                  </div>
                  <Badge
                    variant={
                      location.status === "pending"
                        ? "outline"
                        : location.status === "completed"
                        ? "default"
                        : "destructive"
                    }>
                    {location.status}
                  </Badge>
                </div>

                {/* Site Info */}
                <div className='flex items-start gap-2 bg-muted/50 p-3 rounded-md'>
                  <MapPin className='h-4 w-4 text-muted-foreground mt-0.5' />
                  <div className='flex-1'>
                    <p className='font-medium text-sm'>{location.siteName}</p>
                    <p className='text-sm text-muted-foreground'>
                      {location.siteCity}, {location.siteState}
                    </p>
                  </div>
                  <Badge variant='outline'>{location.role}</Badge>
                </div>

                {/* Timeline */}
                <div className='flex items-center gap-4 text-xs text-muted-foreground ml-6'>
                  <div className='flex items-center gap-1'>
                    <Calendar className='h-3 w-3' />
                    <span>Start: {location.startDate}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Calendar className='h-3 w-3' />
                    <span>End: {location.endDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DialogWindow>
  );
};

export default UserWorkLocationsDialog;
