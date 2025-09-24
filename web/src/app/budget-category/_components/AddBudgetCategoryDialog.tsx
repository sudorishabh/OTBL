import DialogWindow from "@/components/DialogWindow";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { addCategoryBudgetSchema } from "../_schemas";
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

const AddBudgetCategoryDialog = ({
  open,
  setOpen,
  isEditInfo,
  setIsEditInfo,
}: Props) => {
  const form = useForm<z.infer<typeof addCategoryBudgetSchema>>({
    resolver: zodResolver(addCategoryBudgetSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const utils = trpc.useUtils();

  const isEditMode = isEditInfo ? true : false;

  const addBudgetCategory =
    trpc.budgetCategoryMutation.addBudgetCategory.useMutation({
      onSuccess: () => {
        utils.budgetCategoryQuery.getBudgetCategories.invalidate();
      },
    });

  const editBudgetCategory =
    trpc.budgetCategoryMutation.editBudgetCategory.useMutation({
      onSuccess: () => {
        utils.budgetCategoryQuery.getBudgetCategories.invalidate();
      },
    });

  async function onSubmit(values: z.infer<typeof addCategoryBudgetSchema>) {
    if (isEditMode) {
      if (!isEditInfo?.id) {
        return;
      }
      await editBudgetCategory.mutateAsync({ id: isEditInfo?.id, ...values });
    } else {
      await addBudgetCategory.mutateAsync(values);
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
      title='Add Budget Category'
      description='Add budget category for work order budgetting'
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
                <FormLabel>Budget Category Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={isEditMode}
                    placeholder='Enter budget category name'
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
                <FormLabel>Budget Category Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Enter budget category description'
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

export default AddBudgetCategoryDialog;
