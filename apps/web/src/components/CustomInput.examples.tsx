/**
 * This example demonstrates how to use the CustomInput component in both modes
 */

import CustomInput from "@/components/CustomInput";
import { useForm } from "react-hook-form";
import { Search } from "lucide-react";
import { useState } from "react";

// ===== EXAMPLE 1: Form Mode (with react-hook-form) =====
interface FormData {
  email: string;
  role: string;
}

function FormModeExample() {
  const form = useForm<FormData>({
    defaultValues: {
      email: "",
      role: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className='space-y-4'>
      {/* Text Input with validation */}
      <CustomInput
        control={form.control}
        fieldName='email'
        Label='Email Address'
        placeholder='Enter your email'
        type='email'
        rules={{
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        }}
      />

      {/* Select Dropdown */}
      <CustomInput
        control={form.control}
        fieldName='role'
        Label='User Role'
        isSelect
        selectOptions={[
          { label: "Admin", value: "admin" },
          { label: "Manager", value: "manager" },
          { label: "User", value: "user" },
        ]}
        rules={{ required: "Role is required" }}
      />

      <button
        type='submit'
        className='px-4 py-2 bg-blue-500 text-white rounded'>
        Submit
      </button>
    </form>
  );
}

// ===== EXAMPLE 2: Standalone Mode (without react-hook-form) =====
function StandaloneModeExample() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  return (
    <div className='space-y-4'>
      {/* Search Input */}
      <CustomInput
        mode='standalone'
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder='Search users...'
        inputIcon={Search}
      />

      {/* Filter Select */}
      <CustomInput
        mode='standalone'
        value={selectedRole}
        onChange={setSelectedRole}
        Label='Filter by Role'
        isSelect
        selectOptions={[
          { label: "All Roles", value: "all" },
          { label: "Admin", value: "admin" },
          { label: "Manager", value: "manager" },
          { label: "User", value: "user" },
        ]}
      />

      <div className='text-sm'>
        <p>Search Query: {searchQuery}</p>
        <p>Selected Role: {selectedRole}</p>
      </div>
    </div>
  );
}

export { FormModeExample, StandaloneModeExample };
