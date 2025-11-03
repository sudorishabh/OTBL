import DialogWindow from "@/components/DialogWindow";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomButton from "@/components/CustomButton";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

const assignSiteSchema = z.object({
  work_order_site_id: z.string().min(1, { message: "Site is required" }),
  role: z.enum(["manager", "operator"], {
    message: "Role is required for site assignment",
  }),
});

interface WorkOrderSite {
  id: number;
  workOrderCode: string;
  workOrderTitle: string;
  siteName: string;
  siteCity: string;
  siteState: string;
  status: string;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: number | null;
  userName: string;
}

const AssignSiteDialog = ({ open, setOpen, userId, userName }: Props) => {
  const form = useForm<z.infer<typeof assignSiteSchema>>({
    resolver: zodResolver(assignSiteSchema),
    defaultValues: {
      work_order_site_id: "",
      role: "operator",
    },
  });

  // Mock data - replace with actual tRPC query
  const mockAvailableSites: WorkOrderSite[] = [
    {
      id: 1,
      workOrderCode: "WO-2024-001",
      workOrderTitle: "Construction Project Alpha",
      siteName: "Site A",
      siteCity: "Delhi",
      siteState: "Delhi",
      status: "pending",
    },
    {
      id: 2,
      workOrderCode: "WO-2024-002",
      workOrderTitle: "Infrastructure Development",
      siteName: "Site B",
      siteCity: "Noida",
      siteState: "Uttar Pradesh",
      status: "pending",
    },
    {
      id: 3,
      workOrderCode: "WO-2024-003",
      workOrderTitle: "Road Maintenance Project",
      siteName: "Site C",
      siteCity: "Gurgaon",
      siteState: "Haryana",
      status: "pending",
    },
  ];

  // TODO: Replace with actual tRPC mutation
  // const assignUserToSite = trpc.userMutation.assignUserToSite.useMutation();

  async function onSubmit(values: z.infer<typeof assignSiteSchema>) {
    console.log("Assign user to site:", { userId, ...values });
    // await assignUserToSite.mutateAsync({
    //   user_id: userId!,
    //   work_order_site_id: parseInt(values.work_order_site_id),
    //   role: values.role,
    // });
    form.reset();
    setOpen(false);
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
    }
  };

  return (
    <DialogWindow
      title={`Assign Site to ${userName}`}
      description='Assign user to work on specific sites within work orders'
      open={open}
      setOpen={handleOpenChange}
      size='md'>
      <div className='space-y-4 px-3.5 py-4'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'>
            <FormField
              control={form.control}
              name='work_order_site_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Site</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
                      <option value=''>Choose a site...</option>
                      {mockAvailableSites.map((site) => (
                        <option
                          key={site.id}
                          value={site.id}>
                          {site.workOrderCode} - {site.siteName} (
                          {site.siteCity})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Show site details when selected */}
            {form.watch("work_order_site_id") && (
              <div className='bg-muted/50 p-3 rounded-md space-y-2'>
                {(() => {
                  const selectedSite = mockAvailableSites.find(
                    (s) => s.id.toString() === form.watch("work_order_site_id")
                  );
                  if (!selectedSite) return null;
                  return (
                    <>
                      <div className='flex items-start gap-2'>
                        <MapPin className='h-4 w-4 text-muted-foreground mt-0.5' />
                        <div className='flex-1'>
                          <p className='font-medium text-sm'>
                            {selectedSite.siteName}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {selectedSite.siteCity}, {selectedSite.siteState}
                          </p>
                        </div>
                        <Badge variant='outline'>{selectedSite.status}</Badge>
                      </div>
                      <div className='pl-6'>
                        <p className='text-xs text-muted-foreground'>
                          <span className='font-medium'>Work Order:</span>{" "}
                          {selectedSite.workOrderCode}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {selectedSite.workOrderTitle}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role at Site</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
                      <option value='operator'>Operator</option>
                      <option value='manager'>Manager</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                  <p className='text-xs text-muted-foreground mt-1'>
                    This defines the user's responsibilities at this specific
                    site
                  </p>
                </FormItem>
              )}
            />

            <div className='flex gap-2 justify-end pt-4'>
              <CustomButton
                text='Cancel'
                onClick={() => handleOpenChange(false)}
                variant='outline'
                type='button'
              />
              <CustomButton
                text='Assign to Site'
                variant='primary'
                type='submit'
              />
            </div>
          </form>
        </Form>
      </div>
    </DialogWindow>
  );
};

export default AssignSiteDialog;
