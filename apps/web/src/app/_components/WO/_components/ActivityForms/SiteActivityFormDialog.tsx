"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useApiError } from "@/hooks/useApiError";
import {
  Plus,
  FileText,
  DollarSign,
  Package,
  Calendar,
  MapPin,
  User,
  Building,
  Hash,
  Loader2,
  Trash2,
  Edit,
  Check,
} from "lucide-react";

// Activity item types available
const ACTIVITY_ITEM_TYPES = [
  { value: "zero_days", label: "Zero Day Activity" },
  { value: "zero_day_samples", label: "Zero Day Sample" },
  { value: "tph", label: "TPH Activity" },
  { value: "oil_zappers", label: "Oil Zapper" },
  { value: "clean_up_oil_spill", label: "Clean Up Oil Spill" },
  { value: "lifting_oil_slush", label: "Lifting Oil Slush" },
  { value: "excavation_cont_soil", label: "Excavation Contaminated Soil" },
  { value: "trnsprt_oil_slush", label: "Transport Oil Slush" },
] as const;

// Phase configuration
const PHASES = [
  {
    key: "work_estimate",
    label: "Work Estimate",
    icon: FileText,
    color: "blue",
  },
  { key: "order", label: "Order", icon: Package, color: "amber" },
  { key: "expense", label: "Expense", icon: DollarSign, color: "green" },
] as const;

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  workOrderSiteId: number;
  clientId: number;
  workOrderId: number;
  activityId?: number; // If editing existing activity
  onSuccess?: () => void;
};

