"use client";
import React, { useEffect, useCallback, useState } from "react";
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
import CustomForm from "@/components/custom-form-input/Form";
import toast from "react-hot-toast";
import { useHandleParams } from "@/hooks/useHandleParams";
import DeferredFilePicker from "@/components/DeferredFilePicker";
import { useSharePointUpload } from "@/hooks/useSharePointUpload";
import { useApiError } from "@/hooks/useApiError";
import { proposalSchemas, type proposalTypes } from "@pkg/schema";
import { z } from "zod";

type ProposalFormInput = z.input<typeof proposalSchemas.baseProposalSchema>;

interface Props {
  clientId: number;
}

const CreateProposalDialog = ({ clientId }: Props) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { deleteParams, getParam } = useHandleParams();
  const { handleError } = useApiError();
  const mode = getParam("dialog");
  const isAddMode = mode === "create-proposal";
  const isOpenDialog = isAddMode;

  const {
    uploadFile,
    deleteFile,
    isUploading,
    isDeleting,
    progress,
    reset: resetUpload,
  } = useSharePointUpload({
    folderPath: "/Proposals",
    conflictBehavior: "replace",
  });

  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [uploadedFileId, setUploadedFileId] = useState<string>("");

  const { data: officesData, isLoading: isLoadingOffices } =
    trpc.officeQuery.getOffices.useQuery(
      { searchQuery: "", status: "active" },
      { enabled: isOpenDialog },
    );

  const form = useForm<
    ProposalFormInput,
    unknown,
    proposalTypes.BaseProposalInput
  >({
    resolver: zodResolver(proposalSchemas.baseProposalSchema),
    defaultValues: {
      code: "",
      title: "",
      description: "",
      document_key: "",
      office_id: undefined,
      proposal_amount: 0,
      proposal_submission_date: undefined,
    },
  });

  const utils = trpc.useUtils();

  const addProposal = trpc.proposalMutation.createProposal.useMutation({
    onSuccess: () => {
      utils.proposalQuery.getProposalsByClient.invalidate();
      toast.success("Proposal added");
      handleCloseDialog();
    },
    onError: (error) => {
      handleError(error, { showToast: true });
    },
  });

  const handleCloseDialog = useCallback(() => {
    if (isUploading) {
      toast.error("Please wait for the document to finish uploading.");
      return;
    }
    deleteParams(["dialog"]);

    setTimeout(() => {
      form.reset({
        code: "",
        title: "",
        description: "",
        document_key: "",
        office_id: undefined,
        proposal_amount: 0,
        proposal_submission_date: undefined,
      });
      setSelectedFile(null);
      setUploadedUrl("");
      setUploadedFileId("");
      resetUpload();
    }, 500);
  }, [deleteParams, form, isUploading, resetUpload]);

  useEffect(() => {
    if (isAddMode) {
      form.reset({
        code: "",
        title: "",
        description: "",
        document_key: "",
        office_id: undefined,
        proposal_amount: 0,
        proposal_submission_date: undefined,
      });
      setSelectedFile(null);
      setUploadedUrl("");
      setUploadedFileId("");
      resetUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddMode]);

  // Handle file selection - set a placeholder document_key
  const handleFileSelect = useCallback(
    (file: File | null) => {
      setSelectedFile(file);
      // If a new file is selected, clear any previous upload URL
      if (file) {
        setUploadedUrl("");
        setUploadedFileId("");
        // Set a placeholder value to pass validation
        // This will be replaced with the actual URL after upload
        form.setValue("document_key", `pending:${file.name}`, {
          shouldValidate: true,
        });
      } else {
        // Only clear if we don't have an uploaded URL
        if (!uploadedUrl) {
          form.setValue("document_key", "", { shouldValidate: true });
        }
      }
    },
    [form, uploadedUrl],
  );

  // Wrapper for delete to update local state and delete from SharePoint
  const handleDeleteFile = useCallback(async () => {
    if (uploadedFileId) {
      try {
        await deleteFile(uploadedFileId);
      } catch (error) {
        console.error("Failed to delete file from SharePoint", error);
        // We continue to clear local state even if server delete fails
      }
    }

    setSelectedFile(null);
    setUploadedUrl("");
    setUploadedFileId("");
    form.setValue("document_key", "", { shouldValidate: true });
    resetUpload();
  }, [form, resetUpload, deleteFile, uploadedFileId]);

  async function onSubmit(values: proposalTypes.BaseProposalInput) {
    try {
      let documentPath = values.document_key;

      // Upload file to SharePoint if a file was selected but not yet uploaded (still pending)
      if (selectedFile && !uploadedUrl && documentPath.startsWith("pending:")) {
        const uploadResult = await uploadFile(selectedFile);
        if (!uploadResult) {
          // Upload failed, error already shown by hook
          return;
        }
        documentPath = uploadResult.webUrl;
        setUploadedUrl(documentPath);
        setUploadedFileId(uploadResult.id);
      } else if (uploadedUrl) {
        documentPath = uploadedUrl;
      }

      // If document_key still starts with "pending:", it means something went wrong
      if (documentPath.startsWith("pending:")) {
        toast.error("Please upload a document");
        return;
      }

      // Create the proposal with the document path
      addProposal.mutate({
        ...values,
        client_id: clientId,
        document_key: documentPath,
      });
    } catch (error) {
      // If failure happens after upload, we could try to cleanup
      if (uploadedFileId) {
        await deleteFile(uploadedFileId);
      }
      toast.error("Error submitting form. Please try again.");
    }
  }

  const offices = officesData?.offices ?? [];
  const isSubmitting =
    form.formState.isSubmitting || addProposal.isPending || isUploading;

  return (
    <DialogWindow
      title='Add Proposal'
      description='Add a new proposal'
      open={isOpenDialog}
      size='md'
      setOpen={handleCloseDialog}>
      <Form {...form}>
        <CustomForm onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter code'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
          </div>

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

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Enter description'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='proposal_amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposal Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      min='0'
                      placeholder='Enter amount'
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='proposal_submission_date'
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Submission Date</FormLabel>
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

          <FormField
            control={form.control}
            name='document_key'
            render={({ field: _field }) => (
              <FormItem>
                <FormControl>
                  <DeferredFilePicker
                    label='Proposal Document'
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                    isUploading={isUploading}
                    uploadProgress={progress}
                    isUploaded={!!uploadedUrl}
                    uploadedUrl={uploadedUrl}
                    onDelete={handleDeleteFile}
                    isDeleting={isDeleting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <CustomButton
            type='submit'
            text={isUploading ? "Uploading..." : "Submit"}
            className='w-full'
            variant='primary'
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </CustomForm>
      </Form>
    </DialogWindow>
  );
};

export default CreateProposalDialog;
