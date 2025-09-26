import DialogWindow from "@/components/DialogWindow";
import React from "react";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CompletedWODialog = ({ open, setOpen }: Props) => {
  return (
    <DialogWindow
      open={open}
      setOpen={setOpen}
      size='md'
      title='Completed work Orders'
      description='xyz...'>
      <div></div>
    </DialogWindow>
  );
};

export default CompletedWODialog;
