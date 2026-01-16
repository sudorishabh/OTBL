import React, { useEffect, RefObject } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Layers, Loader2, ArrowRight } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import { Button } from "@/components/ui/button";
import CustomInput from "@/components/CustomInput";
import CustomUploadDocument from "@/components/CustomUploadDocument";

interface Technology {
  id: number;
  name: string;
  description?: string;
  status: string;
}

interface ActivityType {
  id: number;
  technology_id: number;
  name: string;
}

// Fields to validate in Step 1
export const STEP1_FIELDS = [
  "code",
  "title",
  "start_date",
  "end_date",
  "handing_over_date",
  "agreement_number",
  "description",
  "budget_amount",
  "metric_ton",
  "metric_ton_rate",
  "technology_used",
  "activity_type",
] as const;

interface Props {
  technologiesData: Technology[];
  isGetTechnologiesLoading: boolean;
  activityTypesData: ActivityType[];
  isGetActivityTypesLoading: boolean;
  selectedTechnologyId: string;
  setStep: (step: number) => void;
  closeDialog: () => void;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  uploadedFileId: RefObject<string | null>;
}

const CreateWOStep1Basic = ({
  technologiesData,
  isGetTechnologiesLoading,
  activityTypesData,
  isGetActivityTypesLoading,
  selectedTechnologyId,
  setStep,
  closeDialog,
  isUploading,
  setIsUploading,
  uploadedFileId,
}: Props) => {
  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext();

  // Watch budget_amount and metric_ton for automatic calculation
  const budgetAmount = watch("budget_amount");
  const metricTon = watch("metric_ton");

  // Calculate metric_ton_rate automatically
  useEffect(() => {
    const budget = parseFloat(budgetAmount);
    const ton = parseFloat(metricTon);

    if (!isNaN(budget) && !isNaN(ton) && ton > 0) {
      const rate = budget / ton;
      setValue("metric_ton_rate", rate.toFixed(2));
    } else if (isNaN(budget) || isNaN(ton) || ton === 0) {
      setValue("metric_ton_rate", "");
    }
  }, [budgetAmount, metricTon, setValue]);

  // Reset activity_type when technology changes
  useEffect(() => {
    if (selectedTechnologyId) {
      setValue("activity_type", "");
    }
  }, [selectedTechnologyId, setValue]);

  const technologyOptions = technologiesData.map((tech) => ({
    label: tech.name,
    value: tech.id.toString(),
  }));

  const activityTypeOptions = activityTypesData.map((actType) => ({
    label: actType.name,
    value: actType.name,
  }));

  return (
    <Card className='border-0 drop-shadow shadow-0 bg-gray-50'>
      <CardHeader className='pb-4'>
        <div className='flex items-center gap-3'>
          <div>
            <h3 className='text-lg font-semibold'>Work Order Basic Details</h3>
            <p className='text-sm text-muted-foreground'>
              Provide essential information about the work order
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className='space-y-4'>
          {/* Row 1: Code and Title */}
          <CustomInput
            control={control}
            fieldName='title'
            Label='Title'
            placeholder='Brief work order title'
          />
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <CustomInput
              control={control}
              fieldName='code'
              Label='Work Order Code'
              placeholder='WO-1001'
            />
            <CustomInput
              control={control}
              fieldName='agreement_number'
              Label='Agreement Number'
              placeholder='AG-2024-001'
            />
            <CustomInput
              control={control}
              fieldName='technology_used'
              Label='Technology Used'
              isSelect
              selectOptions={technologyOptions}
              placeholder={
                isGetTechnologiesLoading
                  ? "Loading technologies..."
                  : "Select technology"
              }
              disabled={isGetTechnologiesLoading}
            />
          </div>

          {/* Activity Type - Only show if technology is selected */}
          {selectedTechnologyId && (
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <div className='p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30'>
                  <Layers className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                </div>
                <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Activity Type
                </h4>
              </div>

              <CustomInput
                control={control}
                fieldName='activity_type'
                Label='Select Activity Type'
                isSelect
                selectOptions={activityTypeOptions}
                placeholder={
                  isGetActivityTypesLoading
                    ? "Loading activity types..."
                    : activityTypesData.length === 0
                      ? "No activity types available"
                      : "Select activity type"
                }
                disabled={isGetActivityTypesLoading}
              />
            </div>
          )}

          {/* Dates */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <CustomInput
              control={control}
              fieldName='start_date'
              Label='Start Date'
              isDate
            />
            <CustomInput
              control={control}
              fieldName='end_date'
              Label='End Date'
              isDate
            />
            <CustomInput
              control={control}
              fieldName='handing_over_date'
              Label='Handing Over Date'
              isDate
            />
          </div>

          {/* Row 4: Budget and Metric Ton */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <CustomInput
              control={control}
              fieldName='budget_amount'
              Label='Budget Amount'
              type='number'
              placeholder='0.00'
            />
            <CustomInput
              control={control}
              fieldName='metric_ton'
              Label='Metric Ton'
              type='number'
              placeholder='0.00'
            />
            {/* Metric Ton Rate (Auto-calculated) */}
            <div className='space-y-2'>
              <FormLabel>Metric Ton Rate</FormLabel>
              <div className='flex items-center h-10 px-3 rounded-md border bg-gray-100 text-sm'>
                {watch("metric_ton_rate") ? (
                  <span className='font-medium'>
                    ₹
                    {parseFloat(watch("metric_ton_rate")).toLocaleString(
                      "en-IN",
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}{" "}
                    / MT
                  </span>
                ) : (
                  <span className='text-muted-foreground'>—</span>
                )}
              </div>
            </div>
          </div>

          {/* Hidden field to maintain form state */}
          <FormField
            control={control}
            name='metric_ton_rate'
            render={({ field }) => (
              <input
                type='hidden'
                {...field}
                value={field.value ?? ""}
              />
            )}
          />

          {/* Row 6: Description */}
          <CustomInput
            control={control}
            fieldName='description'
            Label='Description'
            isTextArea
            placeholder='Describe the work order in detail...'
          />

          {/* Document Upload */}
          <FormField
            control={control}
            name='document_key'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomUploadDocument
                    label='Work Order Document (Optional)'
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

          {/* Navigation Buttons */}
          <div className='flex items-center justify-end gap-3 pt-4 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={closeDialog}
              className='px-6'>
              Cancel
            </Button>
            <CustomButton
              type='button'
              text='Continue to Sites'
              variant='primary'
              onClick={async () => {
                const isValid = await trigger([...STEP1_FIELDS]);
                if (isValid) setStep(2);
              }}
              Icon={ArrowRight}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateWOStep1Basic;
