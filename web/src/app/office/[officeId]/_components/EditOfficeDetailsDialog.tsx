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
// import { addOfficeSchema } from "../_schemas";
import { trpc } from "@/lib/trpc";
import CustomButton from "@/components/CustomButton";
import CustomForm from "@/components/CustomForm";

const editOfficeSchema = z.object({
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
  email: z.string().email({ message: "Invalid email address." }),
});

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  office:
    | {
        address: string;
        name: string;
        state: string;
        city: string;
        pincode: string;
        contact_person: string;
        contact_number: string;
        email: string;
        id: number;
        created_at: string;
        updated_at: string;
        status: "active" | "inactive" | null;
      }
    | undefined;
}

const EditOfficeDetailsDialog = ({ open, setOpen, office }: Props) => {
  const form = useForm<z.infer<typeof editOfficeSchema>>({
    resolver: zodResolver(editOfficeSchema),
    defaultValues: {
      name: office?.name || "",
      address: office?.address || "",
      state: office?.state || "",
      city: office?.city || "",
      pincode: office?.pincode || "",
      contact_person: office?.contact_person || "",
      contact_number: office?.contact_number || "",
      email: office?.email || "",
    },
  });

  const utils = trpc.useUtils();

  const editOffice = trpc.officeMutation.editOffice.useMutation();

  async function onSubmit(values: z.infer<typeof editOfficeSchema>) {
    if (!office?.id) {
      return;
    }
    await editOffice.mutateAsync({ id: office.id, ...values });
    setOpen(false);
    utils.officeQuery.getOffice.invalidate();
    form.reset();
  }

  return (
    <DialogWindow
      open={open}
      setOpen={setOpen}
      title='Edit Office'
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

export default EditOfficeDetailsDialog;
