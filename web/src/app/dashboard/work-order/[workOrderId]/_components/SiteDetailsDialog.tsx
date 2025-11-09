"use client";
import React from "react";
import DialogWindow from "@/components/DialogWindow";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import ZeroDayActivityFormDialog from "./ZeroDayActivityFormDialog";
import ZeroDaySampleFormDialog from "./ZeroDaySampleFormDialog";
import TphActivityFormDialog from "./TphActivityFormDialog";
import OilZapperActivityFormDialog from "./OilZapperActivityFormDialog";
import ActivityInfoDialog from "./ActivityInfoDialog";
import { Edit, Trash2, Info, Calendar, FileText } from "lucide-react";

type Site = {
  id: number;
  wo_site_id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contact_person: string;
  contact_number: string;
  email: string;
  start_date: string; // ISO
  end_date: string; // ISO
  status: "pending" | "completed" | "cancelled";
};

type Props = {
  site: Site | null;
  open: boolean;
  setOpen: (open: boolean) => void;
};

type ActivityType =
  | "zero_day_activity"
  | "zero_day_sample"
  | "tph_activity"
  | "oil_zapper_activity";

const friendlyActivityName: Record<ActivityType, string> = {
  zero_day_activity: "Zero Day Activity",
  zero_day_sample: "Zero Day Sample",
  tph_activity: "TPH Activity",
  oil_zapper_activity: "Oil Zapper Activity",
};

