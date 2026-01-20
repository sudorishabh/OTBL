import DialogWindow from "@/components/DialogWindow";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import CreateWOStep1Basic from "./Steps/CreateWOStep1Basic";
import CreateWOStep2Sites from "./Steps/CreateWOStep2Sites";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
// import {
//   workOrderSchemas,
//   type CreateWorkOrderFormInput,
// } from "@pkg/trpc/schemas";
import { useHandleParams } from "@/hooks/useHandleParams";
import CustomUploadDocument from "@/components/CustomUploadDocument";
import { useApiError } from "@/hooks/useApiError";
import CustomForm from "@/components/CustomForm";

interface Props {
  proposalId: number;
  proposalTitle: string;
}

// type WorkOrderFormValues = CreateWorkOrderFormInput;

const CreateWODialog = ({ proposalId, proposalTitle }: Props) => {
  const [step, setStep] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const params = useParams();
  const clientId = params?.clientId ? Number(params.clientId) : 0;
  const prevOfficeIdRef = useRef<string>("");
  const uploadedFileId = useRef<string | null>(null);
  const utils = trpc.useUtils();
  const { deleteParams, getParam } = useHandleParams();
  const { handleError } = useApiError();

  // Cleanup mutation for SharePoint files
  const deleteFileMutation = trpc.sharePointMutation.deleteFile.useMutation();

  const cleanupFile = useCallback(() => {
    if (uploadedFileId.current) {
      deleteFileMutation.mutate({ fileId: uploadedFileId.current });
      uploadedFileId.current = null;
    }
  }, [deleteFileMutation]);

  const mode = getParam("mode");
  const urlProposalId = getParam("proposal-id");
  const isAddMode = mode === "wo-add";
  const isOpenDialog = isAddMode;

  // Use proposalId from URL if available, otherwise fall back to prop
  const effectiveProposalId = urlProposalId
    ? Number(urlProposalId)
    : proposalId;

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchemas.createWorkOrderFormSchema) as any,
    defaultValues: {
      code: "",
      title: "",
      start_date: "",
      end_date: "",
      handing_over_date: "",
      agreement_number: "",
      metric_ton: "",
      metric_ton_rate: "",
      description: "",
      budget_amount: "",
      expense_amount: "0",
      status: "pending",
      technology_used: "",
      office_id: "",
      site_ids: [],
      activity_type: "",
      document_key: "",
      client_id: clientId ? String(clientId) : "",
      proposal_id: effectiveProposalId || undefined,
    },
  });

  const steps = [
    {
      number: 1,
      title: "Basic Details",
      isActive: step === 1,
      isCompleted: step > 1,
    },
    { number: 2, title: "Sites", isActive: step === 2, isCompleted: step > 2 },
  ];

  // Get offices for selection
  const getOffices = trpc.officeQuery.getOffices.useQuery({
    status: "active",
  });

  // Get technologies
  const getTechnologies = trpc.technologyQuery.getTechnologies.useQuery({
    status: "active",
  });

  const technologiesData = getTechnologies?.data?.technologies || [];
  const isGetTechnologiesLoading = getTechnologies.isLoading;

  // Watch technology_used to fetch activity types
  const selectedTechnologyId = form.watch("technology_used");

  // Get activity types for selected technology
  const getActivityTypes =
    trpc.technologyQuery.getActivityTypesByTechnology.useQuery(
      { technology_id: Number(selectedTechnologyId) },
      { enabled: !!selectedTechnologyId && selectedTechnologyId !== "" },
    );

  const activityTypesData = getActivityTypes?.data?.activityTypes || [];
  const isGetActivityTypesLoading = getActivityTypes.isLoading;

  const officesData = getOffices?.data?.offices || [];
  const isGetOfficesLoading = getOffices.isLoading;

  const handleDialogClose = useCallback(
    (open?: boolean) => {
      if (open) return; // If trying to open, do nothing
      if (isUploading) {
        toast.error("Please wait for the document to finish uploading.");
        return;
      }
      cleanupFile();
      deleteParams(["mode", "proposal-id"]);

      // Delay form reset until after animation completes
      setTimeout(() => {
        form.reset();
        setStep(1);
        uploadedFileId.current = null;
      }, 500);
    },
    [isUploading, cleanupFile, deleteParams, form],
  );

  // Separate function for step components that doesn't take parameters
  const closeDialog = () => {
    handleDialogClose(false);
  };

  const createWorkOrder = trpc.workOrderMutation.createWorkOrder.useMutation({
    onSuccess: () => {
      toast.success("Work order created successfully!");
      // Clear the ref so we don't delete the file on close
      uploadedFileId.current = null;
      // Invalidate and refetch work order queries
      utils.workOrderQuery.getWorkOrdersByClient.invalidate({
        client_id: clientId,
      });
      utils.clientQuery.getClientStats.invalidate({ id: clientId });
      utils.proposalQuery.getProposalsByClient.invalidate({
        client_id: clientId,
      });
      handleDialogClose();
    },
    onError: (error) => {
      cleanupFile();
      handleError(error, { showToast: true });
    },
  });

  const selectedOfficeId = form.watch("office_id");
  const selectedOfficeIdString = selectedOfficeId
    ? String(selectedOfficeId)
    : "";

  // Get sites for selected office
  const getSites = trpc.siteQuery.getSitesByOfficeId.useQuery(
    { office_id: Number(selectedOfficeId) },
    { enabled: !!selectedOfficeId && selectedOfficeId !== "" },
  );

  const sitesData = getSites?.data;
  const isGetSitesLoading = getSites.isLoading;

  const onSubmit = async (values: WorkOrderFormValues) => {
    // setAttemptedSubmit(false);
    console.log("✅ Form validation passed!");
    console.log("Form values:", values);
    console.log(
      "Site IDs type:",
      typeof values.site_ids,
      "Is Array:",
      Array.isArray(values.site_ids),
    );
    console.log("Site IDs:", values.site_ids);

    // Transform form data to API format
    const workOrderData: any = {
      activity_type: values.activity_type,
      code: values.code,
      title: values.title,
      office_id: values.office_id,
      proposal_id: Number(effectiveProposalId),

      // Client ID from URL params
      client_id: String(clientId),
      description: values.description,

      // Dates
      start_date: values.start_date,
      end_date: values.end_date,
      handing_over_date: values.handing_over_date,
      document_key: values.document_key,

      // Agreement
      agreement_number: values.agreement_number.toString(),

      // Metrics
      metric_ton: values.metric_ton ? values.metric_ton.toString() : undefined,
      metric_ton_rate: values.metric_ton_rate
        ? values.metric_ton_rate.toString()
        : undefined,

      budget_amount: values.budget_amount.toString(),
      expense_amount: values.expense_amount.toString(),
      status: values.status,
      technology_used: values.technology_used.toString(),
      // Budget and description

      // Sites
      site_ids: values.site_ids?.map((id: number) => Number(id)),

      // // Work order sites with activity type
      // workOrderSites: values.site_ids?.map((siteId: number) => ({
      //   site_id: Number(siteId),
      //   start_date: values.start_date,
      //   end_date: values.end_date,
      //   activity_type: values.activity_type,
      // })),
    };

    console.log("Submitting work order:", workOrderData);
    await createWorkOrder.mutateAsync(workOrderData);
  };

  // Clear site_ids when office changes
  useEffect(() => {
    if (
      selectedOfficeId &&
      String(selectedOfficeId) !== prevOfficeIdRef.current
    ) {
      console.log(
        "Office changed from",
        prevOfficeIdRef.current,
        "to",
        selectedOfficeId,
      );
      form.setValue("site_ids", [], { shouldValidate: false });
      prevOfficeIdRef.current = String(selectedOfficeId);
    }
  }, [selectedOfficeId, form]);

  return (
    <DialogWindow
      title='Create Work Order'
      description='Set up a new work order with detailed information and site assignments'
      open={isOpenDialog}
      setOpen={handleDialogClose}
      size='xl'>
      <div className='space-y-6'>
        <Form {...form}>
          <CustomForm
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.error("❌ Form validation failed:", errors);
              toast.error(
                "Please check the form for errors. Missing fields: " +
                  Object.keys(errors).join(", "),
              );
            })}>
            {/* Enhanced Stepper */}
            <Card className='border-0 shadow-none py-0'>
              <CardContent className='p-0 bg-transparent pl-2 mb-2'>
                <div className='flex items-center gap-3'>
                  {steps.map((stepItem, index) => (
                    <React.Fragment key={stepItem.number}>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`flex size-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                            stepItem.isCompleted
                              ? "bg-emerald-500 text-white"
                              : stepItem.isActive
                                ? "bg-sky-700 text-white"
                                : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          }`}>
                          {stepItem.isCompleted ? (
                            <Check className='size-4' />
                          ) : (
                            stepItem.number
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            stepItem.isCompleted
                              ? "text-emerald-600 dark:text-emerald-400"
                              : stepItem.isActive
                                ? "text-sky-700 dark:text-sky-400"
                                : "text-gray-500 dark:text-gray-400"
                          }`}>
                          {stepItem.title}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`h-px w-8 ${
                            stepItem.isCompleted
                              ? "bg-emerald-400"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step Content */}
            <div className='space-y-6'>
              {step === 1 && (
                <CreateWOStep1Basic
                  technologiesData={technologiesData}
                  isGetTechnologiesLoading={isGetTechnologiesLoading}
                  activityTypesData={activityTypesData}
                  isGetActivityTypesLoading={isGetActivityTypesLoading}
                  selectedTechnologyId={selectedTechnologyId || ""}
                  setStep={setStep}
                  closeDialog={closeDialog}
                  isUploading={isUploading}
                  setIsUploading={setIsUploading}
                  uploadedFileId={uploadedFileId}
                />
              )}

              {step === 2 && (
                <CreateWOStep2Sites
                  officesData={officesData}
                  isGetOfficesLoading={isGetOfficesLoading}
                  sitesData={sitesData}
                  isGetSitesLoading={isGetSitesLoading}
                  selectedOfficeId={selectedOfficeIdString}
                  setStep={setStep}
                  closeDialog={closeDialog}
                  isSubmitting={createWorkOrder.isPending}
                />
              )}
            </div>
          </CustomForm>
        </Form>
      </div>
    </DialogWindow>
  );
};

export default CreateWODialog;
