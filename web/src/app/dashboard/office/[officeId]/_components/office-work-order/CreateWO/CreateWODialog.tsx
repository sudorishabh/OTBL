import DialogWindow from "@/components/DialogWindow";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import CreateWOStep1 from "./Steps/CreateWOStep1New";
import CreateWOStep2 from "./Steps/CreateWOStep2";
import CreateWOStepper from "./CreateWOStepper";
import CustomForm from "@/components/CustomForm";
import {
  MapPin,
  IndianRupee,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import CreateWOFooter from "./CreateWOFooter";
import { workOrderFormSchema } from "@/app/dashboard/office/_components/AddOfficeDialog";
import { useParams } from "next/navigation";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>;

const CreateWODialog = ({ open, setOpen }: Props) => {
  const [step, setStep] = useState<number>(1);
  const params = useParams();
  const officeId = params?.officeId ? Number(params.officeId) : 0;

  const utils = trpc.useUtils();
  const getSites = trpc.siteQuery.getSites.useQuery();
  const getClients = trpc.clientQuery.getClients.useQuery();
  const createWorkOrder = trpc.workOrderMutation.createWorkOrder.useMutation({
    onSuccess: () => {
      alert("Work order created successfully!");
      // Invalidate and refetch work order queries
      utils.officeQuery.getOfficeWorkOrders.invalidate({ id: officeId });
      utils.officeQuery.getOfficeStats.invalidate({ id: officeId });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      alert(`Error creating work order: ${error.message}`);
    },
  });

  const sitesData = getSites?.data;
  const isGetSitesLoading = getSites.isLoading;

  const clientsData = getClients?.data;
  const isGetClientsLoading = getClients.isLoading;

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema) as any,
    defaultValues: {
      code: "",
      title: "",
      clientMode: "existing",
      client_id: undefined,
      newClient: undefined,
      start_date: "",
      end_date: "",
      handing_over_date: "",
      agreement_number: "",
      agreement_url: "",
      metric_ton: "",
      metric_ton_rate: "",
      description: "",
      budget_amount: "",
      expense_amount: "0",
      status: "pending",
      siteMode: "existing",
      site_ids: [],
      newSites: undefined,
      activity_type: undefined,
    },
  });

  const {
    fields: newSiteFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "newSites",
  });

  const onSubmit = (values: WorkOrderFormValues) => {
    console.log("Form values:", values);

    // Transform form data to API format
    const workOrderData: any = {
      code: values.code,
      title: values.title,
      office_id: officeId,

      // Client data
      client_id:
        values.clientMode === "existing" ? Number(values.client_id) : undefined,
      newClient: values.clientMode === "new" ? values.newClient : undefined,

      // Dates
      start_date: values.start_date,
      end_date: values.end_date,
      handing_over_date: values.handing_over_date,

      // Agreement
      agreement_number: values.agreement_number,
      agreement_url: values.agreement_url || undefined,

      // Metrics
      metric_ton: values.metric_ton ? Number(values.metric_ton) : undefined,
      metric_ton_rate: values.metric_ton_rate
        ? Number(values.metric_ton_rate)
        : undefined,

      // Budget and description
      description: values.description,
      budget_amount: Number(values.budget_amount),
      expense_amount: Number(values.expense_amount || 0),
      status: values.status,

      // Sites
      existingSiteIds:
        values.siteMode === "existing"
          ? values.site_ids?.map((id) => Number(id))
          : undefined,
      newSites: values.siteMode === "new" ? values.newSites : undefined,

      // Work order sites with activity type
      workOrderSites:
        values.siteMode === "existing" && values.site_ids
          ? values.site_ids.map((siteId) => ({
              site_id: Number(siteId),
              start_date: values.start_date,
              end_date: values.end_date,
              activity_type: values.activity_type,
            }))
          : values.siteMode === "new" && values.newSites
          ? values.newSites.map((_, index) => ({
              start_date: values.start_date,
              end_date: values.end_date,
              activity_type: values.activity_type,
            }))
          : undefined,
    };

    console.log("Submitting work order:", workOrderData);
    createWorkOrder.mutate(workOrderData);
  };

  const siteMode = form.watch("siteMode");
  const clientMode = form.watch("clientMode");

  // Clear opposite fields when switching client modes
  useEffect(() => {
    if (clientMode === "existing") {
      form.setValue("newClient", undefined, { shouldValidate: false });
    } else if (clientMode === "new") {
      form.setValue("client_id", undefined, { shouldValidate: false });
    }
  }, [clientMode, form]);

  // Clear opposite fields when switching site modes
  useEffect(() => {
    if (siteMode === "existing") {
      form.setValue("newSites", undefined, { shouldValidate: false });
    } else if (siteMode === "new") {
      form.setValue("site_ids", undefined as unknown as string[], {
        shouldValidate: false,
      });
      if (
        !form.getValues("newSites") ||
        form.getValues("newSites")?.length === 0
      ) {
        append({
          name: "",
          address: "",
          state: "",
          city: "",
          pincode: "",
          contact_person: "",
          contact_number: "",
          email: "",
        });
      }
    }
  }, [siteMode, form, append]);

  return (
    <DialogWindow
      title='Create Work Order'
      description='Set up a new work order with detailed information and site assignments'
      open={open}
      setOpen={setOpen}
      size='xl'>
      <div className='space-y-6'>
        <Form {...form}>
          <CustomForm
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-8'>
            {/* Enhanced Stepper */}
            <Card className='border-0 shadow-sm bg-gray-50'>
              <CardContent className='px-6'>
                <CreateWOStepper step={step} />
              </CardContent>
            </Card>

            {/* Step Content */}
            <div className='space-y-6'>
              {step === 1 && (
                <CreateWOStep1
                  form={form}
                  clientsData={clientsData}
                  isGetClientsLoading={isGetClientsLoading}
                  clientMode={clientMode}
                />
              )}

              {step === 2 && (
                <CreateWOStep2
                  form={form}
                  isGetSitesLoading={isGetSitesLoading}
                  siteMode={siteMode}
                  sitesData={sitesData}
                  newSiteFields={newSiteFields}
                  append={append}
                  remove={remove}
                />
              )}
            </div>

            {/* Enhanced Footer */}
            <CreateWOFooter
              closeDialog={() => setOpen(false)}
              form={form}
              step={step}
              setStep={setStep}
            />
          </CustomForm>
        </Form>
      </div>
    </DialogWindow>
  );
};

export default CreateWODialog;
