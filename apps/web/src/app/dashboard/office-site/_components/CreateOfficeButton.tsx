"use client";
import CustomButton from "@/components/CustomButton";
import useHandleParams from "@/hooks/useHandleParams";
import { Plus } from "lucide-react";
import React from "react";

const CreateOfficeButton = () => {
  const { setParam } = useHandleParams();
  return (
    <CustomButton
      text='Create New Office'
      Icon={Plus}
      variant='primary'
      onClick={() => setParam("dialog", "create-office")}
    />
  );
};

export default CreateOfficeButton;
