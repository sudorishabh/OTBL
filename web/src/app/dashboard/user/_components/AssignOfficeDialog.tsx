import DialogWindow from "@/components/DialogWindow";
import React, { useEffect, useState } from "react";
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
import CustomButton from "@/components/CustomButton";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const assignOfficeSchema = z.object({
  office_id: z.string().min(1, { message: "Office is required" }),
  role: z.enum(["manager", "operator"], {
    message: "Role is required for office assignment",
  }),
});

interface Office {
  id: number;
  name: string;
  city: string;
  state: string;
}

interface UserOffice {
  id: number;
  office_id: number;
  role: string;
  office: Office;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: number | null;
  userName: string;
  currentOffices: UserOffice[];
}

const AssignOfficeDialog = ({
  open,
  setOpen,
  userId,
  userName,
  currentOffices,
}: Props) => {
  const form = useForm<z.infer<typeof assignOfficeSchema>>({
    resolver: zodResolver(assignOfficeSchema),
    defaultValues: {
      office_id: "",
      role: "operator",
    },
  });

  // Mock offices data - replace with actual tRPC query
  const mockOffices: Office[] = [
    { id: 1, name: "Delhi Office", city: "Delhi", state: "Delhi" },
    { id: 2, name: "Mumbai Office", city: "Mumbai", state: "Maharashtra" },
    { id: 3, name: "Bangalore Office", city: "Bangalore", state: "Karnataka" },
  ];

  // TODO: Replace with actual tRPC mutations
  // const assignOffice = trpc.userMutation.assignOffice.useMutation();
  // const removeOfficeAssignment = trpc.userMutation.removeOfficeAssignment.useMutation();

  async function onSubmit(values: z.infer<typeof assignOfficeSchema>) {
    console.log("Assign office:", { userId, ...values });
    // await assignOffice.mutateAsync({ user_id: userId!, ...values });
    form.reset();
  }

  const handleRemoveOffice = (officeAssignmentId: number) => {
    console.log("Remove office assignment:", officeAssignmentId);
    // await removeOfficeAssignment.mutateAsync({ id: officeAssignmentId });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
    }
  };

  // Filter out offices already assigned
  const assignedOfficeIds = currentOffices.map((uo) => uo.office_id);
  const availableOffices = mockOffices.filter(
    (office) => !assignedOfficeIds.includes(office.id)
  );

  return (
    <DialogWindow
      title={`Manage Office Assignments - ${userName}`}
      description='Assign user to offices and manage their roles'
      open={open}
      setOpen={handleOpenChange}
      size='lg'>
      <div className='space-y-6 px-3.5 py-4'>
        {/* Current Assignments */}
        <div>
          <h3 className='text-sm font-medium mb-3'>
            Current Office Assignments
          </h3>
          {currentOffices.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              No office assignments yet
            </p>
          ) : (
            <div className='space-y-2'>
              {currentOffices.map((userOffice) => (
                <div
                  key={userOffice.id}
                  className='flex items-center justify-between p-3 border rounded-md'>
                  <div className='flex-1'>
                    <p className='font-medium'>{userOffice.office.name}</p>
                    <p className='text-sm text-muted-foreground'>
                      {userOffice.office.city}, {userOffice.office.state}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline'>{userOffice.role}</Badge>
                    <button
                      onClick={() => handleRemoveOffice(userOffice.id)}
                      className='text-destructive hover:text-destructive/80 p-1'
                      type='button'>
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Assignment */}
        {availableOffices.length > 0 && (
          <div className='border-t pt-4'>
            <h3 className='text-sm font-medium mb-3'>Add New Assignment</h3>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4'>
                <FormField
                  control={form.control}
                  name='office_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
                          <option value=''>Select an office</option>
                          {availableOffices.map((office) => (
                            <option
                              key={office.id}
                              value={office.id}>
                              {office.name} - {office.city}, {office.state}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='role'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role in Office</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
                          <option value='operator'>Operator</option>
                          <option value='manager'>Manager</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex gap-2 justify-end'>
                  <CustomButton
                    text='Assign Office'
                    variant='primary'
                    type='submit'
                  />
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    </DialogWindow>
  );
};

export default AssignOfficeDialog;