const SiteActivityFormDialog: React.FC<Props> = ({
  open,
  setOpen,
  workOrderSiteId,
  clientId,
  workOrderId,
  activityId,
  onSuccess,
}) => {
  const { handleError } = useApiError();
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [activePhase, setActivePhase] = React.useState<string>("work_estimate");

  const isEditing = !!activityId;

  // Fetch existing activity data if editing
  const activityQuery = trpc.siteActivityQuery.getSiteActivityById.useQuery(
    { id: activityId! },
    { enabled: isEditing && open }
  );

  // Fetch selected item types if editing
  const selectedItemTypesQuery =
    trpc.siteActivityQuery.getSelectedItemTypes.useQuery(
      { id: activityId! },
      { enabled: isEditing && open }
    );

  // Fetch items by phase
  const itemsByPhaseQuery = trpc.siteActivityQuery.getItemsByPhase.useQuery(
    { id: activityId! },
    { enabled: isEditing && open }
  );

  const form = useForm({
    defaultValues: {
      job_number: "",
      area: "",
      installation: "",
      joint_estimate_number: "",
      land_owner_name: "",
      start_date: "",
      end_date: "",
      remark: "",
    },
  });

  // Reset form when activity data is loaded
  React.useEffect(() => {
    if (activityQuery.data && isEditing) {
      const data = activityQuery.data;
      form.reset({
        job_number: data.job_number || "",
        area: data.area || "",
        installation: data.installation || "",
        joint_estimate_number: data.joint_estimate_number || "",
        land_owner_name: data.land_owner_name || "",
        start_date: data.start_date
          ? new Date(data.start_date).toISOString().slice(0, 16)
          : "",
        end_date: data.end_date
          ? new Date(data.end_date).toISOString().slice(0, 16)
          : "",
        remark: data.remark || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityQuery.data, isEditing]);

  // Update selected items when item types are loaded
  React.useEffect(() => {
    if (selectedItemTypesQuery.data) {
      setSelectedItems(selectedItemTypesQuery.data as string[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItemTypesQuery.data?.length]);

  const createMutation =
    trpc.siteActivityMutation.createSiteActivity.useMutation();
  const updateMutation =
    trpc.siteActivityMutation.updateSiteActivity.useMutation();

  const onSubmit = async (values: any) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: activityId!,
          ...values,
          start_date: values.start_date,
          end_date: values.end_date,
        });
      } else {
        await createMutation.mutateAsync({
          client_id: clientId,
          work_order_id: workOrderId,
          work_order_site_id: workOrderSiteId,
          job_number: values.job_number,
          area: values.area,
          installation: values.installation,
          joint_estimate_number: values.joint_estimate_number,
          land_owner_name: values.land_owner_name,
          start_date: values.start_date,
          end_date: values.end_date,
          remark: values.remark || undefined,
          selected_items: selectedItems as (
            | "zero_days"
            | "zero_day_samples"
            | "tph"
            | "oil_zappers"
            | "clean_up_oil_spill"
            | "lifting_oil_slush"
            | "excavation_cont_soil"
            | "trnsprt_oil_slush"
          )[],
        });
      }
      form.reset();
      setSelectedItems([]);
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      handleError(err, { showToast: true });
    }
  };

  const handleItemToggle = (itemType: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemType)
        ? prev.filter((i) => i !== itemType)
        : [...prev, itemType]
    );
  };

  const getItemTypeLabel = (tableName: string) => {
    return (
      ACTIVITY_ITEM_TYPES.find((t) => t.value === tableName)?.label || tableName
    );
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    (isEditing && activityQuery.isLoading);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogContent className='max-w-4xl max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Building className='w-5 h-5 text-blue-500' />
            {isEditing ? "Edit Site Activity" : "Create New Site Activity"}
          </DialogTitle>
          <DialogDescription>
            Define activity details and select item types for tracking across
            phases.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[calc(90vh-10rem)] pr-4'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6'>
              {/* Activity Details Section */}
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold text-muted-foreground flex items-center gap-2'>
                  <FileText className='w-4 h-4' />
                  Activity Details
                </h3>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='job_number'
                    rules={{ required: "Job number is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-1'>
                          <Hash className='w-3 h-3' />
                          Job Number *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter job number'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='area'
                    rules={{ required: "Area is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-1'>
                          <MapPin className='w-3 h-3' />
                          Area *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter area'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='installation'
                    rules={{ required: "Installation is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-1'>
                          <Building className='w-3 h-3' />
                          Installation *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter installation'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='joint_estimate_number'
                    rules={{ required: "Joint estimate number is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-1'>
                          <Hash className='w-3 h-3' />
                          Joint Estimate Number *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter JE number'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='land_owner_name'
                    rules={{ required: "Land owner name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-1'>
                          <User className='w-3 h-3' />
                          Land Owner Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter land owner name'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='start_date'
                    rules={{ required: "Start date is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-1'>
                          <Calendar className='w-3 h-3' />
                          Start Date *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='datetime-local'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='end_date'
                    rules={{ required: "End date is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-1'>
                          <Calendar className='w-3 h-3' />
                          End Date *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='datetime-local'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='remark'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remark</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Optional remarks or notes...'
                          className='min-h-20'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Item Types Selection */}
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold text-muted-foreground flex items-center gap-2'>
                  <Package className='w-4 h-4' />
                  Select Activity Items
                </h3>
                <p className='text-xs text-muted-foreground'>
                  Choose which item types will be tracked for this activity.
                  Each item can have different data for each phase (Work
                  Estimate, Order, Expense).
                </p>

                <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                  {ACTIVITY_ITEM_TYPES.map((item) => {
                    const isSelected = selectedItems.includes(item.value);
                    return (
                      <Card
                        key={item.value}
                        className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "hover:border-gray-400"
                        }`}
                        onClick={() => handleItemToggle(item.value)}>
                        <div className='flex items-start gap-2'>
                          <div
                            className={`mt-0.5 h-4 w-4 shrink-0 rounded-sm border ${
                              isSelected
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            } flex items-center justify-center`}>
                            {isSelected && (
                              <Check className='h-3 w-3 text-white' />
                            )}
                          </div>
                          <span className='text-sm font-medium leading-tight'>
                            {item.label}
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {selectedItems.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    <span className='text-xs text-muted-foreground'>
                      Selected:
                    </span>
                    {selectedItems.map((item) => (
                      <Badge
                        key={item}
                        variant='secondary'
                        className='text-xs'>
                        {getItemTypeLabel(item)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Phase Preview (only shown when editing) */}
              {isEditing && itemsByPhaseQuery.data && (
                <>
                  <Separator />

                  <div className='space-y-4'>
                    <h3 className='text-sm font-semibold text-muted-foreground flex items-center gap-2'>
                      <DollarSign className='w-4 h-4' />
                      Items by Phase
                    </h3>

                    <Tabs
                      value={activePhase}
                      onValueChange={setActivePhase}>
                      <TabsList className='grid w-full grid-cols-3'>
                        {PHASES.map((phase) => {
                          const Icon = phase.icon;
                          const count =
                            itemsByPhaseQuery.data[
                              phase.key as keyof typeof itemsByPhaseQuery.data
                            ]?.length || 0;
                          return (
                            <TabsTrigger
                              key={phase.key}
                              value={phase.key}
                              className='flex items-center gap-2'>
                              <Icon className='w-4 h-4' />
                              {phase.label}
                              <Badge
                                variant='outline'
                                className='ml-1 text-xs'>
                                {count}
                              </Badge>
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>

                      {PHASES.map((phase) => (
                        <TabsContent
                          key={phase.key}
                          value={phase.key}>
                          <div className='grid gap-2 mt-3'>
                            {(
                              itemsByPhaseQuery.data[
                                phase.key as keyof typeof itemsByPhaseQuery.data
                              ] || []
                            ).map((item: any, idx: number) => (
                              <Card
                                key={`${item.table_name}-${item.item_id}-${idx}`}
                                className='p-3 bg-gray-50 dark:bg-gray-900'>
                                <div className='flex items-center justify-between'>
                                  <div>
                                    <Badge
                                      variant='outline'
                                      className='mb-1'>
                                      {getItemTypeLabel(item.table_name)}
                                    </Badge>
                                    <p className='text-sm'>
                                      {item.activity_description ||
                                        `Item #${item.item_id}`}
                                    </p>
                                    {item.amount && (
                                      <p className='text-xs text-muted-foreground'>
                                        Amount: ₹{item.amount}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            ))}
                            {(
                              itemsByPhaseQuery.data[
                                phase.key as keyof typeof itemsByPhaseQuery.data
                              ] || []
                            ).length === 0 && (
                              <p className='text-sm text-muted-foreground text-center py-4'>
                                No items in this phase yet.
                              </p>
                            )}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                </>
              )}

              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => setOpen(false)}
                  disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  )}
                  {isEditing ? "Update Activity" : "Create Activity"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SiteActivityFormDialog;
