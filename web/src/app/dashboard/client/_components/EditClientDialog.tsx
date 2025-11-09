"use client";
import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Users, UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

const editClientSchema = z.object({
  name: z.string().min(1, { message: "Client name is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  state: z.string().min(1, { message: "State is required" }),
  city: z.string().min(1, { message: "City is required" }),
  pincode: z.string().min(1, { message: "Pincode is required" }).max(10),
  gst_number: z
    .string()
    .min(15, { message: "GST number must be 15 characters" })
    .max(15),
  contact_number: z
    .string()
    .min(1, { message: "Contact number is required" })
    .max(15),
  email: z.string().email({ message: "Invalid email address" }),
  status: z.enum(["active", "inactive"]).optional(),
});

const contactSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  designation: z.string().optional(),
  contact_number: z.string().min(1, { message: "Contact number is required" }),
  email: z.string().email({ message: "Invalid email" }),
  contact_type: z.string().optional(),
});

interface Contact {
  id: number;
  client_id?: number;
  name: string;
  designation?: string;
  contact_number: string;
  email: string;
  contact_type?: string;
}

interface Client {
  id: number;
  name: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  gst_number: string;
  contact_number: string;
  email: string;
  status: "active" | "inactive";
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  client: Client | null;
  existingContacts: Contact[];
}

