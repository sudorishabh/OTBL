"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import CustomButton from "@/components/CustomButton";
import { trpc } from "@/lib/trpc";
import CustomForm from "@/components/CustomForm";

const addSiteSchema = z.object({
  name: z.string().min(1, { message: "Site name is required" }),
  address: z.string().min(1, { message: "Site address is required" }),
  state: z.string().min(1, { message: "State is required." }),
  city: z.string().min(1, { message: "City is required." }),
  pincode: z.string().min(1, { message: "Pincode is required." }).max(10),
  contact_person: z.string().min(1, { message: "Contact person is required." }),
  contact_number: z
    .string()
    .min(1, { message: "Contact number is required." })
    .max(15),
  email: z.email({ message: "Invalid email address." }),
});

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AddSiteDialog = ({ open, setOpen }: Props) => {
  const form = useForm<z.infer<typeof addSiteSchema>>({
    resolver: zodResolver(addSiteSchema),
    defaultValues: {
      address: "",
      city: "",
      contact_number: "",
      contact_person: "",
      email: "",
      name: "",
      pincode: "",
      state: "",
    },
  });

  const utils = trpc.useUtils();

  const addSite = trpc.siteMutation.addSite.useMutation({
    onSuccess: () => {
      utils.siteQuery.getSites.invalidate();
    },
    onError: (error) => {
      console.error("Error adding site:", error);
    },
  });

  const editSite = trpc.siteMutation.editSite.useMutation({
    onSuccess: () => {
      utils.siteQuery.getSites.invalidate();
    },
    onError: (error) => {
      console.error("Error editing site:", error);
    },
  });

  async function onSubmit(values: z.infer<typeof addSiteSchema>) {
    try {
      await addSite.mutateAsync(values);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset({
        name: "",
        address: "",
        city: "",
        contact_number: "",
        contact_person: "",
        email: "",
        pincode: "",
        state: "",
      });
    }
  };

  return (
    <DialogWindow
      title='Add Site'
      description='Add a new site to the system'
      open={open}
      size='sm'
      setOpen={handleOpenChange}>
      <Form {...form}>
        <CustomForm onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter name'
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

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='Enter email'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <CustomButton
            type='submit'
            text='Submit'
            className='w-full'
            variant='primary'
            loading={form.formState.isSubmitting}
            disabled={form.formState.isSubmitting}
          />
        </CustomForm>
      </Form>
    </DialogWindow>
  );
};

export default AddSiteDialog;
