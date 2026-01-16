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
import { useApiError } from "@/hooks/useApiError";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  workOrderSiteId: number;
  onSuccess: () => void;
};

const OilZapperActivityFormDialog: React.FC<Props> = ({
  open,
  setOpen,
  workOrderSiteId,
  onSuccess,
}) => {
  const form = useForm({
    defaultValues: {
      activity_description: "",
      sent_kg: "",
      sent_date: "",
      bill_document_url: "",
    },
  });
  const { handleError } = useApiError();

  const createMutation =
    trpc.siteActivityMutation.createOilZapperActivity.useMutation();

  const onSubmit = async (values: any) => {
    try {
      await createMutation.mutateAsync({
        work_order_site_id: workOrderSiteId,
        activity_description: values.activity_description || undefined,
        sent_kg: values.sent_kg ? Number(values.sent_kg) : undefined,
        sent_date: values.sent_date || undefined,
        // bill_document_url: values.bill_document_url || undefined, // Not supported by schema yet
      });
      form.reset();
      setOpen(false);
      onSuccess();
    } catch (err) {
      handleError(err, { showToast: true });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogContent className='max-w-2xl max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle>Add Oil Zapper Activity</DialogTitle>
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
                  name='sent_kg'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sent (kg)</FormLabel>
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
                  name='sent_date'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sent date</FormLabel>
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
                name='bill_document_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill URL</FormLabel>
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

export default OilZapperActivityFormDialog;
