"use client";
import React, { useState } from "react";
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
import { Plus, Trash2, Users, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

const addClientSchema = z.object({
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
});

const contactSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  designation: z.string().optional(),
  contact_number: z.string().min(1, { message: "Contact number is required" }),
  email: z.string().email({ message: "Invalid email" }),
  contact_type: z.string().optional(),
});

interface Contact {
  id: string;
  name: string;
  designation?: string;
  contact_number: string;
  email: string;
  contact_type?: string;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  existingContacts?: Contact[];
}

const AddClientDialog = ({ open, setOpen, existingContacts = [] }: Props) => {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isAddingNewContact, setIsAddingNewContact] = useState(false);
  const [contactMode, setContactMode] = useState<"existing" | "new">(
    "existing"
  );

  const utils = trpc.useUtils();

  const addClientWithContacts =
    trpc.clientMutation.addClientWithContacts.useMutation({
      onSuccess: () => {
        utils.clientQuery.getClients.invalidate();
        utils.clientQuery.getAllClientContacts.invalidate();
      },
      onError: (error) => {
        console.error("Error adding client:", error);
      },
    });

  const form = useForm<z.infer<typeof addClientSchema>>({
    resolver: zodResolver(addClientSchema),
    defaultValues: {
      name: "",
      address: "",
      state: "",
      city: "",
      pincode: "",
      gst_number: "",
      contact_number: "",
      email: "",
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

  async function onSubmit(values: z.infer<typeof addClientSchema>) {
    try {
      // Prepare contacts data (exclude existing contact IDs)
      const newContacts = selectedContacts
        .filter((c) => c.id.startsWith("temp-"))
        .map(({ id, ...contact }) => ({
          ...contact,
          designation: contact.designation || undefined,
          contact_type: contact.contact_type || undefined,
        }));

      await addClientWithContacts.mutateAsync({
        client: values,
        contacts: newContacts.length > 0 ? newContacts : undefined,
      });

      setOpen(false);
      form.reset();
      setSelectedContacts([]);
      setIsAddingNewContact(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  const handleAddContact = (values: z.infer<typeof contactSchema>) => {
    const newContact: Contact = {
      id: `temp-${Date.now()}`,
      ...values,
    };
    setSelectedContacts([...selectedContacts, newContact]);
    contactForm.reset();
    setIsAddingNewContact(false);
  };

  const handleRemoveContact = (contactId: string) => {
    setSelectedContacts(selectedContacts.filter((c) => c.id !== contactId));
  };

  const handleSelectExistingContact = (contactId: string) => {
    const contact = existingContacts.find((c) => c.id === contactId);
    if (contact && !selectedContacts.find((c) => c.id === contactId)) {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
      contactForm.reset();
      setSelectedContacts([]);
      setIsAddingNewContact(false);
      setContactMode("existing");
    }
  };

  return (
    <DialogWindow
      title='Add Client'
      description='Add a new client to the system and assign contacts'
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
                          placeholder='110001'
                          {...field}
                          maxLength={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Management */}
            <div className='border-t pt-6'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <Users className='h-5 w-5 text-[#035864]' />
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Contact Persons
                  </h3>
                  <Badge
                    variant='secondary'
                    className='ml-2'>
                    {selectedContacts.length}
                  </Badge>
                </div>
                <div className='flex gap-2'>
                  {existingContacts.length > 0 && (
                    <Button
                      type='button'
                      variant={
                        contactMode === "existing" ? "default" : "outline"
                      }
                      size='sm'
                      onClick={() => setContactMode("existing")}
                      className={
                        contactMode === "existing"
                          ? "bg-[#035864] hover:bg-[#035864]/90"
                          : ""
                      }>
                      Choose Existing
                    </Button>
                  )}
                  <Button
                    type='button'
                    variant={contactMode === "new" ? "default" : "outline"}
                    size='sm'
                    onClick={() => {
                      setContactMode("new");
                      setIsAddingNewContact(true);
                    }}
                    className={
                      contactMode === "new"
                        ? "bg-[#035864] hover:bg-[#035864]/90"
                        : ""
                    }>
                    <UserPlus className='h-4 w-4 mr-1' />
                    Add New
                  </Button>
                </div>
              </div>

              {/* Existing Contacts Selector */}
              {contactMode === "existing" && existingContacts.length > 0 && (
                <div className='mb-4'>
                  <Select onValueChange={handleSelectExistingContact}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select existing contact' />
                    </SelectTrigger>
                    <SelectContent>
                      {existingContacts
                        .filter(
                          (ec) =>
                            !selectedContacts.find((sc) => sc.id === ec.id)
                        )
                        .map((contact) => (
                          <SelectItem
                            key={contact.id}
                            value={contact.id}>
                            {contact.name} - {contact.email}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* New Contact Form */}
              {isAddingNewContact && contactMode === "new" && (
                <Form {...contactForm}>
                  <div className='bg-gray-50 p-4 rounded-lg mb-4 space-y-3'>
                    <div className='grid grid-cols-2 gap-3'>
                      <FormField
                        control={contactForm.control}
                        name='name'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Contact name'
                                {...field}
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
                            <FormLabel>Designation</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Manager, CEO, etc.'
                                {...field}
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
                        control={contactForm.control}
                        name='contact_number'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
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
                        control={contactForm.control}
                        name='contact_type'
                        render={({ field }) => (
                          <FormItem className='col-span-2'>
                            <FormLabel>Contact Type</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Primary, Finance, Technical, etc.'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className='flex gap-2 justify-end'>
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
                      <Button
                        type='button'
                        size='sm'
                        onClick={contactForm.handleSubmit(handleAddContact)}
                        className='bg-[#035864] hover:bg-[#035864]/90'>
                        <Plus className='h-4 w-4 mr-1' />
                        Add Contact
                      </Button>
                    </div>
                  </div>
                </Form>
              )}

              {/* Selected Contacts List */}
              {selectedContacts.length > 0 && (
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>
                    Selected Contacts:
                  </p>
                  {selectedContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className='flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200'>
                      <div className='flex-1'>
                        <p className='font-medium text-gray-900'>
                          {contact.name}
                        </p>
                        <div className='flex gap-4 mt-1'>
                          <p className='text-sm text-gray-600'>
                            {contact.email}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {contact.contact_number}
                          </p>
                        </div>
                        {contact.designation && (
                          <p className='text-xs text-gray-500 mt-1'>
                            {contact.designation}
                            {contact.contact_type &&
                              ` • ${contact.contact_type}`}
                          </p>
                        )}
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => handleRemoveContact(contact.id)}
                        className='hover:bg-red-50'>
                        <Trash2 className='h-4 w-4 text-red-600' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className='flex justify-end gap-3 pt-4 border-t'>
              <CustomButton
                text='Cancel'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                type='button'
              />
              <CustomButton
                text='Add Client'
                variant='primary'
                type='submit'
              />
            </div>
          </div>
        </CustomForm>
      </Form>
    </DialogWindow>
  );
};

export default AddClientDialog;
