import DialogWindow from "@/components/shared/dialog-window";
import React from "react";
interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TotalBudgetDialog = ({ open, setOpen }: Props) => {
  return (
    <DialogWindow
      open={open}
      setOpen={setOpen}
      size='md'
      title='Total Budget'
      description='xyz...'>
      <div></div>
    </DialogWindow>
  );
};

export default TotalBudgetDialog;
