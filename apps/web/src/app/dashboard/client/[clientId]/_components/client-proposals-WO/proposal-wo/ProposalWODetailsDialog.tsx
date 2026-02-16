import DialogWindow from "@/components/DialogWindow";
import useHandleParams from "@/hooks/useHandleParams";
import { Maximize2, Minimize2 } from "lucide-react";
import React from "react";

const ProposalWODetailsDialog = () => {
  const { getParam, setParam, deleteParam, deleteParams } = useHandleParams();
  const isOpen = getParam("dialog") === "proposal-wo";
  const isFull = getParam("window") === "full";

  return (
    <DialogWindow
      open={isOpen}
      setOpen={() => deleteParams(["dialog", "window"])}
      size='lg'
      heightFull={true}
      title='Proposal Details'
      description='View proposal details'
      isFullScreen={isFull}
      onToggleFullScreen={() =>
        isFull ? deleteParam("window") : setParam("window", "full")
      }>
      <div>
        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-between'></div>
        </div>
      </div>
    </DialogWindow>
  );
};

export default ProposalWODetailsDialog;
