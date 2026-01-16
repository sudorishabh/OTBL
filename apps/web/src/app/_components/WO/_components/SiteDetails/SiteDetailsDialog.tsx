"use client";
import React from "react";
import DialogWindow from "@/components/DialogWindow";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApiError } from "@/hooks/useApiError";
import { Plus, ClipboardList } from "lucide-react";
import CustomButton from "@/components/CustomButton";

// Import components from subfolders
import { LoadingState, EmptyActivitiesState } from "./states";
import SiteInfoCard from "./SiteInfoCard";
import { ActivityListItem, ActivityDetailsDialog } from "./ActivityDetails";
import SiteActivityFormDialog from "../SiteActivityFormDialog";

// Import types
import type { Site, SiteDetailsDialogProps } from "./types";

const SiteDetailsDialog: React.FC<SiteDetailsDialogProps> = ({
  site,
  open,
  setOpen,
}) => {
  if (!open) return null;
  return (
    <SiteDetailsDialogContent
      site={site}
      open={open}
      setOpen={setOpen}
    />
  );
};

const SiteDetailsDialogContent: React.FC<SiteDetailsDialogProps> = ({
  site,
  open,
  setOpen,
}) => {
  const workOrderSiteId = site?.wo_site_id ?? 0;
  const clientId = site?.client_id ?? 0;
  const workOrderId = site?.work_order_id ?? 0;
  const { handleError } = useApiError();

  // State
  const [activityFormOpen, setActivityFormOpen] = React.useState(false);
  const [activityDetailsOpen, setActivityDetailsOpen] = React.useState(false);
  const [selectedActivity, setSelectedActivity] = React.useState<any>(null);
  const [editingActivityId, setEditingActivityId] = React.useState<
    number | undefined
  >();
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Fetch activities
  const activitiesQuery = trpc.siteActivityQuery.getSiteActivities.useQuery(
    { work_order_site_id: workOrderSiteId },
    { enabled: open && !!workOrderSiteId }
  );

  // Delete mutation
  const deleteMutation =
    trpc.siteActivityMutation.deleteSiteActivity.useMutation();

  const refreshData = () => {
    activitiesQuery.refetch();
    setRefreshKey((p) => p + 1);
  };

  const handleCreateActivity = () => {
    setEditingActivityId(undefined);
    setActivityFormOpen(true);
  };

  const handleEditActivity = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingActivityId(id);
    setActivityFormOpen(true);
  };

  const handleDeleteActivity = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm("Delete this activity?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      if (selectedActivity?.id === id) {
        setSelectedActivity(null);
        setActivityDetailsOpen(false);
      }
      refreshData();
    } catch (err) {
      handleError(err, { showToast: true });
    }
  };

  const handleOpenActivity = (activity: any) => {
    setSelectedActivity(activity);
    setActivityDetailsOpen(true);
  };

  const activities = activitiesQuery.data || [];

  return (
    <DialogWindow
      open={open}
      setOpen={setOpen}
      size='xl'
      title={site?.name || "Site Details"}
      description={site ? `${site.city}, ${site.state}` : undefined}>
      {!site ? (
        <div className='p-4 text-muted-foreground'>No site selected.</div>
      ) : (
        <ScrollArea className='h-[calc(100vh-200px)] pr-4'>
          <div className='space-y-6'>
            {/* Site Details Section */}
            <SiteInfoCard site={site} />

            {/* Activities Section */}
            <div>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-base font-semibold flex items-center gap-2'>
                  <ClipboardList className='size-4' />
                  <p className=''>Site Activities</p>
                  {activities.length > 0 && (
                    <Badge
                      variant='secondary'
                      className='ml-1'>
                      {activities.length}
                    </Badge>
                  )}
                </h3>
                <CustomButton
                  variant='primary'
                  Icon={Plus}
                  onClick={handleCreateActivity}
                  text='New Activity'
                />
              </div>

              {activitiesQuery.isLoading ? (
                <LoadingState message='Loading activities...' />
              ) : activities.length === 0 ? (
                <EmptyActivitiesState onCreate={handleCreateActivity} />
              ) : (
                <div className='grid gap-3'>
                  {activities.map((activity: any) => (
                    <ActivityListItem
                      key={activity.id}
                      activity={activity}
                      onClick={() => handleOpenActivity(activity)}
                      onEdit={(e) => handleEditActivity(activity.id, e)}
                      onDelete={(e) => handleDeleteActivity(activity.id, e)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      )}

      {/* Activity Form Dialog */}
      {site && (
        <SiteActivityFormDialog
          open={activityFormOpen}
          setOpen={setActivityFormOpen}
          workOrderSiteId={workOrderSiteId}
          clientId={clientId}
          workOrderId={workOrderId}
          activityId={editingActivityId}
          onSuccess={refreshData}
        />
      )}

      {/* Activity Details Dialog */}
      {selectedActivity && (
        <ActivityDetailsDialog
          open={activityDetailsOpen}
          setOpen={setActivityDetailsOpen}
          activity={selectedActivity}
          workOrderSiteId={workOrderSiteId}
          refreshKey={refreshKey}
          onRefresh={refreshData}
        />
      )}
    </DialogWindow>
  );
};

export default SiteDetailsDialog;
