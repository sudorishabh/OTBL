"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  User,
  ClipboardList,
  AlertCircle,
  FileCheck,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { LoadingState } from "../states";
import ItemTypeCard from "./ItemTypeCard";
import AddActivityDialog from "../../AddActivityDialog";
import { PHASES } from "../types";

// Phase icon mapping
const PHASE_ICONS = {
  FileCheck,
  ShoppingCart,
  DollarSign,
};

export type ActivityDetailsDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activity: any;
  workOrderSiteId: number;
  refreshKey: number;
  onRefresh: () => void;
};

const ActivityDetailsDialog: React.FC<ActivityDetailsDialogProps> = ({
  open,
  setOpen,
  activity,
  workOrderSiteId,
  refreshKey,
  onRefresh,
}) => {
  const [addItemDialogOpen, setAddItemDialogOpen] = React.useState(false);
  const [addItemPhase, setAddItemPhase] = React.useState("work_estimate");
  const [addItemType, setAddItemType] = React.useState("");

  // Fetch selected item types
  const selectedTypesQuery =
    trpc.siteActivityQuery.getSelectedItemTypes.useQuery(
      { id: activity.id },
      { enabled: !!activity.id }
    );

  // Fetch items grouped by type and phase
  const itemsByTypeQuery =
    trpc.siteActivityQuery.getItemsByTypeAndPhase.useQuery(
      { id: activity.id },
      { enabled: !!activity.id }
    );

  React.useEffect(() => {
    if (refreshKey) {
      selectedTypesQuery.refetch();
      itemsByTypeQuery.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const selectedTypes = selectedTypesQuery.data || [];
  const itemsData = itemsByTypeQuery.data || {};

  const handleAddPhaseItem = (itemType: string, phase: string) => {
    setAddItemType(itemType);
    setAddItemPhase(phase);
    setAddItemDialogOpen(true);
  };

  // Map phase icons
  const phasesWithIcons = PHASES.map((phase) => ({
    ...phase,
    IconComponent: PHASE_ICONS[phase.icon as keyof typeof PHASE_ICONS],
  }));

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={setOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh] p-0 overflow-hidden'>
          {/* Header */}
          <ActivityDialogHeader activity={activity} />

          {/* Content */}
          <ScrollArea className='h-[calc(90vh-200px)]'>
            <div className='p-6'>
              {selectedTypesQuery.isLoading ? (
                <LoadingState message='Loading items...' />
              ) : selectedTypes.length === 0 ? (
                <NoItemTypesState />
              ) : (
                <Tabs
                  defaultValue='work_estimate'
                  className='w-full'>
                  {/* Phase Tabs */}
                  <TabsList className='w-full justify-start bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-6'>
                    {phasesWithIcons.map((phase) => {
                      const Icon = phase.IconComponent;
                      const totalItems = selectedTypes.reduce(
                        (sum: number, itemType: string) => {
                          const typeData =
                            itemsData[itemType as keyof typeof itemsData];
                          return (
                            sum +
                            (typeData?.[phase.key as keyof typeof typeData]
                              ?.length || 0)
                          );
                        },
                        0
                      );

                      return (
                        <TabsTrigger
                          key={phase.key}
                          value={phase.key}
                          className='flex-1 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md'>
                          <Icon className='w-4 h-4' />
                          <span>{phase.label}</span>
                          {totalItems > 0 && (
                            <Badge
                              variant='secondary'
                              className='ml-1 h-5 min-w-5 text-xs'>
                              {totalItems}
                            </Badge>
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {/* Tab Content */}
                  {phasesWithIcons.map((phase) => (
                    <TabsContent
                      key={phase.key}
                      value={phase.key}
                      className='mt-0'>
                      <div className='grid gap-4'>
                        {selectedTypes.map((itemType: string) => {
                          const items =
                            itemsData[itemType as keyof typeof itemsData]?.[
                              phase.key as keyof (typeof itemsData)[typeof itemType]
                            ] || [];
                          const hasEntry = items.length > 0;

                          return (
                            <ItemTypeCard
                              key={itemType}
                              itemType={itemType}
                              phase={phase}
                              items={items}
                              hasEntry={hasEntry}
                              onAddItem={() =>
                                handleAddPhaseItem(itemType, phase.key)
                              }
                              isLoading={itemsByTypeQuery.isLoading}
                            />
                          );
                        })}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <AddActivityDialog
        open={addItemDialogOpen}
        setOpen={setAddItemDialogOpen}
        siteActivityId={activity.id}
        workOrderSiteId={workOrderSiteId}
        initialPhase={addItemPhase}
        initialItemType={addItemType}
        onSuccess={onRefresh}
      />
    </>
  );
};

// Sub-component: Dialog Header
const ActivityDialogHeader: React.FC<{ activity: any }> = ({ activity }) => (
  <div className='bg-linear-to-r from-indigo-600 to-blue-600 p-6 text-white'>
    <DialogHeader>
      <div className='flex items-center gap-3'>
        <div className='w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center'>
          <ClipboardList className='w-6 h-6' />
        </div>
        <div>
          <DialogTitle className='text-xl font-bold text-white'>
            {activity.job_number}
          </DialogTitle>
          <DialogDescription className='text-white/80'>
            JE: {activity.joint_estimate_number} • {activity.area} •{" "}
            {activity.installation}
          </DialogDescription>
        </div>
      </div>
    </DialogHeader>

    {/* Activity Meta */}
    <div className='flex flex-wrap gap-4 mt-4 text-sm'>
      <div className='flex items-center gap-1.5'>
        <User className='w-4 h-4 opacity-70' />
        <span>{activity.land_owner_name}</span>
      </div>
      <div className='flex items-center gap-1.5'>
        <Calendar className='w-4 h-4 opacity-70' />
        <span>
          {format(new Date(activity.start_date), "PP")} -{" "}
          {format(new Date(activity.end_date), "PP")}
        </span>
      </div>
    </div>
  </div>
);

// Sub-component: No Item Types State
const NoItemTypesState: React.FC = () => (
  <div className='text-center py-12'>
    <AlertCircle className='w-12 h-12 mx-auto mb-4 text-amber-500' />
    <h4 className='font-semibold text-lg mb-2'>No Item Types Selected</h4>
    <p className='text-muted-foreground'>
      Edit this activity to select which items to track.
    </p>
  </div>
);

export default ActivityDetailsDialog;
