"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import {
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Building,
  ChevronRight,
} from "lucide-react";
import { ITEM_TYPE_LABELS } from "../types";

export type ActivityListItemProps = {
  activity: any;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
};

const ActivityListItem: React.FC<ActivityListItemProps> = ({
  activity,
  onClick,
  onEdit,
  onDelete,
}) => {
  // Fetch selected item types count
  const selectedTypesQuery =
    trpc.siteActivityQuery.getSelectedItemTypes.useQuery(
      { id: activity.id },
      { enabled: !!activity.id }
    );

  const selectedTypes = selectedTypesQuery.data || [];

  return (
    <Card
      className='p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group'
      onClick={onClick}>
      <div className='flex items-center justify-between gap-4'>
        {/* Left: Activity Info */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-2'>
            <Badge
              variant='default'
              className='font-mono text-xs px-2 bg-[#00d57f]/15 text-[#035864]'>
              {activity.job_number}
            </Badge>
            <Badge
              variant='outline'
              className='text-xs bg-sky-800/15 text-sky-800'>
              JE: {activity.joint_estimate_number}
            </Badge>
          </div>

          <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground'>
            <span className='flex items-center gap-1'>
              <MapPin className='w-3.5 h-3.5' />
              {activity.area}
            </span>
            <span className='flex items-center gap-1'>
              <Building className='w-3.5 h-3.5' />
              {activity.installation}
            </span>
            <span className='flex items-center gap-1'>
              <Calendar className='w-3.5 h-3.5' />
              {format(new Date(activity.start_date), "MMM dd, yyyy")}
            </span>
          </div>

          {/* Item Types Preview */}
          {selectedTypes.length > 0 && (
            <div className='flex flex-wrap gap-1 mt-2'>
              {selectedTypes.slice(0, 3).map((type: string) => (
                <Badge
                  key={type}
                  variant='secondary'
                  className='text-[10px] bg-slate-100 dark:bg-slate-800'>
                  {ITEM_TYPE_LABELS[type] || type}
                </Badge>
              ))}
              {selectedTypes.length > 3 && (
                <Badge
                  variant='outline'
                  className='text-[10px]'>
                  +{selectedTypes.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className='flex items-center gap-1'>
          <Button
            size='sm'
            variant='ghost'
            className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
            onClick={onEdit}>
            <Edit className='w-4 h-4' />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity'
            onClick={onDelete}>
            <Trash2 className='w-4 h-4' />
          </Button>
          <ChevronRight className='w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors' />
        </div>
      </div>
    </Card>
  );
};

export default ActivityListItem;
