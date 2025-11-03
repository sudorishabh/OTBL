import DialogWindow from "@/components/DialogWindow";
import React from "react";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";

import { trpc } from "@/lib/trpc";
import CustomButton from "@/components/CustomButton";
import CustomForm from "@/components/CustomForm";

const addOfficeSchema = z.object({
  name: z.string().min(1, { message: "Office name is required." }),
  address: z.string().min(1, { message: "Office Address is required." }),
  state: z.string().min(1, { message: "Office State is required." }),
  city: z.string().min(1, { message: "Office City is required." }),
  pincode: z
    .string()
    .min(1, { message: "Office Pincode is required." })
    .max(10),
  contact_person: z
    .string()
    .min(1, { message: "Office Contact person is required." }),
  contact_number: z
    .string()
    .min(1, { message: "Contact number is required." })
    .max(15),
  email: z.email({ message: "Invalid email address." }),
});

const workOrderFormSchema = z
  .object({
    code: z.string().min(1, { message: "Code is required" }),
    title: z.string().min(1, { message: "Title is required" }),
    date: z.string().min(1, { message: "Date is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    budget_amount: z.string().min(1, { message: "Budget is required" }),
    expense_amount: z.string().min(1, { message: "Expense is required" }),
    status: z.enum(["pending", "completed", "cancelled"]),
    // Site selection
    siteMode: z.enum(["existing", "new"]),
    site_ids: z.array(z.string()).optional(),
    newSites: z
      .array(
        z.object({
          name: z.string().min(1, { message: "Site name is required" }),
          address: z.string().min(1, { message: "Address is required" }),
          state: z.string().min(1, { message: "State is required" }),
          city: z.string().min(1, { message: "City is required" }),
          pincode: z
            .string()
            .min(1, { message: "Pincode is required" })
            .max(10),
          contact_person: z
            .string()
            .min(1, { message: "Contact person is required" }),
          contact_number: z
            .string()
            .min(1, { message: "Contact number is required" })
            .max(15),
          email: z.string().email({ message: "Valid email is required" }),
        })
      )
      .optional(),

    // Budget categories per site (Step 3)
    selectedSiteBudgets: z
      .array(
        z.object({
          site_id: z.string(),
          budget_category_ids: z.array(z.string()),
        })
      )
      .default([]),
    newSiteBudgets: z
      .array(
        z.object({
          site_index: z.number().nonnegative(),
          budget_category_ids: z.array(z.string()),
        })
      )
      .default([]),
  })
  .superRefine((val, ctx) => {
    if (val.siteMode === "existing") {
      const ids = val.site_ids ?? [];
      if (ids.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["site_ids"],
          message: "Select at least one site",
        });
      }
    } else if (val.siteMode === "new") {
      const list = val.newSites ?? [];
      if (list.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newSites"],
          message: "Add at least one site",
        });
      }
      list.forEach((site, index) => {
        const requiredFields: Array<keyof typeof site> = [
          "name",
          "address",
          "state",
          "city",
          "pincode",
          "contact_person",
          "contact_number",
          "email",
        ];
        requiredFields.forEach((key) => {
          const value = (site as Record<string, unknown>)[key];
          const isEmpty =
            value === undefined ||
            value === null ||
            String(value).trim() === "";
          if (isEmpty) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["newSites", index, key as string],
              message: "This field is required",
            });
          }
        });
      });
    }
  });

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AddOfficeDialog = ({ open, setOpen }: Props) => {
  const form = useForm<z.infer<typeof addOfficeSchema>>({
    resolver: zodResolver(addOfficeSchema),
    defaultValues: {
      name: "",
      address: "",
      state: "",
      city: "",
      pincode: "",
      contact_person: "",
      contact_number: "",
      email: "",
    },
  });

  const addOffice = trpc.officeMutation.addOffice.useMutation();

  async function onSubmit(values: z.infer<typeof addOfficeSchema>) {
    await addOffice.mutateAsync(values);
    setOpen(false);
    form.reset();
  }

  return (
    <DialogWindow
      open={open}
      setOpen={setOpen}
      title='Add Office'
      description='Add a new office to the system.'
      size='sm'>
      <Form {...form}>
        <CustomForm onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Office Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter office name'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='address'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter address'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='state'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter state'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='city'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter city'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='pincode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter pincode'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='contact_number'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter contact number'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='contact_person'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter contact person'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter email'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <CustomButton
            className='w-full'
            type='submit'
            text='Submit'
            variant='primary'
            loading={form.formState.isSubmitting}
            disabled={form.formState.isSubmitting}
          />
        </CustomForm>
      </Form>
    </DialogWindow>
  );
};

export default AddOfficeDialog;
