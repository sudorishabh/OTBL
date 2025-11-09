"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Edit, Trash2, FileText, Calendar, Info } from "lucide-react";

type ActivityData = any; // Will be typed based on the activity type

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activity: ActivityData | null;
  activityType:
    | "zero_day_activity"
    | "zero_day_sample"
    | "tph_activity"
    | "oil_zapper_activity"
    | null;
  onEdit: () => void;
  onDelete: () => void;
};

const ActivityInfoDialog: React.FC<Props> = ({
  open,
  setOpen,
  activity,
  activityType,
  onEdit,
  onDelete,
}) => {
  if (!activity || !activityType) return null;

  const renderZeroDayActivity = () => (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <Label className='text-muted-foreground'>Start Date</Label>
          <p className='text-sm font-medium'>
            {activity.start_date
              ? format(new Date(activity.start_date), "PPpp")
              : "N/A"}
          </p>
        </div>
        <div>
          <Label className='text-muted-foreground'>End Date</Label>
          <p className='text-sm font-medium'>
            {activity.end_date
              ? format(new Date(activity.end_date), "PPpp")
              : "N/A"}
          </p>
        </div>
        <div>
          <Label className='text-muted-foreground'>Length (m)</Label>
          <p className='text-sm font-medium'>
            {activity.length_metric || "N/A"}
          </p>
        </div>
        <div>
          <Label className='text-muted-foreground'>Width (m)</Label>
          <p className='text-sm font-medium'>
            {activity.width_metric || "N/A"}
          </p>
        </div>
        <div>
          <Label className='text-muted-foreground'>Depth (m)</Label>
          <p className='text-sm font-medium'>
            {activity.depth_metric || "N/A"}
          </p>
        </div>
        <div>
          <Label className='text-muted-foreground'>Volume Informed</Label>
          <p className='text-sm font-medium'>
            {activity.volume_informed || "N/A"}
          </p>
        </div>
      </div>
      {activity.activity_description && (
        <div>
          <Label className='text-muted-foreground'>Description</Label>
          <p className='text-sm mt-1'>{activity.activity_description}</p>
        </div>
      )}
      {activity.document_url && (
        <div>
          <Label className='text-muted-foreground'>Document</Label>
          <a
            href={activity.document_url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1'>
            <FileText className='w-4 h-4' />
            View Document
          </a>
        </div>
      )}
    </div>
  );

  const renderZeroDaySample = () => (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <Label className='text-muted-foreground'>Status</Label>
          <Badge
            className='mt-1 capitalize'
            variant={
              activity.status === "completed"
                ? "default"
                : activity.status === "cancelled"
                ? "destructive"
                : "secondary"
            }>
            {activity.status}
          </Badge>
        </div>
        <div>
          <Label className='text-muted-foreground'>Start Date</Label>
          <p className='text-sm font-medium'>
            {activity.start_date
              ? format(new Date(activity.start_date), "PPpp")
              : "N/A"}
          </p>
        </div>
        <div>
          <Label className='text-muted-foreground'>End Date</Label>
          <p className='text-sm font-medium'>
            {activity.end_date
              ? format(new Date(activity.end_date), "PPpp")
              : "N/A"}
          </p>
        </div>
        <div>
          <Label className='text-muted-foreground'>Length</Label>
          <p className='text-sm font-medium'>{activity.length || "N/A"}</p>
        </div>
        <div>
          <Label className='text-muted-foreground'>Width</Label>
          <p className='text-sm font-medium'>{activity.width || "N/A"}</p>
        </div>
        <div>
          <Label className='text-muted-foreground'>Height</Label>
          <p className='text-sm font-medium'>{activity.height || "N/A"}</p>
        </div>
        <div>
          <Label className='text-muted-foreground'>Volume A1 (L×W×H)</Label>
          <p className='text-sm font-medium'>{activity.volume_a1 || "N/A"}</p>
        </div>
        <div>
          <Label className='text-muted-foreground'>Density A2</Label>
          <p className='text-sm font-medium'>{activity.density_a2 || "N/A"}</p>
        </div>
        <div>
          <Label className='text-muted-foreground'>Result A</Label>
          <p className='text-sm font-medium'>{activity.result_a || "N/A"}</p>
        </div>
      </div>
      {activity.activity_description && (
        <div>
          <Label className='text-muted-foreground'>Description</Label>
          <p className='text-sm mt-1'>{activity.activity_description}</p>
        </div>
      )}
    </div>
  );

  const renderTphActivity = () => (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <Label className='text-muted-foreground'>
            Sample Collection Date
          </Label>
          <p className='text-sm font-medium'>
            {activity.sample_collection_date
              ? format(new Date(activity.sample_collection_date), "PPpp")
              : "N/A"}
          </p>
        </div>
        <div>
          <Label className='text-muted-foreground'>Sample Send Date</Label>
          <p className='text-sm font-medium'>
            {activity.sample_send_date
              ? format(new Date(activity.sample_send_date), "PPpp")
              : "N/A"}
          </p>
        </div>
        <div>
          <Label className='text-muted-foreground'>Report Received</Label>
          <Badge
            className='mt-1'
            variant={
              activity.sample_report_received === "yes"
                ? "default"
                : "secondary"
            }>
            {activity.sample_report_received === "yes" ? "Yes" : "No"}
          </Badge>
        </div>
        <div>
          <Label className='text-muted-foreground'>TPH Value</Label>
          <p className='text-sm font-medium'>{activity.tph_value || "N/A"}</p>
        </div>
      </div>
      {activity.lab_info && (
        <div>
          <Label className='text-muted-foreground'>Lab Info</Label>
          <p className='text-sm mt-1'>{activity.lab_info}</p>
        </div>
      )}
      {activity.activity_description && (
        <div>
          <Label className='text-muted-foreground'>Description</Label>
          <p className='text-sm mt-1'>{activity.activity_description}</p>
        </div>
      )}
      {activity.report_document_url && (
        <div>
          <Label className='text-muted-foreground'>Report Document</Label>
          <a
            href={activity.report_document_url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1'>
            <FileText className='w-4 h-4' />
            View Report
          </a>
        </div>
      )}
    </div>
  );

  const renderOilZapperActivity = () => (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <Label className='text-muted-foreground'>Sent (kg)</Label>
          <p className='text-sm font-medium'>{activity.sent_kg || "N/A"}</p>
        </div>
        <div>
          <Label className='text-muted-foreground'>Sent Date</Label>
          <p className='text-sm font-medium'>
            {activity.sent_date
              ? format(new Date(activity.sent_date), "PPpp")
              : "N/A"}
          </p>
        </div>
      </div>
      {activity.activity_description && (
        <div>
          <Label className='text-muted-foreground'>Description</Label>
          <p className='text-sm mt-1'>{activity.activity_description}</p>
        </div>
      )}
      {activity.bill_document_url && (
        <div>
          <Label className='text-muted-foreground'>Bill Document</Label>
          <a
            href={activity.bill_document_url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1'>
            <FileText className='w-4 h-4' />
            View Bill
          </a>
        </div>
      )}
    </div>
  );

  const getTitle = () => {
    switch (activityType) {
      case "zero_day_activity":
        return "Zero Day Activity Details";
      case "zero_day_sample":
        return "Zero Day Sample Details";
      case "tph_activity":
        return "TPH Activity Details";
      case "oil_zapper_activity":
        return "Oil Zapper Activity Details";
      default:
        return "Activity Details";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogContent className='max-w-3xl max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Info className='w-5 h-5' />
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className='max-h-[calc(90vh-10rem)] pr-4'>
          <Card className='p-4 bg-gradient-to-br from-gray-50 to-gray-100'>
            {activityType === "zero_day_activity" && renderZeroDayActivity()}
            {activityType === "zero_day_sample" && renderZeroDaySample()}
            {activityType === "tph_activity" && renderTphActivity()}
            {activityType === "oil_zapper_activity" &&
              renderOilZapperActivity()}
          </Card>

          <div className='flex items-center gap-2 mt-4 text-xs text-muted-foreground'>
            <Calendar className='w-3 h-3' />
            <span>
              Created:{" "}
              {activity.created_at
                ? format(new Date(activity.created_at), "PPpp")
                : "N/A"}
            </span>
            {activity.updated_at && (
              <>
                <span>•</span>
                <span>
                  Updated: {format(new Date(activity.updated_at), "PPpp")}
                </span>
              </>
            )}
          </div>
        </ScrollArea>

        <div className='flex justify-between items-center pt-4 border-t'>
          <Button
            variant='destructive'
            size='sm'
            onClick={onDelete}
            className='gap-2'>
            <Trash2 className='w-4 h-4' />
            Delete
          </Button>
          <div className='flex gap-2'>
            <Button
              variant='ghost'
              onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              onClick={onEdit}
              className='gap-2'>
              <Edit className='w-4 h-4' />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityInfoDialog;
