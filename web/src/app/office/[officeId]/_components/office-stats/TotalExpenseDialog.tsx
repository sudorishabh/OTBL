import DialogWindow from "@/components/DialogWindow";
import React from "react";
interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TotalExpenseDialog = ({ open, setOpen }: Props) => {
  return (
    <DialogWindow
      open={open}
      setOpen={setOpen}
      size='md'
      title='Total Expense'
      description='xyz...'>
      <div></div>
    </DialogWindow>
  );
};

export default TotalExpenseDialog;
