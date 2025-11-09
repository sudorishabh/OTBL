import React, { useState, useEffect } from "react";
import DialogWindow from "@/components/DialogWindow";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Layers,
  Calendar,
  FileText,
  CheckCircle2,
  Activity as ActivityIcon,
  Sparkles,
} from "lucide-react";

const addActivitySchema = z.object({
  activity_id: z.string().min(1, { message: "Please select an activity" }),
  status: z.enum(["pending", "completed", "cancelled"]),
  activity_description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  // 0 Day Activity fields
  length_metric: z.string().optional(),
  width_metric: z.string().optional(),
  depth_metric: z.string().optional(),
  volume_informed: z.string().optional(),
  // 0 Day Sample fields
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  density: z.string().optional(),
  // TPH Activity fields
  sample_collection_date: z.string().optional(),
  sample_send_date: z.string().optional(),
  sample_report_received_date: z.string().optional(),
  tph_value: z.string().optional(),
  lab_name: z.string().optional(),
  lab_contact: z.string().optional(),
  lab_address: z.string().optional(),
  // Oil Zapper fields
  first_intimation_date: z.string().optional(),
  first_intimation_raised: z.enum(["yes", "no"]).optional(),
  activity_completed_date: z.string().optional(),
  completion_notes: z.string().optional(),
});

type AddActivityFormValues = z.infer<typeof addActivitySchema>;

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  woSiteId: number;
  activityType: "insitu" | "exsitu" | null;
  siteName: string;
  onSuccess?: () => void;
}

