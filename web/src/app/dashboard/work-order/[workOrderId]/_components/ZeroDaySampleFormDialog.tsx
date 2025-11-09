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

const ZeroDaySampleFormDialog: React.FC<Props> = ({
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
      status: "pending" as "pending" | "completed" | "cancelled",
      length: "",
      width: "",
      height: "",
      volume_a1: "",
      density_a2: "",
      result_a: "",
    },
  });

  const createMutation =
    trpc.siteActivityMutation.createZeroDaySample.useMutation();

  const onSubmit = async (values: any) => {
    try {
      await createMutation.mutateAsync({
        work_order_site_id: workOrderSiteId,
        activity_description: values.activity_description || undefined,
        start_date: values.start_date,
        end_date: values.end_date,
        status: values.status ?? "pending",
        length: values.length ? Number(values.length) : undefined,
        width: values.width ? Number(values.width) : undefined,
        height: values.height ? Number(values.height) : undefined,
        volume_a1: values.volume_a1 ? Number(values.volume_a1) : undefined,
        density_a2: values.density_a2 ? Number(values.density_a2) : undefined,
        result_a: values.result_a ? Number(values.result_a) : undefined,
      });
      form.reset();
      setOpen(false);
      onSuccess();
    } catch (err) {
      console.error("Failed to create zero day sample", err);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogContent className='max-w-2xl max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle>Add Zero Day Sample</DialogTitle>
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
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='pending'>Pending</SelectItem>
                            <SelectItem value='completed'>Completed</SelectItem>
                            <SelectItem value='cancelled'>Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='length'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length</FormLabel>
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
                      <FormLabel>Width</FormLabel>
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
                      <FormLabel>Height</FormLabel>
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
                  name='volume_a1'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume A1 (L×W×H)</FormLabel>
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
                  name='density_a2'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Density A2</FormLabel>
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
                  name='result_a'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Result A</FormLabel>
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
                  {createMutation.isPending ? "Saving..." : "Save Sample"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ZeroDaySampleFormDialog;
