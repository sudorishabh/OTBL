import DialogWindow from "@/components/DialogWindow";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import CreateWOStep1 from "./Steps/CreateWOStep1";
import CreateWOStep2 from "./Steps/CreateWOStep2";
import CreateWOStep3 from "./Steps/CreateWOStep3";
import CreateWOStepper from "./CreateWOStepper";
import { workOrderFormSchema } from "@/app/office/_schemas";
import CustomForm from "@/components/CustomForm";
import {
  MapPin,
  IndianRupee,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import CreateWOFooter from "./CreateWOFooter";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>;

const CreateWODialog = ({ open, setOpen }: Props) => {
  const [step, setStep] = useState<number>(1);
  const getSites = trpc.siteQuery.getSites.useQuery();

  const sitesData = getSites?.data;
  const isGetSitesLoading = getSites.isLoading;

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema) as any,
    defaultValues: {
      code: "",
      title: "",
      date: "",
      description: "",
      budget_amount: "",
      expense_amount: "0",
      status: "pending",
      siteMode: "existing",
      site_ids: [],
      newSites: undefined,
      selectedSiteBudgets: [],
      newSiteBudgets: [],
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
    console.log(values);
    // Submit will be wired when backend mutation exists
    // setOpen(false);
  };

  const siteMode = form.watch("siteMode");

  // Clear opposite fields when switching modes
  useEffect(() => {
    if (siteMode === "existing") {
      form.setValue("newSites", undefined, { shouldValidate: false });
      form.setValue("newSiteBudgets", [], { shouldValidate: false });
    } else if (siteMode === "new") {
      form.setValue("site_ids", undefined as unknown as string[], {
        shouldValidate: false,
      });
      form.setValue("selectedSiteBudgets", [], { shouldValidate: false });
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
              {step === 1 && <CreateWOStep1 form={form} />}

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

              {step === 3 && (
                <CreateWOStep3
                  form={form}
                  siteMode={siteMode}
                  sitesData={sitesData}
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
