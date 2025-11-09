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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Hash,
  FileText,
  Calendar as CalendarIcon,
  IndianRupee,
  FileCheck,
  Link as LinkIcon,
  Weight,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Props {
  form: any;
}

const CreateWOStep1Basic = ({ form }: Props) => {
  return (
    <Card className='border-0 drop-shadow shadow-0 bg-gray-50'>
      <CardHeader className='pb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-3 rounded-lg bg-emerald-100'>
            <FileText className='h-6 w-6 text-emerald-600' />
          </div>
          <div>
            <h3 className='text-lg font-semibold'>Work Order Basic Details</h3>
            <p className='text-sm text-muted-foreground'>
              Provide essential information about the work order
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {/* Basic Information Section */}
          <div className='space-y-8'>
            <div className='flex items-center gap-2 mb-8'>
              <div className='p-2 rounded-lg bg-emerald-100'>
                <FileText className='h-4 w-4 text-emerald-600 ' />
              </div>
              <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                Basic Information
              </h4>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-start'>
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <Hash className='h-4 w-4' />
                      Work Order Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        className='bg-white'
                        placeholder='WO-1001'
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
                    <FormLabel className='flex items-center gap-2'>
                      <FileText className='h-4 w-4' />
                      Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Brief work order title'
                        className='bg-white'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Agreement & Dates Section */}
          <div className='space-y-8'>
            <div className='flex items-center gap-2 mb-8'>
              <div className='p-2 rounded-lg bg-orange-100'>
                <FileCheck className='h-4 w-4 text-orange-600' />
              </div>
              <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                Agreement & Timeline
              </h4>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='agreement_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <FileCheck className='h-4 w-4' />
                      Agreement Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='AG-2024-001'
                        className='bg-white'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='agreement_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <LinkIcon className='h-4 w-4' />
                      Agreement URL (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://...'
                        className='bg-white'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='start_date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <CalendarIcon className='h-4 w-4' />
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='outline'
                            className='w-full justify-start text-left font-normal bg-white'>
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {field.value ? field.value : "Pick a date"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='p-0'>
                          <div className='p-2'>
                            <Calendar
                              mode='single'
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                if (!date) return field.onChange("");
                                const yyyy = date.getFullYear();
                                const mm = String(date.getMonth() + 1).padStart(
                                  2,
                                  "0"
                                );
                                const dd = String(date.getDate()).padStart(
                                  2,
                                  "0"
                                );
                                field.onChange(`${yyyy}-${mm}-${dd}`);
                              }}
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='end_date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <CalendarIcon className='h-4 w-4' />
                      End Date
                    </FormLabel>
                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='outline'
                            className='w-full justify-start text-left font-normal bg-white'>
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {field.value ? field.value : "Pick a date"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='p-0'>
                          <div className='p-2'>
                            <Calendar
                              mode='single'
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                if (!date) return field.onChange("");
                                const yyyy = date.getFullYear();
                                const mm = String(date.getMonth() + 1).padStart(
                                  2,
                                  "0"
                                );
                                const dd = String(date.getDate()).padStart(
                                  2,
                                  "0"
                                );
                                field.onChange(`${yyyy}-${mm}-${dd}`);
                              }}
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='handing_over_date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <CalendarIcon className='h-4 w-4' />
                      Handing Over Date
                    </FormLabel>
                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='outline'
                            className='w-full justify-start text-left font-normal bg-white'>
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {field.value ? field.value : "Pick a date"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='p-0'>
                          <div className='p-2'>
                            <Calendar
                              mode='single'
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                if (!date) return field.onChange("");
                                const yyyy = date.getFullYear();
                                const mm = String(date.getMonth() + 1).padStart(
                                  2,
                                  "0"
                                );
                                const dd = String(date.getDate()).padStart(
                                  2,
                                  "0"
                                );
                                field.onChange(`${yyyy}-${mm}-${dd}`);
                              }}
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Budget & Metrics Section */}
          <div className='space-y-8'>
            <div className='flex items-center gap-2 mb-8'>
              <div className='p-2 rounded-lg bg-emerald-100'>
                <IndianRupee className='h-4 w-4 text-emerald-600' />
              </div>
              <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                Budget & Metrics
              </h4>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='budget_amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <IndianRupee className='h-4 w-4' />
                      Budget Amount
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        className='bg-white'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='metric_ton'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <Weight className='h-4 w-4' />
                      Metric Ton (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        className='bg-white'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='metric_ton_rate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <IndianRupee className='h-4 w-4' />
                      Metric Ton Rate (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        className='bg-white'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2'>
                    <FileText className='h-4 w-4' />
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder='Describe the work order in detail...'
                      className='bg-white'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateWOStep1Basic;
