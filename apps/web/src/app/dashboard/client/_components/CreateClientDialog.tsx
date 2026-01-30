"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
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
import CustomForm from "@/components/custom-form-input/Form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Users, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useSearchParams } from "next/navigation";
import { clientSchemas, clientTypes } from "@pkg/schema";
import { z } from "zod";
import useHandleParams from "@/hooks/useHandleParams";
import { useApiError } from "@/hooks/useApiError";
import toast from "react-hot-toast";

const contactSchema = clientSchemas.createClientContactSchema.omit({
  client_id: true,
});
type ContactFormInput = z.infer<typeof contactSchema>;

type Contact = {
  id: string | number;
  name: string;
  designation?: string | null;
  contact_number: string;
  email: string;
  contact_type?: string | null;
};

const CreateClientDialog = () => {
  const searchParams = useSearchParams();
  const isAddClientMode = searchParams.get("dialog") === "create-client";
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isAddingNewContact, setIsAddingNewContact] = useState(false);
  const [contactMode, setContactMode] = useState<"existing" | "new">(
    "existing",
  );

  const { deleteParam } = useHandleParams();
  const { handleError } = useApiError();

  const utils = trpc.useUtils();

  const existingClientContacts = trpc.clientQuery.getAllClientContacts.useQuery(
    {
      searchQuery: "",
      clientId: "",
    },
  );

  const addClientWithContacts =
    trpc.clientMutation.createClientWithContacts.useMutation({
      onSuccess: () => {
        toast.success("Client added successfully");
        utils.clientQuery.getClients.invalidate();
        utils.clientQuery.getAllClientContacts.invalidate();
      },
      onError: (error) => {
        handleError(error, { showToast: true });
      },
    });

  const form = useForm<clientTypes.createClientInput>({
    resolver: zodResolver(clientSchemas.createClientSchema),
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

  const contactForm = useForm<ContactFormInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      designation: "",
      contact_number: "",
      email: "",
      contact_type: "",
    },
  });

  const handleCloseDialog = () => {
    deleteParam("dialog");
    form.reset();
    contactForm.reset();
    setSelectedContacts([]);
    setIsAddingNewContact(false);
    setContactMode("existing");
  };

  async function onSubmit(values: clientTypes.createClientInput) {
    try {
      const newContacts = selectedContacts
        .filter((c: Contact) => c.id.toString().startsWith("temp-"))
        .map(({ id, designation, contact_type, ...contact }) => ({
          ...contact,
          designation: designation || undefined,
          contact_type: contact_type || undefined,
        })) as Array<Omit<clientTypes.createClientContactInput, "client_id">>;

      await addClientWithContacts.mutateAsync({
        client: values,
        contacts: newContacts.length > 0 ? newContacts : undefined,
      });

      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  const handleAddContact = (values: ContactFormInput) => {
    const newContact: Contact = {
      id: `temp-${Date.now()}`,
      ...values,
    };
    setSelectedContacts([...selectedContacts, newContact]);
    contactForm.reset();
    setIsAddingNewContact(false);
  };

  const handleRemoveContact = (contactId: string | number) => {
    setSelectedContacts(selectedContacts.filter((c) => c.id !== contactId));
  };

  const handleSelectExistingContact = (contactId: string) => {
    // contactId comes from Select which is string, but db ids might be numbers
    const idToCompare = isNaN(Number(contactId))
      ? contactId
      : Number(contactId);

    // Check both as string and number just in case
    const contact = existingClientContacts.data?.find(
      (c: Contact) => c.id == idToCompare,
    );

    if (
      contact &&
      !selectedContacts.find((c: Contact) => c.id == idToCompare)
    ) {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  return (
    <DialogWindow
      title='Add Client'
      description='Add a new client to the system and assign contacts'
      open={isAddClientMode}
      size='lg'
      setOpen={handleCloseDialog}>
      <Form {...form}>
        <CustomForm onSubmit={form.handleSubmit(onSubmit)}>
          <div className='space-y-6 max-h-[60vh] overflow-y-auto pr-2'>
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
                  {(existingClientContacts.data?.length ?? 0) > 0 && (
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
              {contactMode === "existing" &&
                (existingClientContacts.data?.length ?? 0) > 0 && (
                  <div className='mb-4'>
                    <Select onValueChange={handleSelectExistingContact}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select existing contact' />
                      </SelectTrigger>
                      <SelectContent>
                        {(existingClientContacts.data ?? [])
                          .filter(
                            (ec: Contact) =>
                              !selectedContacts.find(
                                (sc: Contact) => sc.id == ec.id,
                              ),
                          )
                          .map((contact: Contact) => (
                            <SelectItem
                              key={contact.id}
                              value={contact.id.toString()}>
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
                onClick={() => handleCloseDialog()}
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

export default CreateClientDialog;
