"use client";
import React from "react";
import { UseFormReturn, FieldArrayWithId } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CustomButton from "@/components/CustomButton";
import { workOrderTypes } from "@pkg/schema";
import { constants } from "@pkg/utils";
import { Plus, Trash2 } from "lucide-react";
import { useFormContext, useFieldArray } from "react-hook-form";

const {
  WO_ACTIVITIES,
  unitOptions,
  GST_PERCENTAGE,
  WO_UNITS,
  WO_PROCESS,
  allActivityOptions,
} = constants;

interface Step2ScheduleOfRatesProps {
  // calculateRates: (index: number) => void;
  // filteredActivityOptions: Array<{ value: string; label: string }>;
  onBack: () => void;
  isLoading: boolean;
}

const Step2ScheduleOfRates: React.FC<Step2ScheduleOfRatesProps> = ({
  // calculateRates,
  // filteredActivityOptions,
  onBack,
  isLoading,
}) => {
  const form = useFormContext<workOrderTypes.BaseWorkOrderInput>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedule_of_rates",
  });

  const addScheduleOfRate = () => {
    append({
      activity: "cleaning_up_soil_area" as const,
      unit: WO_UNITS.MT,
      estimated_quantity: 0,
      rc_unit_rate: 0,
      gst_percentage: GST_PERCENTAGE,
      unit_rate_inclusive_gst: 0,
      total_cost: 0,
      transportation_km: 0,
    });
  };

  const calculateRates = (index: number) => {
    const values = form.getValues(`schedule_of_rates.${index}`);
    const rcRate = values.rc_unit_rate || 0;
    const quantity = values.estimated_quantity || 0;

    // Fixed 18% GST
    const unitRateInclusiveGst = Number(rcRate) * (1 + GST_PERCENTAGE / 100);
    const totalCost = Number(unitRateInclusiveGst) * Number(quantity);

    form.setValue(
      `schedule_of_rates.${index}.unit_rate_inclusive_gst`,
      Number(unitRateInclusiveGst.toFixed(2)),
    );
    form.setValue(
      `schedule_of_rates.${index}.total_cost`,
      Number(totalCost.toFixed(2)),
    );
  };

  const selectedProcessType = form.watch("process_type");

  const getFilteredActivityOptions = () => {
    if (selectedProcessType === WO_PROCESS.BIOREMEDIATION) {
      // Only show bioremediation activity
      return allActivityOptions.filter((option) => option.isBioremediation);
    } else if (selectedProcessType === WO_PROCESS.RESTORATION) {
      // Show all except bioremediation
      return allActivityOptions.filter((option) => !option.isBioremediation);
    } else {
      // Show all activities for "both" or undefined
      return allActivityOptions;
    }
  };

  const filteredActivityOptions = getFilteredActivityOptions();

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>Schedule of Rates</h3>
          <p className='text-sm text-gray-500'>
            GST is fixed at 18%. Rate + GST and Total Cost are calculated
            automatically.
          </p>
        </div>
        <CustomButton
          type='button'
          Icon={Plus}
          text='Add Activity'
          variant='outline'
          onClick={addScheduleOfRate}
        />
      </div>

      {fields.length === 0 ? (
        <div className='text-center py-8 text-gray-500 border rounded-lg border-dashed'>
          <p className='mb-2'>No activities added yet.</p>
          <CustomButton
            type='button'
            Icon={Plus}
            text='Add Your First Activity'
            variant='outline'
            onClick={addScheduleOfRate}
          />
        </div>
      ) : (
        <div className='border rounded-lg overflow-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50'>
                <TableHead className='min-w-[200px]'>Activity *</TableHead>
                <TableHead className='min-w-20'>Unit *</TableHead>
                <TableHead className='min-w-[100px]'>Est. Qty *</TableHead>
                <TableHead className='min-w-[100px]'>RC Rate *</TableHead>
                <TableHead className='min-w-[120px]'>
                  Rate + GST (18%)
                </TableHead>
                <TableHead className='min-w-[120px]'>Total Cost</TableHead>
                {fields.some(
                  (_, i) =>
                    form.watch(`schedule_of_rates.${i}.activity`) ===
                    WO_ACTIVITIES.TRANSPORTATION_CONTAMINATED_SOIL,
                ) && (
                  <TableHead className='min-w-[100px]'>Trans. KM *</TableHead>
                )}
                <TableHead className='w-[50px]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`schedule_of_rates.${index}.activity`}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}>
                          <SelectTrigger className='min-w-[180px]'>
                            <SelectValue placeholder='Select activity' />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredActivityOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`schedule_of_rates.${index}.unit`}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}>
                          <SelectTrigger className='w-28'>
                            <SelectValue placeholder='Select unit' />
                          </SelectTrigger>
                          <SelectContent>
                            {unitOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`schedule_of_rates.${index}.estimated_quantity`}
                      render={({ field }) => (
                        <Input
                          type='number'
                          step='0.01'
                          min='0'
                          {...field}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            setTimeout(() => calculateRates(index), 0);
                          }}
                          className='w-24'
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`schedule_of_rates.${index}.rc_unit_rate`}
                      render={({ field }) => (
                        <Input
                          type='number'
                          step='0.01'
                          min='0'
                          {...field}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            setTimeout(() => calculateRates(index), 0);
                          }}
                          className='w-24'
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`schedule_of_rates.${index}.unit_rate_inclusive_gst`}
                      render={({ field }) => (
                        <Input
                          type='number'
                          step='0.01'
                          value={field.value || 0}
                          readOnly
                          className='w-28 bg-gray-100 text-gray-600'
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`schedule_of_rates.${index}.total_cost`}
                      render={({ field }) => (
                        <Input
                          type='number'
                          step='0.01'
                          value={field.value || 0}
                          readOnly
                          className='w-28 bg-gray-100 text-gray-600 font-medium'
                        />
                      )}
                    />
                  </TableCell>
                  {form.watch(`schedule_of_rates.${index}.activity`) ===
                    WO_ACTIVITIES.TRANSPORTATION_CONTAMINATED_SOIL && (
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`schedule_of_rates.${index}.transportation_km`}
                        render={({ field }) => (
                          <Input
                            type='number'
                            step='0.01'
                            min='0'
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            className='w-24'
                          />
                        )}
                      />
                    </TableCell>
                  )}
                  {fields.some(
                    (_, i) =>
                      form.watch(`schedule_of_rates.${i}.activity`) ===
                      WO_ACTIVITIES.TRANSPORTATION_CONTAMINATED_SOIL,
                  ) &&
                    form.watch(`schedule_of_rates.${index}.activity`) !==
                      WO_ACTIVITIES.TRANSPORTATION_CONTAMINATED_SOIL && (
                      <TableCell></TableCell>
                    )}
                  <TableCell>
                    <CustomButton
                      type='button'
                      Icon={Trash2}
                      variant='outline'
                      className='text-red-500 hover:text-red-700 hover:bg-red-50 p-2'
                      onClick={() => remove(index)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {form.formState.errors.schedule_of_rates && (
        <p className='text-sm text-red-500'>
          {form.formState.errors.schedule_of_rates.message ||
            "At least one schedule of rate entry is required"}
        </p>
      )}

      {/* Action Buttons */}
      <div className='flex gap-3 pt-4'>
        <CustomButton
          type='button'
          text='Back'
          variant='outline'
          className='flex-1'
          onClick={onBack}
          disabled={isLoading}
        />
        <CustomButton
          type='submit'
          text='Create Work Order'
          className='flex-1'
          variant='primary'
          loading={isLoading}
          disabled={isLoading || fields.length === 0}
        />
      </div>
    </div>
  );
};

export default Step2ScheduleOfRates;
