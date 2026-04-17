import DialogWindow from "@/components/shared/dialog-window";
import React from "react";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TotalSitesDialog = ({ open, setOpen }: Props) => {
  return (
    <DialogWindow
      open={open}
      setOpen={setOpen}
      size='md'
      title='Total Sites'
      description='xyz...'>
      <div></div>
    </DialogWindow>
  );
};

export default TotalSitesDialog;
