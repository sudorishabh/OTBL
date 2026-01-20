import CustomButton from "@/components/CustomButton";
import { PencilLine } from "lucide-react";
import React from "react";

const UpdateClientButton = () => {
  return (
    <CustomButton
      text='Edit details'
      variant='primary'
      Icon={PencilLine}
      //   onClick={() => setIsEditOfficeDialog(!isEditOfficeDialog)}
    />
  );
};

export default UpdateClientButton;
