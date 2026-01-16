import React from "react";
import DialogWindow from "@/components/DialogWindow";

const OfficeDetailsDialog = () => {
  return (
    <DialogWindow
      open={false}
      setOpen={() => {}}
      isLoading={false}
      title='Office Details'
      description='View office details'
      size='xl'>
      <div></div>
    </DialogWindow>
  );
};

export default OfficeDetailsDialog;
