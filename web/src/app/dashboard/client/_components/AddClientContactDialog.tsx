"use client";
import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomButton from "@/components/CustomButton";
import CustomForm from "@/components/CustomForm";
import { trpc } from "@/lib/trpc";

const addClientContactSchema = z.object({
  client_id: z.number(),
  name: z.string().min(1, { message: "Contact name is required" }),
  designation: z.string().optional(),
  contact_number: z
    .string()
    .min(1, { message: "Contact number is required" })
    .max(15),
  email: z.string().email({ message: "Invalid email address" }),
  contact_type: z.string().optional(),
});

interface Client {
  id: number;
  name: string;
  email: string;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  clients: Client[];
  preselectedClientId?: number;
}

const AddClientContactDialog = ({
  open,
  setOpen,
  clients,
  preselectedClientId,
}: Props) => {
  const utils = trpc.useUtils();

  const addClientContact = trpc.clientMutation.addClientContact.useMutation({
    onSuccess: () => {
      utils.clientQuery.getAllClientContacts.invalidate();
      utils.clientQuery.getClients.invalidate();
    },
    onError: (error: unknown) => {
      console.error("Error adding client contact:", error);
    },
  });

  const form = useForm<z.infer<typeof addClientContactSchema>>({
    resolver: zodResolver(addClientContactSchema),
    defaultValues: {
      client_id: preselectedClientId || 0,
      name: "",
      designation: "",
      contact_number: "",
      email: "",
      contact_type: "",
    },
  });

  // Update client_id when preselectedClientId changes
  React.useEffect(() => {
    if (preselectedClientId) {
      form.setValue("client_id", preselectedClientId);
    }
  }, [preselectedClientId, form]);

  async function onSubmit(values: z.infer<typeof addClientContactSchema>) {
    try {
      await addClientContact.mutateAsync({
        ...values,
        designation: values.designation || undefined,
        contact_type: values.contact_type || undefined,
      });
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
        client_id: preselectedClientId || 0,
        name: "",
        designation: "",
        contact_number: "",
        email: "",
        contact_type: "",
      });
    }
  };

  return (
    <DialogWindow
      title='Add Client Contact'
      description='Add a new contact person for a client'
      open={open}
      size='sm'
      setOpen={handleOpenChange}>
      <Form {...form}>
        <CustomForm onSubmit={form.handleSubmit(onSubmit)}>
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='client_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value ? field.value.toString() : ""}
                    disabled={!!preselectedClientId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a client' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem
                          key={client.id}
                          value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter contact name'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='designation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., Manager, CEO, Director'
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
                      placeholder='contact@example.com'
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='+91 1234567890'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='contact_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Type (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., Primary, Finance, Technical'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='flex justify-end gap-3 mt-6'>
            <CustomButton
              text='Cancel'
              variant='outline'
              onClick={() => handleOpenChange(false)}
              type='button'
            />
            <CustomButton
              text='Add Contact'
              variant='primary'
              type='submit'
              disabled={addClientContact.isPending}
            />
          </div>
        </CustomForm>
      </Form>
    </DialogWindow>
  );
};

export default AddClientContactDialog;
