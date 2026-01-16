import DialogWindow from "@/components/DialogWindow";
import React, { useState, useMemo, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import CustomButton from "@/components/CustomButton";
import CustomForm from "@/components/CustomForm";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Mail,
  Search,
  Building2,
  MapPin,
  Hash,
  Globe,
  Users,
  UserCheck,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import CustomInput from "@/components/CustomInput";
import { officeSchemas, type AddOfficeInput } from "@pkg/trpc/schemas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiError } from "@/hooks/useApiError";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const AddOfficeDialog = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isAddMode = mode === "add";
  const isOpenDialog = isAddMode;

  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(
    null
  );
  const [selectedOperators, setSelectedOperators] = useState<number[]>([]);
  const [managerSearch, setManagerSearch] = useState("");
  const [operatorSearch, setOperatorSearch] = useState("");
  const [managerPage, setManagerPage] = useState(1);
  const [operatorPage, setOperatorPage] = useState(1);
  const [activeStaffTab, setActiveStaffTab] = useState<
    "managers" | "operators"
  >("managers");
  const itemsPerPage = 10;
  const utils = trpc.useUtils();
  const { handleError } = useApiError();

  const form = useForm<AddOfficeInput>({
    resolver: zodResolver(officeSchemas.addOfficeSchema),
    defaultValues: {
      name: "",
      address: "",
      state: "",
      city: "",
      gst_number: "",
      pincode: "",
      email: "",
    },
  });

  // Get managers and operators for office assignment
  const { data: staffData, isLoading: isLoadingStaffData } =
    trpc.userQuery.getManagersAndOperators.useQuery();

  console.log("Staff data fetched for office assignment:", staffData);

  const managers = staffData?.managers;
  const operators = staffData?.operators;

  // Filter and paginate managers
  const filteredManagers = useMemo(() => {
    if (!managers) return [];
    return managers.filter(
      (user: any) =>
        user.name.toLowerCase().includes(managerSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(managerSearch.toLowerCase())
    );
  }, [managers, managerSearch]);

  const paginatedManagers = useMemo(() => {
    return filteredManagers.slice(0, managerPage * itemsPerPage);
  }, [filteredManagers, managerPage]);

  const hasMoreManagers = filteredManagers.length > paginatedManagers.length;

  // Filter and paginate operators
  const filteredOperators = useMemo(() => {
    if (!operators) return [];
    return operators.filter(
      (user: any) =>
        user.name.toLowerCase().includes(operatorSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(operatorSearch.toLowerCase())
    );
  }, [operators, operatorSearch]);

  const paginatedOperators = useMemo(() => {
    return filteredOperators.slice(0, operatorPage * itemsPerPage);
  }, [filteredOperators, operatorPage]);

  const hasMoreOperators = filteredOperators.length > paginatedOperators.length;

  const addOffice = trpc.officeMutation.addOffice.useMutation({
    onSuccess: () => {
      toast.success("Office created successfully");
      utils.officeQuery.getOffices.invalidate();
    },
    onError: (error) => {
      handleError(error, { showToast: true });
    },
  });

  async function onSubmit(values: AddOfficeInput) {
    try {
      await addOffice.mutateAsync({
        ...values,
        manager_id: selectedManagerId || undefined,
        operator_ids:
          selectedOperators.length > 0 ? selectedOperators : undefined,
      });
      handleClose();
    } catch (error) {
      // Error handling is done in mutation's onError
      console.error("Form submission error:", error);
    }
  }

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    const paramsString = params.toString();
    router.push(paramsString ? `?${paramsString}` : window.location.pathname);
    form.reset();
    setSelectedManagerId(null);
    setSelectedOperators([]);
    setManagerSearch("");
    setOperatorSearch("");
    setManagerPage(1);
    setOperatorPage(1);
    setActiveStaffTab("managers");
  }, [searchParams, router, form]);

  const toggleOperator = (userId: number) => {
    if (selectedOperators.includes(userId)) {
      setSelectedOperators(selectedOperators.filter((id) => id !== userId));
    } else {
      setSelectedOperators([...selectedOperators, userId]);
    }
  };

  return (
    <DialogWindow
      open={isOpenDialog}
      setOpen={handleClose}
      isLoading={isLoadingStaffData}
      title='Add Office'
      description='Enter office details and assign staff members'
      size='xl'>
      <Form {...form}>
        <CustomForm onSubmit={form.handleSubmit(onSubmit)}>
          {/* Scrollable content - limits dialog overflow */}
          <div className='max-h-[60vh] overflow-y-auto pr-2 space-y-6'>
            {/* Office Information Section */}
            <div className='space-y-4'>
              <div className='border-b pb-2'>
                <h3 className='text-base font-semibold text-gray-800'>
                  Office Information
                </h3>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <CustomInput
                  control={form.control}
                  fieldName='name'
                  Label='Office Name'
                  LabelIcon={Building2}
                  placeholder='Enter office name'
                />

                <CustomInput
                  control={form.control}
                  fieldName='email'
                  Label='Email'
                  LabelIcon={Mail}
                  type='email'
                  placeholder='Enter email'
                />
              </div>

              <CustomInput
                control={form.control}
                fieldName='address'
                Label='Address'
                LabelIcon={MapPin}
                placeholder='Enter address'
              />

              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <CustomInput
                  control={form.control}
                  fieldName='state'
                  Label='State'
                  LabelIcon={Globe}
                  placeholder='Enter state'
                />
                <CustomInput
                  control={form.control}
                  fieldName='city'
                  Label='City'
                  LabelIcon={Globe}
                  placeholder='Enter city'
                />
                <CustomInput
                  control={form.control}
                  fieldName='pincode'
                  Label='Pincode'
                  LabelIcon={Hash}
                  placeholder='Enter pincode'
                />
                <CustomInput
                  control={form.control}
                  fieldName='gst_number'
                  Label='GST Number'
                  LabelIcon={Hash}
                  placeholder='Enter GST number'
                />
              </div>
            </div>

            {/* Staff Assignment Section */}
            <div className='mt-8 space-y-6'>
              <div className='flex items-center justify-between border-b pb-4'>
                <div className='border-b pb-2'>
                  <h3 className='text-base font-semibold text-gray-800'>
                    Staff Assignment (Optional)
                  </h3>
                </div>
              </div>

              <div className='rounded-xl border bg-white shadow-xs overflow-hidden'>
                <Tabs
                  value={activeStaffTab}
                  onValueChange={(val) =>
                    setActiveStaffTab(val as "managers" | "operators")
                  }
                  className='w-full'>
                  <div className='px-4 pt-4 border-b bg-gray-50'>
                    <div className='flex justify-between items-center flex-1 mb-4'>
                      <CustomInput
                        mode='standalone'
                        placeholder={
                          activeStaffTab === "managers"
                            ? "Search managers..."
                            : "Search operators..."
                        }
                        value={
                          activeStaffTab === "managers"
                            ? managerSearch
                            : operatorSearch
                        }
                        onChange={(value) => {
                          if (activeStaffTab === "managers") {
                            setManagerSearch(value);
                            setManagerPage(1);
                          } else {
                            setOperatorSearch(value);
                            setOperatorPage(1);
                          }
                        }}
                        inputIcon={Search}
                        className='w-[20rem]'
                      />
                      <TabsList className='bg-gray-300/60 h-8!'>
                        <TabsTrigger
                          value='managers'
                          className='text-xs cursor-pointer'>
                          Managers
                        </TabsTrigger>
                        <TabsTrigger
                          value='operators'
                          className='text-xs cursor-pointer'>
                          Operators
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </div>

                  <div className='p-4 space-y-4'>
                    <ScrollArea className='h-72 pr-3 -mr-3'>
                      <TabsContent
                        value='managers'
                        className='mt-0 space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {paginatedManagers.map((user: any) => {
                          const isSelected = selectedManagerId === user.id;
                          return (
                            <div
                              key={user.id}
                              onClick={() =>
                                setSelectedManagerId(
                                  isSelected ? null : user.id
                                )
                              }
                              className={cn(
                                "group flex m-0 items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                                isSelected
                                  ? "border-[#035864] bg-[#035864]/5 ring-[#035864]"
                                  : "border-gray-100 hover:border-[#035864]/30 hover:bg-gray-50/80"
                              )}>
                              <div className='flex items-center gap-3'>
                                <div
                                  className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors shadow-sm",
                                    isSelected
                                      ? "bg-[#035864] text-white"
                                      : "bg-white border text-gray-500 group-hover:border-[#035864]/30 group-hover:text-[#035864]"
                                  )}>
                                  {user.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p
                                    className={cn(
                                      "font-medium text-sm transition-colors",
                                      isSelected
                                        ? "text-[#035864]"
                                        : "text-gray-900"
                                    )}>
                                    {user.name}
                                  </p>
                                  <p className='text-xs text-gray-500 flex items-center gap-1.5 mt-0.5'>
                                    <Mail className='h-3 w-3' />
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                              <div className='flex items-center gap-3'>
                                {isSelected && (
                                  <CheckCircle2 className='h-5 w-5 text-[#035864]' />
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {!isLoadingStaffData &&
                          paginatedManagers.length === 0 && (
                            <div className='flex flex-col items-center justify-center py-10 text-gray-500'>
                              <div className='h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3'>
                                <UserCheck className='h-6 w-6 text-gray-400' />
                              </div>
                              <p className='text-sm font-medium'>
                                No managers found
                              </p>
                              <p className='text-xs text-gray-400 mt-1'>
                                Try adjusting your search
                              </p>
                            </div>
                          )}
                        {hasMoreManagers && (
                          <button
                            type='button'
                            onClick={() => setManagerPage((p) => p + 1)}
                            className='w-full py-2.5 text-xs font-medium text-gray-500 hover:text-[#035864] hover:bg-gray-50 border border-dashed rounded-md transition-colors'>
                            Load more managers...
                          </button>
                        )}
                      </TabsContent>

                      <TabsContent
                        value='operators'
                        className='mt-0 space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {paginatedOperators.map((user: any) => {
                          const isSelected = selectedOperators.includes(
                            user.id
                          );
                          return (
                            <div
                              key={user.id}
                              onClick={() => toggleOperator(user.id)}
                              className={cn(
                                "group flex m-0 items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                                isSelected
                                  ? "border-[#035864] bg-[#035864]/5 ring-[#035864]"
                                  : "border-gray-100 hover:border-[#035864]/30 hover:bg-gray-50/80"
                              )}>
                              <div className='flex items-center gap-3'>
                                <div
                                  className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors shadow-sm",
                                    isSelected
                                      ? "bg-[#035864] text-white"
                                      : "bg-white border text-gray-500 group-hover:border-[#035864]/30 group-hover:text-[#035864]"
                                  )}>
                                  {user.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p
                                    className={cn(
                                      "font-medium text-sm transition-colors",
                                      isSelected
                                        ? "text-[#035864]"
                                        : "text-gray-900"
                                    )}>
                                    {user.name}
                                  </p>
                                  <p className='text-xs text-gray-500 flex items-center gap-1.5 mt-0.5'>
                                    <Mail className='h-3 w-3' />
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                              <div className='flex items-center gap-3'>
                                {isSelected ? (
                                  <CheckCircle2 className='h-5 w-5 text-[#035864]' />
                                ) : (
                                  <div className='h-5 w-5 rounded-full border border-gray-200 group-hover:border-[#035864]/50' />
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {!isLoadingStaffData &&
                          paginatedOperators.length === 0 && (
                            <div className='flex flex-col items-center justify-center py-10 text-gray-500'>
                              <div className='h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3'>
                                <Users className='h-6 w-6 text-gray-400' />
                              </div>
                              <p className='text-sm font-medium'>
                                No operators found
                              </p>
                              <p className='text-xs text-gray-400 mt-1'>
                                Try adjusting your search
                              </p>
                            </div>
                          )}
                        {hasMoreOperators && (
                          <button
                            type='button'
                            onClick={() => setOperatorPage((p) => p + 1)}
                            className='w-full py-2.5 text-xs font-medium text-gray-500 hover:text-[#035864] hover:bg-gray-50 border border-dashed rounded-md transition-colors'>
                            Load more operators...
                          </button>
                        )}
                      </TabsContent>
                    </ScrollArea>
                  </div>
                </Tabs>
              </div>

              {/* Selected Staff Summary - Cleaner version */}
              {(selectedManagerId || selectedOperators.length > 0) && (
                <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                  <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>
                    Currently Selected
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {selectedManagerId && (
                      <div className='inline-flex items-center gap-2 bg-white border border-[#035864]/20 shadow-xs rounded-full pl-1.5 pr-3 py-1 text-sm text-gray-700 animate-in fade-in zoom-in-95 duration-200'>
                        <div className='h-6 w-6 rounded-full bg-[#035864] text-white flex items-center justify-center text-[10px] font-bold'>
                          {managers
                            ?.find((m: any) => m.id === selectedManagerId)
                            ?.name.substring(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className='font-medium text-gray-900 text-xs'>
                          {
                            managers?.find(
                              (m: any) => m.id === selectedManagerId
                            )?.name
                          }
                        </span>
                        <span className='ml-1 text-[10px] text-[#035864] bg-[#035864]/5 px-1.5 py-0.5 rounded-full font-medium'>
                          Manager
                        </span>
                        <button
                          type='button'
                          onClick={() => setSelectedManagerId(null)}
                          className='ml-1 text-gray-400 hover:text-red-500 transition-colors'>
                          <X className='h-3.5 w-3.5' />
                        </button>
                      </div>
                    )}
                    {selectedOperators.map((opId) => {
                      const op = operators?.find((o: any) => o.id === opId);
                      if (!op) return null;
                      return (
                        <div
                          key={opId}
                          className='inline-flex items-center gap-2 bg-white border border-[#035864]/20 shadow-xs rounded-full pl-1.5 pr-3 py-1 text-sm text-gray-700 animate-in fade-in zoom-in-95 duration-200'>
                          <div className='h-6 w-6 rounded-full bg-white border border-[#035864] text-[#035864] flex items-center justify-center text-[10px] font-bold'>
                            {op.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className='font-medium text-gray-900 text-xs'>
                            {op.name}
                          </span>
                          <button
                            type='button'
                            onClick={() => toggleOperator(opId)}
                            className='ml-1 text-gray-400 hover:text-red-500 transition-colors'>
                            <X className='h-3.5 w-3.5' />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className='flex justify-end gap-4 mt-4 pt-4 border-t'>
              <CustomButton
                type='button'
                text='Cancel'
                variant='secondary'
                onClick={() => {
                  handleClose();
                }}
              />
              <CustomButton
                type='submit'
                text='Create Office'
                variant='primary'
                loading={form.formState.isSubmitting}
                disabled={form.formState.isSubmitting}
              />
            </div>
          </div>
        </CustomForm>
      </Form>
    </DialogWindow>
  );
};

export default AddOfficeDialog;
