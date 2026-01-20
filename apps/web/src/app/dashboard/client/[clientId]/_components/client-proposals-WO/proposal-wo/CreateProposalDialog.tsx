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
import { proposalSchemas, type proposalTypes } from "@pkg/schema";

interface Props {
  clientId: number;
}

const CreateProposalDialog = ({ clientId }: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const { deleteParams, getParam } = useHandleParams();
  const { handleError } = useApiError();
  const mode = getParam("mode");
  const isAddMode = mode === "proposal-add";
  const isOpenDialog = isAddMode;

  // Fetch offices for the dropdown
  const { data: officesData, isLoading: isLoadingOffices } =
    trpc.officeQuery.getOffices.useQuery(
      { searchQuery: "", status: "active" },
      { enabled: isOpenDialog },
    );

  const form = useForm<proposalTypes.BaseProposalInput>({
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
    },
    onError: (error) => {
      console.error("Error adding proposal:", error);
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
    deleteParams(["mode"]);

    // Delay form reset until after animation completes
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
      uploadedFileId.current = null;
    }, 2000);
  }, [deleteParams, form, cleanupFile, isUploading]);

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
      uploadedFileId.current = null;
    }
  }, [isAddMode, form]);

  async function onSubmit(values: proposalTypes.BaseProposalInput) {
    try {
      console.log(values);
      await addProposal.mutateAsync({ ...values, client_id: clientId });
      // Clear the ref so we don't delete on close
      uploadedFileId.current = null;
      handleCloseDialog();
    } catch (error) {
      cleanupFile();
      toast.error("Error submitting form. Please try again.");
    }
  }

  const offices = officesData?.offices ?? [];

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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Submission Date</FormLabel>
                  <FormControl>
                    <Input
                      type='date'
                      {...field}
                      value={
                        field.value instanceof Date
                          ? field.value.toISOString().split("T")[0]
                          : (field.value ?? "")
                      }
                      onChange={(e) => {
                        const dateValue = e.target.value
                          ? new Date(e.target.value)
                          : undefined;
                        field.onChange(dateValue);
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
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomUploadDocument
                    label='Proposal Document'
                    folderPath={`/Proposals`}
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

          <CustomButton
            type='submit'
            text='Submit'
            className='w-full'
            variant='primary'
            loading={form.formState.isSubmitting || addProposal.isPending}
            disabled={form.formState.isSubmitting || addProposal.isPending}
          />
        </CustomForm>
      </Form>
    </DialogWindow>
  );
};

export default CreateProposalDialog;
