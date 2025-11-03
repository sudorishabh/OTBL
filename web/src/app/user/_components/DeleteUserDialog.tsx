import DialogWindow from "@/components/DialogWindow";
import React from "react";
import CustomButton from "@/components/CustomButton";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: number | null;
  userName: string;
  onConfirm: () => void;
}

const DeleteUserDialog = ({
  open,
  setOpen,
  userId,
  userName,
  onConfirm,
}: Props) => {
  const handleDelete = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <DialogWindow
      title='Delete User'
      description='This action cannot be undone'
      open={open}
      setOpen={setOpen}
      size='sm'>
      <div className='space-y-4 px-3.5 py-4'>
        <div className='flex items-start gap-3'>
          <div className='p-2 bg-destructive/10 rounded-full'>
            <AlertTriangle className='h-5 w-5 text-destructive' />
          </div>
          <div className='flex-1'>
            <p className='text-sm'>
              Are you sure you want to delete{" "}
              <span className='font-semibold'>{userName}</span>?
            </p>
            <p className='text-sm text-muted-foreground mt-2'>
              This will remove the user from all office assignments and work
              orders. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className='flex gap-2 justify-end pt-4'>
          <CustomButton
            text='Cancel'
            onClick={() => setOpen(false)}
            variant='outline'
            type='button'
          />
          <CustomButton
            text='Delete User'
            onClick={handleDelete}
            variant='primary'
            type='button'
            className='bg-destructive hover:bg-destructive/90 text-white'
          />
        </div>
      </div>
    </DialogWindow>
  );
};

export default DeleteUserDialog;
