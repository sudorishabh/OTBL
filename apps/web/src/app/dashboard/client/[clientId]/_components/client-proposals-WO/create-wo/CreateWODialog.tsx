"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DialogWindow from "@/components/DialogWindow";
import {
  Form,
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
import { trpc } from "@/lib/trpc";
import CustomForm from "@/components/CustomForm";
import toast from "react-hot-toast";
import { useHandleParams } from "@/hooks/useHandleParams";
import CustomUploadDocument from "@/components/CustomUploadDocument";
import { useApiError } from "@/hooks/useApiError";
import { workOrderSchemas, workOrderTypes } from "@pkg/schema";
import { z } from "zod";
import { useParams } from "next/navigation";
import { constants } from "@pkg/utils";

const { WO_PROCESS } = constants;

// Input type for the form (before validation/coercion)
type WorkOrderFormInput = z.input<typeof workOrderSchemas.baseWorkOrderSchema>;

interface Props {
  proposalId: number;
  proposalTitle: string;
}

const CreateWODialog = ({ proposalId, proposalTitle }: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const params = useParams();
  const clientId = params?.clientId ? Number(params.clientId) : 0;
  const { deleteParams, getParam } = useHandleParams();
  const { handleError } = useApiError();
  const mode = getParam("dialog");
  const urlProposalId = getParam("proposal-id");
  const isAddMode = mode === "create-workorder";
  const isOpenDialog = isAddMode;

  // Use proposalId from URL if available, otherwise fall back to prop
  const effectiveProposalId = urlProposalId
    ? Number(urlProposalId)
    : proposalId;

  // Fetch offices for the dropdown
  const { data: officesData, isLoading: isLoadingOffices } =
    trpc.officeQuery.getOffices.useQuery(
      { searchQuery: "", status: "active" },
      { enabled: isOpenDialog },
    );

  const form = useForm<
    WorkOrderFormInput,
    unknown,
    workOrderTypes.CreateWorkOrderInput
  >({
    resolver: zodResolver(workOrderSchemas.createWorkOrderSchema),
    defaultValues: {
      code: "",
      agreement_number: "",
      rate_contract_number: "",
      title: "",
      proposal_id: effectiveProposalId || undefined,
      client_id: clientId || undefined,
      office_id: undefined,
      start_date: undefined,
      end_date: undefined,
      handing_over_date: undefined,
      agreement_url: "",
      document_key: "",
      metric_ton: undefined,
      metric_ton_rate: undefined,
      process_type: undefined,
      description: "",
      grand_total_amount: undefined,
      expense_amount: 0,
    },
  });

  const utils = trpc.useUtils();

  const createWorkOrder = trpc.workOrderMutation.createWorkOrder.useMutation({
    onSuccess: () => {
      utils.workOrderQuery?.getWorkOrdersByClient?.invalidate?.({
        client_id: clientId,
      });
      utils.clientQuery.getClientStats.invalidate({ id: clientId });
      utils.proposalQuery.getProposalsByClient.invalidate({
        client_id: clientId,
      });
      toast.success("Work order created successfully!");
    },
    onError: (error) => {
      console.error("Error creating work order:", error);
      cleanupFile();
      handleError(error, { showToast: true });
    },
  });

  /* Cleanup Logic */
  const uploadedFileId = React.useRef<string | null>(null);
  const deleteFileMutation = trpc.sharePointMutation.deleteFile.useMutation();

  const cleanupFile = useCallback(() => {
    if (uploadedFileId.current) {
      deleteFileMutation.mutate({ fileId: uploadedFileId.current });
      uploadedFileId.current = null;
    }
  }, [deleteFileMutation]);

  const handleCloseDialog = useCallback(() => {
    if (isUploading) {
      toast.error("Please wait for the document to finish uploading.");
      return;
    }
    cleanupFile();
    deleteParams(["dialog", "proposal-id"]);

    // Delay form reset until after animation completes
    setTimeout(() => {
      form.reset({
        code: "",
        agreement_number: "",
        rate_contract_number: "",
        title: "",
        proposal_id: undefined,
        client_id: undefined,
        office_id: undefined,
        start_date: undefined,
        end_date: undefined,
        handing_over_date: undefined,
        agreement_url: "",
        document_key: "",
        metric_ton: undefined,
        metric_ton_rate: undefined,
        process_type: undefined,
        description: "",
        grand_total_amount: undefined,
        expense_amount: 0,
      });
      uploadedFileId.current = null;
    }, 500);
  }, [deleteParams, form, cleanupFile, isUploading]);

  useEffect(() => {
    if (isAddMode && effectiveProposalId && clientId) {
      form.setValue("proposal_id", effectiveProposalId);
      form.setValue("client_id", clientId);
    }
  }, [isAddMode, effectiveProposalId, clientId, form]);

  async function onSubmit(values: workOrderTypes.CreateWorkOrderInput) {
    try {
      console.log("Submitting work order:", values);
      await createWorkOrder.mutateAsync(values);
      // Clear the ref so we don't delete on close
      uploadedFileId.current = null;
      handleCloseDialog();
    } catch (error) {
      cleanupFile();
      toast.error("Error submitting form. Please try again.");
    }
  }

  const offices = officesData?.offices ?? [];

  // Process type options
  const processTypeOptions = [
    { value: WO_PROCESS.BIOREMEDIATION, label: "Bioremediation" },
    { value: WO_PROCESS.RESTORATION, label: "Restoration" },
  ];

  return (
    <DialogWindow
      title='Create Work Order'
      description={`Create a new work order for proposal: ${proposalTitle}`}
      open={isOpenDialog}
      size='lg'
      setOpen={handleCloseDialog}>
      <Form {...form}>
        <CustomForm
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.error("❌ Form validation failed:", errors);
            toast.error(
              "Please check the form for errors. Missing fields: " +
                Object.keys(errors).join(", "),
            );
          })}>
          {/* Row 1: Code and Title */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Order Code</FormLabel>
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
                  <FormLabel>Title</FormLabel>
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
                  <FormLabel>Agreement Number</FormLabel>
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
                  <FormLabel>Rate Contract Number</FormLabel>
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

          {/* Row 3: Office and Process Type */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='office_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString() ?? ""}
                    disabled={isLoadingOffices}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingOffices
                              ? "Loading offices..."
                              : "Select an office"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {offices.map((office) => (
                        <SelectItem
                          key={office.id}
                          value={office.id.toString()}>
                          {office.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='process_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Process Type</FormLabel>
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
          </div>

          {/* Row 4: Dates */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <FormField
              control={form.control}
              name='start_date'
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input
                      type='date'
                      {...fieldProps}
                      value={
                        value instanceof Date
                          ? value.toISOString().split("T")[0]
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
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input
                      type='date'
                      {...fieldProps}
                      value={
                        value instanceof Date
                          ? value.toISOString().split("T")[0]
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
                    />
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
                  <FormLabel>Handing Over Date</FormLabel>
                  <FormControl>
                    <Input
                      type='date'
                      {...fieldProps}
                      value={
                        value instanceof Date
                          ? value.toISOString().split("T")[0]
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 5: Metric Ton and Rate */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='metric_ton'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metric Ton (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      min='0'
                      placeholder='Enter metric ton'
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='metric_ton_rate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metric Ton Rate (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      min='0'
                      placeholder='Enter rate per metric ton'
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 6: Grand Total and Expense Amount */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='grand_total_amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grand Total Amount (₹) (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      min='0'
                      placeholder='Enter grand total amount'
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='expense_amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      min='0'
                      placeholder='Enter expense amount'
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value ?? 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 7: Agreement URL (Optional) */}
          <FormField
            control={form.control}
            name='agreement_url'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agreement URL (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type='url'
                    placeholder='Enter agreement URL'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Row 8: Description */}
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
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

          {/* Row 9: Document Upload */}
          <FormField
            control={form.control}
            name='document_key'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomUploadDocument
                    label='Work Order Document'
                    folderPath={`/WorkOrders`}
                    onUploadComplete={(path) => {
                      field.onChange(path);
                    }}
                    onUploadingChange={setIsUploading}
                    onFileChange={(file) => {
                      uploadedFileId.current = file?.id || null;
                    }}
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
              onClick={handleCloseDialog}
              disabled={createWorkOrder.isPending || isUploading}
            />
            <CustomButton
              type='submit'
              text='Create Work Order'
              className='flex-1'
              variant='primary'
              loading={form.formState.isSubmitting || createWorkOrder.isPending}
              disabled={
                form.formState.isSubmitting ||
                createWorkOrder.isPending ||
                isUploading
              }
            />
          </div>
        </CustomForm>
      </Form>
    </DialogWindow>
  );
};

export default CreateWODialog;
