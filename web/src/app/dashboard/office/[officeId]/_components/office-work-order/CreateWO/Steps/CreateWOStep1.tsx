import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
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
  MapPin,
  Building2,
  Plus,
} from "lucide-react";

interface Props {
  form: any;
}
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const CreateWOStep1 = ({ form }: Props) => {
  return (
    <Card className='border-0 drop-shadow shadow-0 bg-gray-50'>
      <CardHeader className='pb-4'>
        <div className='flex items-center gap-3'>
          <div>
            <h3 className='text-lg font-semibold'>Work Order Details</h3>
            <p className='text-sm text-muted-foreground'>
              Provide basic information about the work order
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

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-start'>
              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <CalendarIcon className='h-4 w-4' />
                      Date
                    </FormLabel>
                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='outline'
                            className='w-full justify-start text-left font-normal transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 focus:ring-2 focus:ring-blue-500'>
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

          {/* Site Mode Selection */}
          <div className='space-y-8'>
            <div className='flex items-center gap-2 mb-8'>
              <div className='p-2 rounded-lg bg-green-100'>
                <MapPin className='h-4 w-4 text-green-600' />
              </div>
              <h4 className='text-sm font-semibold text-gray-700'>
                Site Assignment
              </h4>
            </div>

            <FormField
              control={form.control}
              name='siteMode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose Site Mode</FormLabel>
                  <FormDescription>
                    Select how you want to assign sites to this work order
                  </FormDescription>
                  <FormControl>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                      <Card
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          field.value === "existing"
                            ? "ring-2 ring-emerald-500 bg-emerald-50"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => field.onChange("existing")}>
                        <CardContent className='px-4'>
                          <div className='flex items-start gap-3'>
                            <div
                              className={`p-2 rounded-lg ${
                                field.value === "existing"
                                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                                  : "bg-gray-100 dark:bg-gray-800"
                              }`}>
                              <Building2
                                className={`h-5 w-5 ${
                                  field.value === "existing"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-gray-500"
                                }`}
                              />
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h4 className='font-semibold'>
                                  Existing Sites
                                </h4>
                                {field.value === "existing" && (
                                  <Badge
                                    variant='secondary'
                                    className='bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'>
                                    Selected
                                  </Badge>
                                )}
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                Link this work order to sites that already exist
                                in your system
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          field.value === "new"
                            ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => field.onChange("new")}>
                        <CardContent className='px-4'>
                          <div className='flex items-start gap-3'>
                            <div
                              className={`p-2 rounded-lg ${
                                field.value === "new"
                                  ? "bg-green-100 dark:bg-green-900/30"
                                  : "bg-gray-100 dark:bg-gray-800"
                              }`}>
                              <Plus
                                className={`h-5 w-5 ${
                                  field.value === "new"
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-gray-500"
                                }`}
                              />
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h4 className='font-semibold'>
                                  Create New Sites
                                </h4>
                                {field.value === "new" && (
                                  <Badge
                                    variant='secondary'
                                    className='bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                                    Selected
                                  </Badge>
                                )}
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                Create new sites on the fly and assign them to
                                this work order
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
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

export default CreateWOStep1;
