"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  workOrderSiteId: number;
  onSuccess: () => void;
};

const TphActivityFormDialog: React.FC<Props> = ({
  open,
  setOpen,
  workOrderSiteId,
  onSuccess,
}) => {
  const form = useForm({
    defaultValues: {
      activity_description: "",
      sample_collection_date: "",
      sample_send_date: "",
      sample_report_received: "no" as "yes" | "no",
      tph_value: "",
      report_document_url: "",
      lab_info: "",
    },
  });

  const createMutation =
    trpc.siteActivityMutation.createTphActivity.useMutation();

  const onSubmit = async (values: any) => {
    try {
      await createMutation.mutateAsync({
        work_order_site_id: workOrderSiteId,
        activity_description: values.activity_description || undefined,
        sample_collection_date: values.sample_collection_date,
        sample_send_date: values.sample_send_date,
        sample_report_received: values.sample_report_received ?? "no",
        report_document_url: values.report_document_url || undefined,
        tph_value: values.tph_value ? Number(values.tph_value) : undefined,
        lab_info: values.lab_info || undefined,
      });
      form.reset();
      setOpen(false);
      onSuccess();
    } catch (err) {
      console.error("Failed to create TPH activity", err);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogContent className='max-w-2xl max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle>Add TPH Activity</DialogTitle>
        </DialogHeader>
        <ScrollArea className='max-h-[calc(90vh-8rem)] pr-4'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'>
              <FormField
                control={form.control}
                name='activity_description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Optional description'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='sample_collection_date'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sample collection date</FormLabel>
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
                  name='sample_send_date'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sample send date</FormLabel>
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
                  name='sample_report_received'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report received</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder='Select' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='no'>No</SelectItem>
                            <SelectItem value='yes'>Yes</SelectItem>
                          </SelectContent>
                        </Select>
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
                  name='report_document_url'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://...'
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
                name='lab_info'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab info</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Optional lab information'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Save Activity"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TphActivityFormDialog;
