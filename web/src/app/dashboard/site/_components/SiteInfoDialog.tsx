import DialogWindow from "@/components/DialogWindow";
import React from "react";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SiteInfoDialog = ({ open, setOpen }: Props) => {
  return (
    <DialogWindow
      open={open}
      setOpen={setOpen}>
      <div>fsdf</div>
    </DialogWindow>
  );
};

export default SiteInfoDialog;
