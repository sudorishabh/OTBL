import DialogWindow from "@/components/DialogWindow";
import React, { useEffect } from "react";
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
import CustomButton from "@/components/CustomButton";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import toast from "react-hot-toast";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  contact_number: z.string().optional(),
  role: z.enum(["admin", "manager", "staff", "viewer", "operator"]),
});

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  isEditInfo: IUser | null;
  setIsEditInfo: (isEditInfo: IUser | null) => void;
}

const AddUserDialog = ({ open, setOpen, isEditInfo, setIsEditInfo }: Props) => {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      contact_number: "",
      role: "staff",
    },
  });

  const trpcUtils = trpc.useUtils();

  const registerMutation = trpc.userMutation.registerByAdmin.useMutation({
    onSuccess: () => {
      toast.success("User registered successfully");
      trpcUtils.userQuery.getUsers.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to register user: ${error.message}`);
    },
  });

  const editUserMutation = trpc.userMutation.editUser.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  const isEditMode = isEditInfo ? true : false;

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    if (isEditMode) {
      // Edit user logic here
      await editUserMutation.mutateAsync({ id: isEditInfo!.id, ...values });
    } else {
      // Add user logic here
      await registerMutation.mutateAsync(values);
    }
    setOpen(false);
    form.reset();
  }

  useEffect(() => {
    if (isEditInfo) {
      form.reset({
        name: isEditInfo.name ?? "",
        email: isEditInfo.email ?? "",
        contact_number: isEditInfo.contact_number ?? "",
        role: isEditInfo.role as any,
        password: undefined,
      });
    } else {
      form.reset({
        name: "",
        email: "",
        password: "",
        contact_number: "",
        role: "staff",
      });
    }
  }, [isEditInfo]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
      setIsEditInfo(null);
    }
  };

  return (
    <DialogWindow
      title={isEditMode ? "Edit User" : "Add User"}
      description={
        isEditMode ? "Update user information" : "Create a new user account"
      }
      open={open}
      setOpen={handleOpenChange}
      size='md'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4 px-3.5 py-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter user name'
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
                    placeholder='Enter email address'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isEditMode && (
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Enter password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name='contact_number'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type='tel'
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
            name='role'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
                    <option value='admin'>Admin</option>
                    <option value='manager'>Manager</option>
                    <option value='staff'>Staff</option>
                    <option value='viewer'>Viewer</option>
                    <option value='operator'>Operator</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex gap-2 justify-end pt-4'>
            <CustomButton
              text='Cancel'
              onClick={() => handleOpenChange(false)}
              variant='outline'
              type='button'
            />
            <CustomButton
              text={isEditMode ? "Update" : "Create"}
              variant='primary'
              type='submit'
            />
          </div>
        </form>
      </Form>
    </DialogWindow>
  );
};

export default AddUserDialog;
