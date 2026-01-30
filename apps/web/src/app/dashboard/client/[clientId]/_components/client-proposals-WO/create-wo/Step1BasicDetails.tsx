"use client";
import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomButton from "@/components/CustomButton";
import DeferredFilePicker from "@/components/DeferredFilePicker";
import { workOrderTypes } from "@pkg/schema";
import { constants } from "@pkg/utils";
import { useFormContext } from "react-hook-form";
import Calendar from "@/components/custom-form-input/Calendar";

const { processTypeOptions } = constants;

interface Step1BasicDetailsProps {
  // form: UseFormReturn<workOrderTypes.BaseWorkOrderInput>;
  selectedFile: File | null;
  handleFileSelect: (file: File | null) => void;
  isUploading: boolean;
  progress: number;
  uploadedFile: boolean;
  documentUrl: string;
  deleteFile: () => void;
  isDeleting: boolean;
  onNext: () => void;
  onCancel: () => void;
}

const Step1BasicDetails: React.FC<Step1BasicDetailsProps> = ({
  // form,
  selectedFile,
  handleFileSelect,
  isUploading,
  progress,
  uploadedFile,
  documentUrl,
  deleteFile,
  isDeleting,
  onNext,
  onCancel,
}) => {
  const form = useFormContext();

  console.log(form.watch());

  return (
    <div className='space-y-4'>
      {/* Row 1: Code and Title */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='code'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Order Code *</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter work order code'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter title'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Row 2: Agreement Number and Rate Contract Number */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='agreement_number'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agreement Number *</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter agreement number'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='rate_contract_number'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rate Contract Number *</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter rate contract number'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Row 3: Process Type */}
      <FormField
        control={form.control}
        name='process_type'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Process Type *</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder='Select process type' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {processTypeOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Row 4: Dates */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <FormField
          control={form.control}
          name='start_date'
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Start Date *</FormLabel>
              <FormControl>
                {/* <Input
                  type='date'
                  {...fieldProps}
                  value={
                    value && typeof value === "object" && "toISOString" in value
                      ? (value as Date).toISOString().split("T")[0]
                      : typeof value === "string"
                        ? value
                        : ""
                  }
                  onChange={(e) => {
                    const dateValue = e.target.value
                      ? new Date(e.target.value)
                      : undefined;
                    onChange(dateValue);
                  }}
                /> */}
                <Calendar
                  value={value}
                  onChange={onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='end_date'
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>End Date *</FormLabel>
              <FormControl>
                <Calendar
                  value={value}
                  onChange={onChange}
                />
                {/* <Input
                  type='date'
                  {...fieldProps}
                  value={
                    value && typeof value === "object" && "toISOString" in value
                      ? (value as Date).toISOString().split("T")[0]
                      : typeof value === "string"
                        ? value
                        : ""
                  }
                  onChange={(e) => {
                    const dateValue = e.target.value
                      ? new Date(e.target.value)
                      : undefined;
                    onChange(dateValue);
                  }}
                /> */}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='handing_over_date'
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Handing Over Date *</FormLabel>
              <FormControl>
                {/* <Input
                  type='date'
                  {...fieldProps}
                  value={
                    value && typeof value === "object" && "toISOString" in value
                      ? (value as Date).toISOString().split("T")[0]
                      : typeof value === "string"
                        ? value
                        : ""
                  }
                  onChange={(e) => {
                    const dateValue = e.target.value
                      ? new Date(e.target.value)
                      : undefined;
                    onChange(dateValue);
                  }}
                /> */}
                <Calendar
                  value={value}
                  onChange={onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Row 5: Description */}
      <FormField
        control={form.control}
        name='description'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder='Enter description'
                rows={3}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Row 6: Document Upload */}
      <FormField
        control={form.control}
        name='document_key'
        render={({ field: _field }) => (
          <FormItem>
            <FormControl>
              <DeferredFilePicker
                label='Work Order Document *'
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                isUploading={isUploading}
                uploadProgress={progress}
                isUploaded={!!uploadedFile}
                uploadedUrl={documentUrl}
                onDelete={deleteFile}
                isDeleting={isDeleting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Action Buttons */}
      <div className='flex gap-3 pt-4'>
        <CustomButton
          type='button'
          text='Cancel'
          variant='outline'
          className='flex-1'
          onClick={onCancel}
          disabled={isUploading}
        />
        <CustomButton
          type='button'
          text='Next: Schedule of Rates'
          className='flex-1'
          variant='primary'
          onClick={onNext}
          disabled={isUploading}
        />
      </div>
    </div>
  );
};

export default Step1BasicDetails;