const EditClientDialog = ({
  open,
  setOpen,
  client,
  existingContacts = [],
}: Props) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsToRemove, setContactsToRemove] = useState<number[]>([]);
  const [isAddingNewContact, setIsAddingNewContact] = useState(false);

  const utils = trpc.useUtils();

  const editClientWithContacts =
    trpc.clientMutation.editClientWithContacts.useMutation({
      onSuccess: () => {
        utils.clientQuery.getClients.invalidate();
        utils.clientQuery.getAllClientContacts.invalidate();
        utils.clientQuery.getClientContacts.invalidate();
      },
      onError: (error: any) => {
        console.error("Error editing client:", error);
      },
    });

  const form = useForm<z.infer<typeof editClientSchema>>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      name: "",
      address: "",
      state: "",
      city: "",
      pincode: "",
      gst_number: "",
      contact_number: "",
      email: "",
      status: "active",
    },
  });

  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      designation: "",
      contact_number: "",
      email: "",
      contact_type: "",
    },
  });

  // Pre-fill form when client changes
  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        address: client.address,
        state: client.state,
        city: client.city,
        pincode: client.pincode,
        gst_number: client.gst_number,
        contact_number: client.contact_number,
        email: client.email,
        status: client.status,
      });
      setContacts(existingContacts);
      setContactsToRemove([]);
    }
  }, [client, existingContacts, form]);

  async function onSubmit(values: z.infer<typeof editClientSchema>) {
    if (!client) return;

    try {
      // Separate new contacts from existing ones
      const newContacts = contacts
        .filter((c) => typeof c.id === "string" || c.id < 0)
        .map(({ id, ...contact }) => ({
          ...contact,
          designation: contact.designation || undefined,
          contact_type: contact.contact_type || undefined,
        }));

      await editClientWithContacts.mutateAsync({
        clientId: client.id,
        client: values,
        contactsToAdd: newContacts.length > 0 ? newContacts : undefined,
        contactsToRemove:
          contactsToRemove.length > 0 ? contactsToRemove : undefined,
      });

      setOpen(false);
      form.reset();
      setContacts([]);
      setContactsToRemove([]);
      setIsAddingNewContact(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  const handleAddContact = (values: z.infer<typeof contactSchema>) => {
    const newContact: Contact = {
      id: -Date.now(), // Temporary negative ID for new contacts
      ...values,
    };
    setContacts([...contacts, newContact]);
    contactForm.reset();
    setIsAddingNewContact(false);
  };

  const handleRemoveContact = (contact: Contact) => {
    // If it's an existing contact (positive ID), mark it for removal
    if (contact.id > 0) {
      setContactsToRemove([...contactsToRemove, contact.id]);
    }
    // Remove from current contacts list
    setContacts(contacts.filter((c) => c.id !== contact.id));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
      contactForm.reset();
      setContacts([]);
      setContactsToRemove([]);
      setIsAddingNewContact(false);
    }
  };

  if (!client) return null;

  return (
    <DialogWindow
      title='Edit Client'
      description='Update client information and manage contacts'
      open={open}
      size='lg'
      setOpen={handleOpenChange}>
      <Form {...form}>
        <CustomForm onSubmit={form.handleSubmit(onSubmit)}>
          <div className='space-y-6'>
            {/* Client Information */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Client Information
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='col-span-2'>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter client name'
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
                          placeholder='client@example.com'
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
                  name='gst_number'
                  render={({ field }) => (
                    <FormItem className='col-span-2'>
                      <FormLabel>GST Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='22AAAAA0000A1Z5'
                          {...field}
                          maxLength={15}
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
                    <FormItem className='col-span-2'>
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
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='active'>Active</SelectItem>
                          <SelectItem value='inactive'>Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Client Contacts Section */}
            <div className='border-t pt-4'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <Users className='h-5 w-5 text-[#035864]' />
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Client Contacts
                  </h3>
                  <Badge variant='secondary'>{contacts.length}</Badge>
                </div>
                {!isAddingNewContact && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setIsAddingNewContact(true)}
                    className='flex items-center gap-2'>
                    <UserPlus className='h-4 w-4' />
                    Add Contact
                  </Button>
                )}
              </div>

              {/* Add New Contact Form */}
              {isAddingNewContact && (
                <div className='bg-[#035864]/5 p-4 rounded-lg mb-4 border border-[#035864]/20'>
                  <div className='flex items-center justify-between mb-3'>
                    <h4 className='font-medium text-sm text-gray-900'>
                      Add New Contact
                    </h4>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        setIsAddingNewContact(false);
                        contactForm.reset();
                      }}>
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                  <Form {...contactForm}>
                    <div className='grid grid-cols-2 gap-3'>
                      <FormField
                        control={contactForm.control}
                        name='name'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-xs'>Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Contact name'
                                {...field}
                                className='h-9'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contactForm.control}
                        name='designation'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-xs'>
                              Designation
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Optional'
                                {...field}
                                className='h-9'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contactForm.control}
                        name='email'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-xs'>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='contact@example.com'
                                {...field}
                                className='h-9'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contactForm.control}
                        name='contact_number'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-xs'>
                              Contact Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='+91 1234567890'
                                {...field}
                                className='h-9'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contactForm.control}
                        name='contact_type'
                        render={({ field }) => (
                          <FormItem className='col-span-2'>
                            <FormLabel className='text-xs'>
                              Contact Type
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='e.g., Primary, Billing, Technical (Optional)'
                                {...field}
                                className='h-9'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className='col-span-2 flex justify-end gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setIsAddingNewContact(false);
                            contactForm.reset();
                          }}>
                          Cancel
                        </Button>
                        <CustomButton
                          text='Add Contact'
                          Icon={Plus}
                          type='button'
                          variant='primary'
                          onClick={contactForm.handleSubmit(handleAddContact)}
                        />
                      </div>
                    </div>
                  </Form>
                </div>
              )}

              {/* Display Selected Contacts */}
              {contacts.length > 0 ? (
                <div className='space-y-2 max-h-[300px] overflow-y-auto pr-2'>
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className='flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <p className='font-medium text-sm text-gray-900 truncate'>
                            {contact.name}
                          </p>
                          {contact.id < 0 && (
                            <Badge
                              variant='outline'
                              className='bg-green-50 text-green-700 border-green-200 text-xs'>
                              New
                            </Badge>
                          )}
                        </div>
                        <div className='flex items-center gap-4 mt-1 text-xs text-gray-600'>
                          {contact.designation && (
                            <span className='truncate'>
                              {contact.designation}
                            </span>
                          )}
                          <span className='truncate'>{contact.email}</span>
                          <span>{contact.contact_number}</span>
                        </div>
                        {contact.contact_type && (
                          <Badge
                            variant='secondary'
                            className='mt-1 text-xs'>
                            {contact.contact_type}
                          </Badge>
                        )}
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => handleRemoveContact(contact)}
                        className='ml-2 text-red-600 hover:text-red-700 hover:bg-red-50'>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg'>
                  <Users className='h-8 w-8 mx-auto mb-2 text-gray-400' />
                  <p className='text-sm'>No contacts added yet</p>
                  <p className='text-xs mt-1'>
                    Click "Add Contact" to add a contact person
                  </p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className='flex justify-end gap-3 pt-4 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={editClientWithContacts.isPending}>
                Cancel
              </Button>
              <CustomButton
                text={
                  editClientWithContacts.isPending
                    ? "Updating..."
                    : "Update Client"
                }
                type='submit'
                variant='primary'
                disabled={editClientWithContacts.isPending}
              />
            </div>
          </div>
        </CustomForm>
      </Form>
    </DialogWindow>
  );
};

export default EditClientDialog;
