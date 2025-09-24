import DialogWindow from "@/components/DialogWindow";
import React from "react";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CreateWODialog = ({ open, setOpen }: Props) => {
  return (
    <DialogWindow
      title='Create Work order'
      description='xyz...'
      open={open}
      setOpen={setOpen}
      className='w-[90vw] sm:max-w-[100%]'>
      <div></div>
    </DialogWindow>
  );
};

export default CreateWODialog;
