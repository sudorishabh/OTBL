"use client";
import CustomButton from "@/components/CustomButton";
import useHandleParams from "@/hooks/useHandleParams";
import { PencilLine } from "lucide-react";
import React from "react";

const UpdateClientButton = () => {
  return (
    <CustomButton
      text='Edit details'
      variant='primary'
      Icon={PencilLine}
    />
  );
};

export default UpdateClientButton;
