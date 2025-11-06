"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import toast from "react-hot-toast";
import { Separator } from "@/components/ui/separator";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  officeId: number;
}

const ManageOfficeUsersDialog = ({ open, setOpen, officeId }: Props) => {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"manager" | "operator">(
    "operator"
  );

  const utils = trpc.useUtils();

  // Fetch all users
  const { data: allUsers } = trpc.userQuery.getAll.useQuery(undefined, {
    enabled: open,
  });

  // Fetch office users
  const { data: officeUsers, refetch: refetchOfficeUsers } =
    trpc.officeQuery.getOfficeUsers.useQuery(
      { office_id: officeId },
      { enabled: open }
    );

  // Mutations
  const assignUser = trpc.officeMutation.assignUserToOffice.useMutation({
    onSuccess: () => {
      toast.success("User assigned successfully");
      refetchOfficeUsers();
      setSelectedUserId("");
      utils.officeQuery.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to assign user");
    },
  });

  const removeUser = trpc.officeMutation.removeUserFromOffice.useMutation({
    onSuccess: () => {
      toast.success("User removed successfully");
      refetchOfficeUsers();
      utils.officeQuery.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove user");
    },
  });

  const handleAssignUser = () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    assignUser.mutate({
      office_id: officeId,
      user_id: parseInt(selectedUserId),
      role: selectedRole,
    });
  };

  const handleRemoveUser = (userId: number) => {
    removeUser.mutate({
      office_id: officeId,
      user_id: userId,
    });
  };

  // Filter out users already assigned to this office
  const assignedUserIds = new Set(
    officeUsers?.allUsers?.map((u: any) => u.id) || []
  );
  const availableUsers = allUsers?.filter(
    (u: any) => !assignedUserIds.has(u.id)
  );

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Manage Office Users
          </DialogTitle>
          <DialogDescription>
            Assign managers and operators to this office
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Add New User Section */}
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold'>Assign New User</h3>
            <div className='flex gap-2'>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setSelectedRole(value as "manager" | "operator")
                }>
                <SelectTrigger className='w-[140px]'>
                  <SelectValue placeholder='Select role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='manager'>Manager</SelectItem>
                  <SelectItem value='operator'>Operator</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}>
                <SelectTrigger className='flex-1'>
                  <SelectValue placeholder='Select user' />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers?.map((user: any) => (
                    <SelectItem
                      key={user.id}
                      value={user.id.toString()}>
                      <div className='flex items-center justify-between w-full'>
                        <span>{user.name}</span>
                        <span className='text-xs text-muted-foreground ml-2'>
                          ({user.email})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                  {(!availableUsers || availableUsers.length === 0) && (
                    <SelectItem
                      value='none'
                      disabled>
                      No available users
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <Button
                onClick={handleAssignUser}
                disabled={!selectedUserId || assignUser.isPending}
                size='default'>
                <UserPlus className='h-4 w-4 mr-2' />
                Assign
              </Button>
            </div>
          </div>

          <Separator />

          {/* Current Manager Section */}
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold'>Manager</h3>
            {officeUsers?.manager ? (
              <div className='flex items-center justify-between p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20'>
                <div className='flex-1'>
                  <div className='font-medium'>{officeUsers.manager.name}</div>
                  <div className='text-sm text-muted-foreground'>
                    {officeUsers.manager.email}
                  </div>
                  {officeUsers.manager.contact_number && (
                    <div className='text-sm text-muted-foreground'>
                      {officeUsers.manager.contact_number}
                    </div>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='default'>Manager</Badge>
                  <Button
                    variant='destructive'
                    size='icon'
                    onClick={() => handleRemoveUser(officeUsers.manager!.id)}
                    disabled={removeUser.isPending}>
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ) : (
              <div className='text-sm text-muted-foreground p-3 border rounded-lg bg-muted/50'>
                No manager assigned
              </div>
            )}
          </div>

          <Separator />

          {/* Operators Section */}
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold'>
              Operators ({officeUsers?.operators?.length || 0})
            </h3>
            {officeUsers?.operators && officeUsers.operators.length > 0 ? (
              <div className='space-y-2'>
                {officeUsers.operators.map((operator: any) => (
                  <div
                    key={operator.id}
                    className='flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors'>
                    <div className='flex-1'>
                      <div className='font-medium'>{operator.name}</div>
                      <div className='text-sm text-muted-foreground'>
                        {operator.email}
                      </div>
                      {operator.contact_number && (
                        <div className='text-sm text-muted-foreground'>
                          {operator.contact_number}
                        </div>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant='secondary'>Operator</Badge>
                      <Button
                        variant='destructive'
                        size='icon'
                        onClick={() => handleRemoveUser(operator.id)}
                        disabled={removeUser.isPending}>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-sm text-muted-foreground p-3 border rounded-lg bg-muted/50'>
                No operators assigned
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-end pt-4'>
          <Button
            variant='outline'
            onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageOfficeUsersDialog;