const AddActivityDialog = ({
  open,
  setOpen,
  woSiteId,
  activityType,
  siteName,
  onSuccess,
}: Props) => {
  const [selectedActivityType, setSelectedActivityType] = useState<
    string | null
  >(null);

  const getActivities = trpc.activityQuery.getActivities.useQuery();
  const createSiteActivity =
    trpc.workOrderMutation.createSiteActivity.useMutation({
      onSuccess: () => {
        alert("Activity added successfully!");
        setOpen(false);
        form.reset();
        onSuccess?.();
      },
      onError: (error: any) => {
        alert(`Error adding activity: ${error.message}`);
      },
    });

  const form = useForm<AddActivityFormValues>({
    resolver: zodResolver(addActivitySchema) as any,
    defaultValues: {
      activity_id: "",
      status: "pending" as const,
      activity_description: "",
      start_date: "",
      end_date: "",
      // 0 Day Activity fields
      length_metric: "",
      width_metric: "",
      depth_metric: "",
      volume_informed: "",
      // 0 Day Sample fields
      length: "",
      width: "",
      height: "",
      density: "",
      // TPH Activity fields
      sample_collection_date: "",
      sample_send_date: "",
      sample_report_received_date: "",
      tph_value: "",
      lab_name: "",
      lab_contact: "",
      lab_address: "",
      // Oil Zapper fields
      first_intimation_date: "",
      first_intimation_raised: undefined,
      activity_completed_date: "",
      completion_notes: "",
    },
  });

  // Filter activities based on activity type
  const filteredActivities = React.useMemo(() => {
    if (!getActivities.data || !activityType) {
      console.log("AddActivityDialog - No data or activity type:", {
        hasData: !!getActivities.data,
        activityType,
        dataLength: getActivities.data?.length,
      });
      return [];
    }

    const filtered = getActivities.data.filter(
      (activity: any) => activity.activity_type === activityType
    );

    console.log("AddActivityDialog - Filtered activities:", {
      activityType,
      totalActivities: getActivities.data.length,
      filteredCount: filtered.length,
      allActivities: getActivities.data,
      filteredActivities: filtered,
    });

    return filtered;
  }, [getActivities.data, activityType]);

  // Get activity sub-type badges
  const getActivityTypeBadge = (
    subType: string | null,
    type: string | null
  ) => {
    if (type === "insitu") {
      switch (subType) {
        case "zero_day_activity":
          return (
            <Badge
              variant='outline'
              className='bg-blue-50 text-blue-700 border-blue-200'>
              Zero Day Activity
            </Badge>
          );
        case "zero_day_sample":
          return (
            <Badge
              variant='outline'
              className='bg-purple-50 text-purple-700 border-purple-200'>
              Zero Day Sample
            </Badge>
          );
        case "tph_activity":
          return (
            <Badge
              variant='outline'
              className='bg-green-50 text-green-700 border-green-200'>
              TPH Activity
            </Badge>
          );
        case "oil_zapper_activity":
          return (
            <Badge
              variant='outline'
              className='bg-orange-50 text-orange-700 border-orange-200'>
              Oil Zapper
            </Badge>
          );
        default:
          return (
            <Badge
              variant='outline'
              className='bg-gray-50 text-gray-700 border-gray-200'>
              Other
            </Badge>
          );
      }
    } else if (type === "exsitu") {
      return (
        <Badge
          variant='outline'
          className='bg-emerald-50 text-emerald-700 border-emerald-200'>
          Ex-Situ Activity
        </Badge>
      );
    }
    return (
      <Badge
        variant='outline'
        className='bg-gray-50 text-gray-700 border-gray-200'>
        General
      </Badge>
    );
  };

  const onSubmit = (values: AddActivityFormValues) => {
    createSiteActivity.mutate({
      wo_site_id: woSiteId,
      activity_id: Number(values.activity_id),
      status: values.status,
      activity_description: values.activity_description || undefined,
      start_date: values.start_date || undefined,
      end_date: values.end_date || undefined,
      // 0 Day Activity fields
      length_metric: values.length_metric || undefined,
      width_metric: values.width_metric || undefined,
      depth_metric: values.depth_metric || undefined,
      volume_informed: values.volume_informed || undefined,
      // 0 Day Sample fields
      length: values.length || undefined,
      width: values.width || undefined,
      height: values.height || undefined,
      density: values.density || undefined,
      // TPH Activity fields
      sample_collection_date: values.sample_collection_date || undefined,
      sample_send_date: values.sample_send_date || undefined,
      sample_report_received_date:
        values.sample_report_received_date || undefined,
      tph_value: values.tph_value || undefined,
      lab_name: values.lab_name || undefined,
      lab_contact: values.lab_contact || undefined,
      lab_address: values.lab_address || undefined,
      // Oil Zapper fields
      first_intimation_date: values.first_intimation_date || undefined,
      first_intimation_raised: values.first_intimation_raised || undefined,
      activity_completed_date: values.activity_completed_date || undefined,
      completion_notes: values.completion_notes || undefined,
    });
  };

  // Update selected activity type when activity is selected
  const handleActivityChange = (activityId: string) => {
    const activity = filteredActivities.find(
      (a: any) => a.id === Number(activityId)
    );
    setSelectedActivityType(activity?.activity_sub_type || null);
  };

  return (
    <DialogWindow
      open={open}
      setOpen={setOpen}
      title='Add Activity'
      description={`Add a new ${
        activityType === "insitu" ? "In-Situ" : "Ex-Situ"
      } activity to ${siteName}`}
      size='lg'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6'>
          {/* Activity Type Info */}
          <Card className='border-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-white shadow-sm'>
                  <Layers className='h-5 w-5 text-purple-600' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-700'>
                    Activity Type
                  </p>
                  <p className='text-lg font-semibold text-gray-900'>
                    {activityType === "insitu" ? "In-Situ" : "Ex-Situ"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Selection */}
          <FormField
            control={form.control}
            name='activity_id'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='flex items-center gap-2'>
                  <ActivityIcon className='h-4 w-4' />
                  Select Activity
                </FormLabel>
                <FormDescription>
                  {activityType === "insitu"
                    ? "Choose from In-Situ activities like Zero Day, TPH, or Oil Zapper"
                    : "Choose from Ex-Situ activities"}
                </FormDescription>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleActivityChange(value);
                  }}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select an activity' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getActivities.isLoading && (
                      <div className='p-4 text-center text-sm text-gray-500'>
                        Loading activities...
                      </div>
                    )}
                    {getActivities.isError && (
                      <div className='p-4 text-center text-sm text-red-500'>
                        Error loading activities. Please try again.
                      </div>
                    )}
                    {filteredActivities.length === 0 &&
                      !getActivities.isLoading &&
                      !getActivities.isError && (
                        <div className='p-4 text-center text-sm text-gray-500'>
                          <p className='font-medium mb-2'>
                            No activities available for {activityType}
                          </p>
                          <p className='text-xs'>
                            Total activities loaded:{" "}
                            {getActivities.data?.length || 0}
                          </p>
                        </div>
                      )}
                    {filteredActivities.map((activity: any) => (
                      <SelectItem
                        key={activity.id}
                        value={String(activity.id)}>
                        <div className='flex items-center gap-2'>
                          <Sparkles className='h-3 w-3 text-purple-500' />
                          <span className='font-medium'>{activity.name}</span>
                          <span className='text-xs text-gray-500'>
                            {getActivityTypeBadge(
                              activity.activity_sub_type,
                              activity.activity_type
                            )}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4' />
                  Status
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='pending'>
                      <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 rounded-full bg-yellow-500' />
                        <span>Pending</span>
                      </div>
                    </SelectItem>
                    <SelectItem value='completed'>
                      <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 rounded-full bg-green-500' />
                        <span>Completed</span>
                      </div>
                    </SelectItem>
                    <SelectItem value='cancelled'>
                      <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 rounded-full bg-red-500' />
                        <span>Cancelled</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Range */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='start_date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    Start Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='date'
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    End Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='date'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name='activity_description'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='flex items-center gap-2'>
                  <FileText className='h-4 w-4' />
                  Activity Description (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Enter any additional details about this activity...'
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Activity-Specific Fields */}
          {selectedActivityType === "zero_day_activity" && (
            <Card className='border-blue-200 bg-blue-50/50'>
              <CardHeader>
                <h4 className='text-sm font-semibold text-blue-900'>
                  0 Day Activity Details
                </h4>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='length_metric'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (meters)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.01'
                            placeholder='0.00'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='width_metric'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (meters)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.01'
                            placeholder='0.00'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='depth_metric'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Depth (meters)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.01'
                            placeholder='0.00'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='volume_informed'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volume Informed (m³)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.01'
                            placeholder='0.00'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {selectedActivityType === "zero_day_sample" && (
            <Card className='border-purple-200 bg-purple-50/50'>
              <CardHeader>
                <h4 className='text-sm font-semibold text-purple-900'>
                  0 Day Sample Details
                </h4>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='length'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (m)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.01'
                            placeholder='0.00'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='width'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (m)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.01'
                            placeholder='0.00'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='height'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (m)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.01'
                            placeholder='0.00'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='density'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Density (kg/m³)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.001'
                            placeholder='0.000'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <p className='text-xs text-gray-500'>
                  Volume (m³) = Length × Width × Height
                  <br />
                  Final Value = Volume × Density
                </p>
              </CardContent>
            </Card>
          )}

          {selectedActivityType === "tph_activity" && (
            <Card className='border-green-200 bg-green-50/50'>
              <CardHeader>
                <h4 className='text-sm font-semibold text-green-900'>
                  TPH Activity Details
                </h4>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='sample_collection_date'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sample Collection Date</FormLabel>
                        <FormControl>
                          <Input
                            type='date'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='sample_send_date'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sample Send Date</FormLabel>
                        <FormControl>
                          <Input
                            type='date'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='sample_report_received_date'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Received Date</FormLabel>
                        <FormControl>
                          <Input
                            type='date'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='tph_value'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TPH Value</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.001'
                            placeholder='0.000'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='lab_name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Laboratory Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Lab name'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='lab_contact'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Laboratory Contact</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Contact number'
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
                  name='lab_address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Laboratory Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Laboratory address'
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {selectedActivityType === "oil_zapper_activity" && (
            <Card className='border-orange-200 bg-orange-50/50'>
              <CardHeader>
                <h4 className='text-sm font-semibold text-orange-900'>
                  Oil Zapper Activity Details
                </h4>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='first_intimation_date'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Intimation Date</FormLabel>
                        <FormControl>
                          <Input
                            type='date'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='first_intimation_raised'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Intimation Raised</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select option' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='yes'>Yes</SelectItem>
                            <SelectItem value='no'>No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='activity_completed_date'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Completed Date</FormLabel>
                        <FormControl>
                          <Input
                            type='date'
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
                  name='completion_notes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Notes about activity completion...'
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className='flex items-center justify-end gap-3 pt-4 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={createSiteActivity.isPending}>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={createSiteActivity.isPending}
              className='bg-purple-600 hover:bg-purple-700'>
              {createSiteActivity.isPending ? "Adding..." : "Add Activity"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogWindow>
  );
};

export default AddActivityDialog;
