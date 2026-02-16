import { Button } from "@/components/ui/button";
import DialogWindow from "@/components/DialogWindow";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { workOrderSchemas, siteSchemas } from "@pkg/schema";
import { constants } from "@pkg/utils";

const { WO_PROCESS, allActivityOptions } = constants;

const { addWorkOrderSiteSchema } = workOrderSchemas;
const { createSiteSchema } = siteSchemas;
import { Loader2, Plus, Building2 } from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import useHandleParams from "@/hooks/useHandleParams";

interface Props {
  workOrder: any;
  scheduleOfRates: any[];
  onSuccess: () => void;
}

const CreateWorkOrderSiteDialog = ({
  workOrder,
  scheduleOfRates,
  onSuccess,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");

  const { getParam, deleteParam } = useHandleParams();
  const isDialogOpen = getParam("dialog") === "create-wo-site";
  const utils = trpc.useUtils();

  const form = useForm<z.infer<typeof addWorkOrderSiteSchema>>({
    resolver: zodResolver(addWorkOrderSiteSchema) as any,
    defaultValues: {
      work_order_id: workOrder.id,
      client_id: workOrder.client_id,
      // If work order has bioremediation_restoration, let user select; otherwise use the work order's process type
      process_type:
        workOrder.process_type === WO_PROCESS.BIOREMEDIATION_RESTORATION
          ? ""
          : workOrder.process_type || "",
      selected_activities: [],
      job_number: "",
      area: "",
      installation_type: "",
      joint_estimate_number: "",
      land_owner_name: "",
      remarks: "",
      new_site: undefined,
    },
  });

  // Watch for tab changes to handle validation requirements if needed
  // Since we use the same schema with optional fields, zod handles it mostly.
  // We might need to manually clear errors or set values when switching.

  const { data: sitesData, isLoading: isLoadingSites } =
    trpc.siteQuery.getSitesByOfficeId.useQuery(
      { office_id: workOrder.office_id, page: 1, limit: 100 },
      { enabled: !!workOrder.office_id },
    );

  const handleDialogClose = () => {
    deleteParam("dialog");
  };

  const addSiteMutation = trpc.workOrderMutation.addWorkOrderSite.useMutation({
    onSuccess: () => {
      toast.success("Site added successfully");
      utils.workOrderQuery.getWorkOrderDetails.invalidate({
        id: workOrder.id,
      });
      if (activeTab === "new") {
        utils.siteQuery.getSitesByOfficeId.invalidate({
          office_id: workOrder.office_id,
        });
      }
      onSuccess();
      handleDialogClose();
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createSiteMutation = trpc.siteMutation.createSite.useMutation();

  const onSubmit = async (data: z.infer<typeof addWorkOrderSiteSchema>) => {
    try {
      if (activeTab === "new" && data.new_site) {
        const siteResult = await createSiteMutation.mutateAsync({
          ...data.new_site,
          office_id: workOrder.office_id,
        } as any);

        if ((siteResult as any).id) {
          data.site_id = (siteResult as any).id;
        } else {
          toast.error("Failed to create site");
          return;
        }
      }

      if (!data.site_id) {
        toast.error("Please select or create a site");
        return;
      }

      addSiteMutation.mutate(data);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  // Check if work order allows process type selection (only for bioremediation_restoration)
  const canSelectProcessType =
    workOrder.process_type === WO_PROCESS.BIOREMEDIATION_RESTORATION;

  // Watch the selected process type for filtering activities
  const selectedProcessType = form.watch("process_type");

  // Get available process type options for the site
  const siteProcessTypeOptions = useMemo(() => {
    if (workOrder.process_type === WO_PROCESS.BIOREMEDIATION_RESTORATION) {
      return [
        { value: WO_PROCESS.BIOREMEDIATION, label: "Bioremediation" },
        { value: WO_PROCESS.RESTORATION, label: "Restoration" },
      ];
    }
    return [];
  }, [workOrder.process_type]);

  // Filter activities based on schedule of rates AND selected process type
  const activityOptions = useMemo(() => {
    if (!scheduleOfRates) return [];

    // Get activities from schedule of rates
    const sorActivities = scheduleOfRates.map((sor) => sor.activity);

    // Filter allActivityOptions based on:
    // 1. Activity must be in schedule of rates
    // 2. If process type is bioremediation, show bioremediation activities
    // 3. If process type is restoration, show non-bioremediation activities
    return allActivityOptions
      .filter((activity) => {
        // Must be in schedule of rates
        if (!sorActivities.includes(activity.value)) return false;

        // If no process type selected yet (for bioremediation_restoration WOs), show all SOR activities
        if (!selectedProcessType) return true;

        // If process type is bioremediation, show bioremediation activities
        if (selectedProcessType === WO_PROCESS.BIOREMEDIATION) {
          return activity.isBioremediation === true;
        }

        // If process type is restoration, show non-bioremediation activities
        if (selectedProcessType === WO_PROCESS.RESTORATION) {
          return activity.isBioremediation === false;
        }

        return true;
      })
      .map((activity) => ({
        id: activity.value,
        label: activity.label,
      }));
  }, [scheduleOfRates, selectedProcessType]);

  return (
    <DialogWindow
      open={isDialogOpen}
      setOpen={(open) => {
        if (!open) handleDialogClose();
      }}
      title='Add Work Order Site'
      size='lg'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.error("Form validation errors:", errors);
            toast.error("Please fill in all required fields correctly");
          })}
          className='space-y-4'>
          <div className='space-y-4'>
            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                const newTab = v as "existing" | "new";
                setActiveTab(newTab);

                if (newTab === "new") {
                  // Initialize new_site when switching to new tab
                  form.setValue("new_site", {
                    office_id: workOrder.office_id,
                    name: "",
                    address: "",
                    city: "",
                    state: "",
                    pincode: "",
                  });
                  form.setValue("site_id", undefined);
                } else {
                  // Clear new_site when switching to existing tab
                  form.setValue("new_site", undefined);
                }
                // Clear any validation errors when switching tabs
                form.clearErrors();
              }}
              className='w-full'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='existing'>Existing Site</TabsTrigger>
                <TabsTrigger value='new'>New Site</TabsTrigger>
              </TabsList>

              <TabsContent
                value='existing'
                className='space-y-4 pt-4'>
                <FormField
                  control={form.control}
                  name='site_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Site</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a site' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sitesData?.sites?.map((site) => (
                            <SelectItem
                              key={site.id}
                              value={site.id.toString()}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent
                value='new'
                className='space-y-4 pt-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='new_site.name'
                    render={({ field }) => (
                      <FormItem className='col-span-2'>
                        <FormLabel>Site Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='Enter site name'
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='new_site.address'
                    render={({ field }) => (
                      <FormItem className='col-span-2'>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='Enter address'
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='new_site.city'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='City'
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='new_site.state'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='State'
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='new_site.pincode'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='Pincode'
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='process_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Site Process Type{canSelectProcessType && " *"}
                    </FormLabel>
                    {canSelectProcessType ? (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Clear selected activities when process type changes
                          form.setValue("selected_activities", []);
                        }}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select process type for this site' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {siteProcessTypeOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          value={
                            field.value
                              ?.split("_")
                              .map(
                                (word: string) =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
                              )
                              .join(" ") || ""
                          }
                          className='bg-gray-100'
                        />
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4 col-span-2'>
                <FormField
                  control={form.control}
                  name='date'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type='date'
                          value={
                            field.value
                              ? new Date(field.value)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
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
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type='date'
                          value={
                            field.value
                              ? new Date(field.value)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='job_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='joint_estimate_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joint Estimate Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='area'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='installation_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Installation Type</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='land_owner_name'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>Land Owner Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='remarks'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className='space-y-3 border rounded-md p-4'>
            <FormLabel>Site Activities</FormLabel>
            {canSelectProcessType && !selectedProcessType ? (
              <p className='text-sm text-muted-foreground italic'>
                Please select a Site Process Type above to view available
                activities.
              </p>
            ) : activityOptions.length === 0 ? (
              <p className='text-sm text-muted-foreground italic'>
                No activities available for the selected process type.
              </p>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                {activityOptions.map((activity) => (
                  <FormField
                    key={activity.id}
                    control={form.control}
                    name='selected_activities'
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={activity.id}
                          className='flex flex-row items-start space-x-3 space-y-0'>
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(activity.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      activity.id,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== activity.id,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className='font-normal'>
                            {activity.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className='flex justify-end pt-4'>
            <Button
              type='submit'
              disabled={addSiteMutation.isPending}>
              {addSiteMutation.isPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Add Site
            </Button>
          </div>
        </form>
      </Form>
    </DialogWindow>
  );
};

export default CreateWorkOrderSiteDialog;