const SiteDetailsDialog: React.FC<Props> = ({ site, open, setOpen }) => {
  const workOrderSiteId = site?.wo_site_id ?? 0;

  // Fetch activities for this work order site
  const zeroDayActivityQuery =
    trpc.siteActivityQuery.getZeroDayActivity.useQuery(
      { work_order_site_id: workOrderSiteId },
      { enabled: open && !!workOrderSiteId }
    );
  const zeroDaySampleQuery = trpc.siteActivityQuery.getZeroDaySample.useQuery(
    { work_order_site_id: workOrderSiteId },
    { enabled: open && !!workOrderSiteId }
  );
  const tphActivitiesQuery = trpc.siteActivityQuery.getTphActivities.useQuery(
    { work_order_site_id: workOrderSiteId },
    { enabled: open && !!workOrderSiteId }
  );
  const oilZapperActivitiesQuery =
    trpc.siteActivityQuery.getOilZapperActivities.useQuery(
      { work_order_site_id: workOrderSiteId },
      { enabled: open && !!workOrderSiteId }
    );

  // Form dialog states
  const [zeroDayActivityDialogOpen, setZeroDayActivityDialogOpen] =
    React.useState(false);
  const [zeroDaySampleDialogOpen, setZeroDaySampleDialogOpen] =
    React.useState(false);
  const [tphActivityDialogOpen, setTphActivityDialogOpen] =
    React.useState(false);
  const [oilZapperActivityDialogOpen, setOilZapperActivityDialogOpen] =
    React.useState(false);

  // Activity info dialog states
  const [activityInfoOpen, setActivityInfoOpen] = React.useState(false);
  const [selectedActivity, setSelectedActivity] = React.useState<any>(null);
  const [selectedActivityType, setSelectedActivityType] =
    React.useState<ActivityType | null>(null);
  const [editingActivity, setEditingActivity] = React.useState<any>(null);

  // Delete mutations
  const deleteZeroDayActivity =
    trpc.siteActivityMutation.deleteZeroDayActivity.useMutation();
  const deleteZeroDaySample =
    trpc.siteActivityMutation.deleteZeroDaySample.useMutation();
  const deleteTphActivity =
    trpc.siteActivityMutation.deleteTphActivity.useMutation();
  const deleteOilZapperActivity =
    trpc.siteActivityMutation.deleteOilZapperActivity.useMutation();

  // Basic combined loading state
  const isLoading =
    zeroDayActivityQuery.isLoading ||
    zeroDaySampleQuery.isLoading ||
    tphActivitiesQuery.isLoading ||
    oilZapperActivitiesQuery.isLoading;

  // Helpers
  const singles = {
    zero_day_activity_exists: !!zeroDayActivityQuery.data,
    zero_day_sample_exists: !!zeroDaySampleQuery.data,
  };

  const refreshQueries = () => {
    zeroDayActivityQuery.refetch();
    zeroDaySampleQuery.refetch();
    tphActivitiesQuery.refetch();
    oilZapperActivitiesQuery.refetch();
  };

  const handleActivityTypeSelect = (val: ActivityType) => {
    if (val === "zero_day_activity" && !singles.zero_day_activity_exists) {
      setZeroDayActivityDialogOpen(true);
    } else if (val === "zero_day_sample" && !singles.zero_day_sample_exists) {
      setZeroDaySampleDialogOpen(true);
    } else if (val === "tph_activity") {
      setTphActivityDialogOpen(true);
    } else if (val === "oil_zapper_activity") {
      setOilZapperActivityDialogOpen(true);
    }
  };

  const handleActivityClick = (activity: any, type: ActivityType) => {
    setSelectedActivity(activity);
    setSelectedActivityType(type);
    setActivityInfoOpen(true);
  };

  const handleActivityEdit = () => {
    setActivityInfoOpen(false);
    if (selectedActivityType === "zero_day_activity") {
      setEditingActivity(selectedActivity);
      setZeroDayActivityDialogOpen(true);
    } else if (selectedActivityType === "zero_day_sample") {
      setEditingActivity(selectedActivity);
      setZeroDaySampleDialogOpen(true);
    } else if (selectedActivityType === "tph_activity") {
      setEditingActivity(selectedActivity);
      setTphActivityDialogOpen(true);
    } else if (selectedActivityType === "oil_zapper_activity") {
      setEditingActivity(selectedActivity);
      setOilZapperActivityDialogOpen(true);
    }
  };

  const handleActivityDelete = async () => {
    if (!selectedActivity || !selectedActivityType) return;

    try {
      if (selectedActivityType === "zero_day_activity") {
        await deleteZeroDayActivity.mutateAsync({ id: selectedActivity.id });
      } else if (selectedActivityType === "zero_day_sample") {
        await deleteZeroDaySample.mutateAsync({ id: selectedActivity.id });
      } else if (selectedActivityType === "tph_activity") {
        await deleteTphActivity.mutateAsync({ id: selectedActivity.id });
      } else if (selectedActivityType === "oil_zapper_activity") {
        await deleteOilZapperActivity.mutateAsync({ id: selectedActivity.id });
      }

      setActivityInfoOpen(false);
      refreshQueries();
    } catch (err) {
      console.error("Failed to delete activity", err);
    }
  };

  const ActivityCards = () => {
    const items: Array<{
      key: string;
      type: ActivityType;
      title: string;
      details: string;
      data: any;
      when?: Date | null;
      extraInfo?: string;
    }> = [];

    if (zeroDayActivityQuery.data) {
      const a = zeroDayActivityQuery.data;
      items.push({
        key: `zda-${a.id}`,
        type: "zero_day_activity",
        title: friendlyActivityName["zero_day_activity"],
        details: a.activity_description || "No description",
        data: a,
        when: a.start_date ? new Date(a.start_date) : null,
        extraInfo: a.volume_informed
          ? `Volume: ${a.volume_informed}`
          : undefined,
      });
    }

    if (zeroDaySampleQuery.data) {
      const a = zeroDaySampleQuery.data;
      items.push({
        key: `zds-${a.id}`,
        type: "zero_day_sample",
        title: friendlyActivityName["zero_day_sample"],
        details: a.activity_description || "No description",
        data: a,
        when: a.start_date ? new Date(a.start_date) : null,
        extraInfo: a.result_a ? `Result A: ${a.result_a}` : undefined,
      });
    }

    (tphActivitiesQuery.data ?? []).forEach((a: any) =>
      items.push({
        key: `tph-${a.id}`,
        type: "tph_activity",
        title: friendlyActivityName["tph_activity"],
        details: a.activity_description || "No description",
        data: a,
        when: a.sample_collection_date
          ? new Date(a.sample_collection_date)
          : null,
        extraInfo: a.tph_value ? `TPH: ${a.tph_value}` : undefined,
      })
    );

    (oilZapperActivitiesQuery.data ?? []).forEach((a: any) =>
      items.push({
        key: `oza-${a.id}`,
        type: "oil_zapper_activity",
        title: friendlyActivityName["oil_zapper_activity"],
        details: a.activity_description || "No description",
        data: a,
        when: a.sent_date ? new Date(a.sent_date) : null,
        extraInfo: a.sent_kg ? `Sent: ${a.sent_kg} kg` : undefined,
      })
    );

    if (items.length === 0) {
      return (
        <p className='text-sm text-muted-foreground'>
          No activities yet. Add the first one.
        </p>
      );
    }

    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
        {items.map((it) => (
          <Card
            key={it.key}
            className='p-4 flex flex-col gap-2 hover:shadow-lg transition-all cursor-pointer hover:border-blue-400 relative group'
            onClick={() => handleActivityClick(it.data, it.type)}>
            <div className='flex items-start justify-between gap-2'>
              <div className='flex-1'>
                <span className='font-semibold text-sm block'>{it.title}</span>
                <Badge
                  variant='outline'
                  className='mt-1 text-xs'>
                  {friendlyActivityName[it.type]}
                </Badge>
              </div>
              <Button
                size='sm'
                variant='ghost'
                className='opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0'
                onClick={(e) => {
                  e.stopPropagation();
                  handleActivityClick(it.data, it.type);
                }}>
                <Info className='w-4 h-4' />
              </Button>
            </div>

            {it.when && (
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <Calendar className='w-3 h-3' />
                <span>{format(it.when, "PPp")}</span>
              </div>
            )}

            {it.extraInfo && (
              <div className='text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded'>
                {it.extraInfo}
              </div>
            )}

            {it.details && (
              <p className='text-xs text-foreground/70 line-clamp-2 mt-1'>
                {it.details}
              </p>
            )}

            <div className='flex items-center gap-2 mt-2 pt-2 border-t'>
              <Button
                size='sm'
                variant='ghost'
                className='h-7 text-xs gap-1 flex-1'
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedActivity(it.data);
                  setSelectedActivityType(it.type);
                  handleActivityEdit();
                }}>
                <Edit className='w-3 h-3' />
                Edit
              </Button>
              <span className='text-xs text-muted-foreground cursor-pointer hover:text-blue-600'>
                View Details →
              </span>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <DialogWindow
      open={open}
      setOpen={setOpen}
      size='lg'
      title={site ? site.name : "Site Details"}
      description={
        site
          ? `${site.address}, ${site.city}, ${site.state} - ${site.pincode}`
          : undefined
      }>
      {!site ? (
        <div className='p-2 text-sm text-muted-foreground'>
          No site selected.
        </div>
      ) : (
        <div className='space-y-4'>
          {/* Site info card */}
          <Card className='p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <div>
                <div className='text-base font-semibold'>{site.name}</div>
                <div className='text-sm text-muted-foreground'>
                  {site.address}, {site.city}, {site.state} - {site.pincode}
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Badge
                  className='capitalize'
                  variant={
                    site.status === "completed"
                      ? "default"
                      : site.status === "cancelled"
                      ? "destructive"
                      : "secondary"
                  }>
                  {site.status}
                </Badge>
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-sm'>
              <div>
                <Label>Contact person</Label>
                <div>{site.contact_person}</div>
              </div>
              <div>
                <Label>Contact number</Label>
                <div>{site.contact_number}</div>
              </div>
              <div>
                <Label>Start - End</Label>
                <div>
                  {format(new Date(site.start_date), "PPp")} -{" "}
                  {format(new Date(site.end_date), "PPp")}
                </div>
              </div>
            </div>
          </Card>

          <div className='flex flex-col gap-3'>
            <h3 className='font-semibold'>Activities</h3>
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                size='sm'
                variant='outline'
                disabled={singles.zero_day_activity_exists}
                onClick={() => handleActivityTypeSelect("zero_day_activity")}>
                {singles.zero_day_activity_exists ? "✓ " : "+ "}Zero Day
                Activity
              </Button>
              <Button
                size='sm'
                variant='outline'
                disabled={singles.zero_day_sample_exists}
                onClick={() => handleActivityTypeSelect("zero_day_sample")}>
                {singles.zero_day_sample_exists ? "✓ " : "+ "}Zero Day Sample
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleActivityTypeSelect("tph_activity")}>
                + TPH Activity
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleActivityTypeSelect("oil_zapper_activity")}>
                + Oil Zapper Activity
              </Button>
            </div>
          </div>

          <Separator />
          {isLoading ? (
            <div className='text-sm text-muted-foreground'>
              Loading activities...
            </div>
          ) : (
            <ActivityCards />
          )}
        </div>
      )}

      {/* Activity Form Dialogs */}
      {site && (
        <>
          <ZeroDayActivityFormDialog
            open={zeroDayActivityDialogOpen}
            setOpen={setZeroDayActivityDialogOpen}
            workOrderSiteId={site.wo_site_id}
            onSuccess={refreshQueries}
          />
          <ZeroDaySampleFormDialog
            open={zeroDaySampleDialogOpen}
            setOpen={setZeroDaySampleDialogOpen}
            workOrderSiteId={site.wo_site_id}
            onSuccess={refreshQueries}
          />
          <TphActivityFormDialog
            open={tphActivityDialogOpen}
            setOpen={setTphActivityDialogOpen}
            workOrderSiteId={site.wo_site_id}
            onSuccess={refreshQueries}
          />
          <OilZapperActivityFormDialog
            open={oilZapperActivityDialogOpen}
            setOpen={setOilZapperActivityDialogOpen}
            workOrderSiteId={site.wo_site_id}
            onSuccess={refreshQueries}
          />

          {/* Activity Info Dialog */}
          <ActivityInfoDialog
            open={activityInfoOpen}
            setOpen={setActivityInfoOpen}
            activity={selectedActivity}
            activityType={selectedActivityType}
            onEdit={handleActivityEdit}
            onDelete={handleActivityDelete}
          />
        </>
      )}
    </DialogWindow>
  );
};

export default SiteDetailsDialog;
