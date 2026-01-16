import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CreateWOSiteCard from "../CreateWOSiteCard";
import {
  Building2,
  MapPin,
  Building,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import CustomButton from "@/components/CustomButton";
import { Button } from "@/components/ui/button";
import CustomInput from "@/components/CustomInput";

interface Office {
  id: number;
  name: string;
  city?: string;
  state?: string;
}

interface Site {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  office_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Fields to validate in Step 2
export const STEP2_FIELDS = ["office_id", "site_ids"] as const;

interface Props {
  officesData: Office[];
  isGetOfficesLoading: boolean;
  sitesData: Site[] | undefined;
  isGetSitesLoading: boolean;
  selectedOfficeId: string;
  setStep: (step: number) => void;
  closeDialog: () => void;
  isSubmitting: boolean;
}

const CreateWOStep2Sites = ({
  officesData,
  isGetOfficesLoading,
  sitesData,
  isGetSitesLoading,
  selectedOfficeId,
  setStep,
  closeDialog,
  isSubmitting,
}: Props) => {
  const {
    control,
    trigger,
    formState: { errors },
  } = useFormContext();
  const officeOptions = officesData.map((office) => ({
    label: `${office.name}${
      office.city || office.state
        ? ` (${[office.city, office.state].filter(Boolean).join(", ")})`
        : ""
    }`,
    value: office.id.toString(),
  }));

  return (
    <Card className='border-0 shadow drop-shadow bg-gray-50'>
      <CardHeader className='pb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-3 rounded-lg bg-green-100 dark:bg-green-900/30'>
            <MapPin className='h-6 w-6 text-green-600 dark:text-green-400' />
          </div>
          <div>
            <h3 className='text-lg font-semibold'>Site Assignment</h3>
            <p className='text-sm text-muted-foreground'>
              Select an office and assign sites to this work order
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {/* Office Selection */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2 mb-4'>
              <div className='p-2 rounded-lg bg-blue-100'>
                <Building className='h-4 w-4 text-blue-600' />
              </div>
              <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                Select Office
              </h4>
            </div>

            <CustomInput
              control={control}
              fieldName='office_id'
              Label='Office *'
              description='Select the office where this work order will be managed'
              isSelect
              selectOptions={officeOptions}
              placeholder={
                isGetOfficesLoading ? "Loading offices..." : "Select an office"
              }
              disabled={isGetOfficesLoading}
            />
          </div>

          {/* Site Selection - Only show if office is selected */}
          {selectedOfficeId && (
            <>
              {/* Site Selection */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 mb-4'>
                  <div className='p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30'>
                    <Building2 className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                  </div>
                  <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                    Select Sites
                  </h4>
                </div>

                <FormField
                  control={control}
                  name='site_ids'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Sites *</FormLabel>
                      <FormDescription>
                        Choose one or more sites to assign to this work order
                      </FormDescription>
                      <FormControl>
                        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                          {isGetSitesLoading ? (
                            <div className='col-span-2 p-8 text-center text-sm text-muted-foreground'>
                              <Loader2 className='h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground/50' />
                              Loading sites...
                            </div>
                          ) : sitesData && sitesData.length > 0 ? (
                            sitesData.map((s) => {
                              const id = s.id;
                              const selected = (
                                (field.value ?? []) as number[]
                              ).includes(id);
                              return (
                                <CreateWOSiteCard
                                  field={field}
                                  id={id}
                                  s={s}
                                  selected={selected}
                                  key={id}
                                />
                              );
                            })
                          ) : (
                            <div className='col-span-2 p-8 text-center text-sm text-muted-foreground bg-white rounded-lg border'>
                              <Building2 className='h-8 w-8 mx-auto mb-2 text-muted-foreground/50' />
                              <p>No sites found for this office.</p>
                              <p className='text-xs mt-1'>
                                Please select a different office or create sites
                                in the office management section.
                              </p>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                      {field.value && field.value.length > 0 && (
                        <div className='mt-2'>
                          <Badge
                            variant='secondary'
                            className='bg-green-100 text-green-700'>
                            {field.value.length} site
                            {field.value.length !== 1 ? "s" : ""} selected
                          </Badge>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          {/* Show message if no office is selected */}
          {!selectedOfficeId && (
            <div className='p-8 text-center text-sm text-muted-foreground bg-white rounded-lg border border-dashed'>
              <Building className='h-8 w-8 mx-auto mb-2 text-muted-foreground/50' />
              <p>Please select an office first to view available sites.</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className='flex items-center justify-end gap-3 pt-4 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={closeDialog}
              className='px-6'
              disabled={isSubmitting}>
              Cancel
            </Button>
            <CustomButton
              type='button'
              text='Back to Details'
              variant='secondary'
              onClick={() => setStep(1)}
              Icon={ArrowLeft}
              disabled={isSubmitting}
            />
            <CustomButton
              type='submit'
              text={isSubmitting ? "Creating..." : "Create Work Order"}
              variant='primary'
              Icon={isSubmitting ? Loader2 : CheckCircle2}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateWOStep2Sites;
