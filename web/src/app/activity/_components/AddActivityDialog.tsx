import DialogWindow from "@/components/DialogWindow";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { addActivitySchema } from "../_schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/custom/CustomButton";
import { trpc } from "@/lib/trpc";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  isEditInfo: { id: number; name: string; description: string } | null;
  setIsEditInfo: (
    isEditInfo: { id: number; name: string; description: string } | null
  ) => void;
}

const AddActivityDialog = ({
  open,
  setOpen,
  isEditInfo,
  setIsEditInfo,
}: Props) => {
  const form = useForm<z.infer<typeof addActivitySchema>>({
    resolver: zodResolver(addActivitySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const utils = trpc.useUtils();

  const isEditMode = isEditInfo ? true : false;

  const addActivity = trpc.activityMutation.addActivity.useMutation({
    onSuccess: () => {
      utils.activityQuery.getActivities.invalidate();
    },
  });

  const editActivity = trpc.activityMutation.editActivity.useMutation({
    onSuccess: () => {
      utils.activityQuery.getActivities.invalidate();
    },
  });

  async function onSubmit(values: z.infer<typeof addActivitySchema>) {
    if (isEditMode) {
      if (!isEditInfo?.id) {
        return;
      }
      await editActivity.mutateAsync({ id: isEditInfo?.id, ...values });
    } else {
      await addActivity.mutateAsync(values);
    }
    setOpen(false);
    form.reset();
  }

  useEffect(() => {
    if (isEditInfo) {
      form.reset({
        name: isEditInfo.name ?? "",
        description: isEditInfo.description ?? "",
      });
    } else {
      form.reset({ name: "", description: "" });
    }
  }, [isEditInfo]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset({ name: "", description: "" });
      setIsEditInfo(null);
    }
  };

  return (
    <DialogWindow
      title='Add Activity'
      description='Add activity for sites activities'
      open={open}
      setOpen={handleOpenChange}>
      <Form {...form}>
        <form
          className='space-y-6 px-3.5'
          onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={isEditMode}
                    placeholder='Enter activity name'
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Enter activity description'
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <CustomButton
            type='submit'
            text='Submit'
            className='w-full'
            loading={form.formState.isSubmitting}
            disabled={form.formState.isSubmitting}
          />
        </form>
      </Form>
    </DialogWindow>
  );
};

export default AddActivityDialog;
