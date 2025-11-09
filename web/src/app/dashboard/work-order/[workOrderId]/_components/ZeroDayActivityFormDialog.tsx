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

const ZeroDayActivityFormDialog: React.FC<Props> = ({
  open,
  setOpen,
  workOrderSiteId,
  onSuccess,
}) => {
  const form = useForm({
    defaultValues: {
      activity_description: "",
      start_date: "",
      end_date: "",
      length_metric: "",
      width_metric: "",
      depth_metric: "",
      volume_informed: "",
      document_url: "",
    },
  });

  const createMutation =
    trpc.siteActivityMutation.createZeroDayActivity.useMutation();

  const onSubmit = async (values: any) => {
    try {
      await createMutation.mutateAsync({
        work_order_site_id: workOrderSiteId,
        activity_description: values.activity_description || undefined,
        start_date: values.start_date,
        end_date: values.end_date,
        length_metric: values.length_metric
          ? Number(values.length_metric)
          : undefined,
        width_metric: values.width_metric
          ? Number(values.width_metric)
          : undefined,
        depth_metric: values.depth_metric
          ? Number(values.depth_metric)
          : undefined,
        volume_informed: values.volume_informed
          ? Number(values.volume_informed)
          : undefined,
        document_url: values.document_url || undefined,
      });
      form.reset();
      setOpen(false);
      onSuccess();
    } catch (err) {
      console.error("Failed to create zero day activity", err);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogContent className='max-w-2xl max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle>Add Zero Day Activity</DialogTitle>
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
                  name='start_date'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start date</FormLabel>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End date</FormLabel>
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
                  name='length_metric'
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
                  name='width_metric'
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
                  name='depth_metric'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depth (m)</FormLabel>
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
                      <FormLabel>Volume informed</FormLabel>
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

              <FormField
                control={form.control}
                name='document_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document URL</FormLabel>
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

export default ZeroDayActivityFormDialog;
