"use client";
import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DialogWindow from "@/components/DialogWindow";
import { Form } from "@/components/ui/form";
import CustomButton from "@/components/CustomButton";
import { trpc } from "@/lib/trpc";
import CustomForm from "@/components/CustomForm";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import CustomInput from "@/components/CustomInput";
import {
  Building2,
  MapPin,
  Globe,
  Hash,
  Search,
  Users,
  CheckCircle2,
  X,
  Mail,
} from "lucide-react";
import { siteSchemas, type SiteBaseInput } from "@pkg/trpc/schemas";
import { useApiError } from "@/hooks/useApiError";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const AddSiteDialog = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteMode = searchParams.get("siteMode");
  const officeId = searchParams.get("officeId");
  const officeName = searchParams.get("officeName");
  const siteId = searchParams.get("siteId");

  const isAddMode = siteMode === "add";
  const isEditMode = siteMode === "edit";
  const isOpenDialog = isAddMode || isEditMode;

  const form = useForm<SiteBaseInput>({
    resolver: zodResolver(siteSchemas.siteBaseSchema),
    defaultValues: {
      address: "",
      city: "",
      name: "",
      pincode: "",
      state: "",
    },
  });

  const [selectedOperators, setSelectedOperators] = useState<number[]>([]);
  const [operatorSearch, setOperatorSearch] = useState("");
  const [operatorPage, setOperatorPage] = useState(1);
  const itemsPerPage = 10;

  const utils = trpc.useUtils();
  const { handleError } = useApiError();

  // Get operators for site assignment
  const { data: staffData, isLoading: isLoadingStaffData } =
    trpc.userQuery.getManagersAndOperators.useQuery(undefined, {
      enabled: isAddMode,
    });

  const operators = staffData?.operators;

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

  // Fetch site data if in edit mode
  const { data: siteData, isLoading: isSiteLoading } =
    trpc.siteQuery.getSite.useQuery(
      { id: Number(siteId) },
      { enabled: isEditMode && !!siteId }
    );

  const addSite = trpc.siteMutation.addSite.useMutation({
    onSuccess: () => {
      toast.success("Site added successfully");
      utils.siteQuery.getSitesByOfficeId.invalidate();
      handleClose();
    },
    onError: (error) => {
      handleError(error, { showToast: true });
    },
  });

  const editSite = trpc.siteMutation.editSite.useMutation({
    onSuccess: () => {
      toast.success("Site updated successfully");
      utils.siteQuery.getSitesByOfficeId.invalidate();
      handleClose();
    },
    onError: (error) => {
      handleError(error, { showToast: true });
    },
  });

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("siteMode");
    params.delete("officeId");
    params.delete("officeName");
    params.delete("siteId");
    const paramsString = params.toString();
    router.push(paramsString ? `?${paramsString}` : window.location.pathname);
    form.reset({
      name: "",
      address: "",
      city: "",
      pincode: "",
      state: "",
    });
    setSelectedOperators([]);
    setOperatorSearch("");
    setOperatorPage(1);
  }, [searchParams, router, form]);

  const toggleOperator = (userId: number) => {
    if (selectedOperators.includes(userId)) {
      setSelectedOperators(selectedOperators.filter((id) => id !== userId));
    } else {
      setSelectedOperators([...selectedOperators, userId]);
    }
  };

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && siteData && !isSiteLoading) {
      form.reset({
        name: siteData.name || "",
        address: siteData.address || "",
        city: siteData.city || "",
        state: siteData.state || "",
        pincode: siteData.pincode || "",
      });
    } else if (isAddMode) {
      form.reset({
        name: "",
        address: "",
        city: "",
        pincode: "",
        state: "",
      });
    }
  }, [isEditMode, isAddMode, siteData, isSiteLoading, form]);

  async function onSubmit(values: SiteBaseInput) {
    try {
      if (isEditMode && siteId) {
        await editSite.mutateAsync({ ...values, id: Number(siteId) });
      } else if (isAddMode && officeId) {
        await addSite.mutateAsync({
          ...values,
          office_id: Number(officeId),
          operator_ids:
            selectedOperators.length > 0 ? selectedOperators : undefined,
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  return (
    <DialogWindow
      title={
        isEditMode
          ? "Edit Site"
          : `Add Site${officeName ? ` to ${officeName}` : ""}`
      }
      description={
        isEditMode
          ? "Update site information"
          : "Add a new site and assign operators"
      }
      open={isOpenDialog}
      size={isAddMode ? "lg" : "sm"}
      isLoading={isSiteLoading || (isAddMode && isLoadingStaffData)}
      setOpen={handleClose}>
      <Form {...form}>
        <CustomForm onSubmit={form.handleSubmit(onSubmit)}>
          <div className='max-h-[60vh] overflow-y-auto pr-2 space-y-6'>
            {/* Site Information Section */}
            <div className='space-y-4'>
              {isAddMode && (
                <div className='border-b pb-2'>
                  <h3 className='text-base font-semibold text-gray-800'>
                    Site Information
                  </h3>
                </div>
              )}

              <CustomInput
                control={form.control}
                fieldName='name'
                Label='Site Name'
                LabelIcon={Building2}
                placeholder='Enter site name'
              />

              <CustomInput
                control={form.control}
                fieldName='address'
                Label='Address'
                LabelIcon={MapPin}
                placeholder='Enter address'
              />

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <CustomInput
                  control={form.control}
                  fieldName='city'
                  Label='City'
                  LabelIcon={Globe}
                  placeholder='Enter city'
                />

                <CustomInput
                  control={form.control}
                  fieldName='state'
                  Label='State'
                  LabelIcon={Globe}
                  placeholder='Enter state'
                />

                <CustomInput
                  control={form.control}
                  fieldName='pincode'
                  Label='Pincode'
                  LabelIcon={Hash}
                  placeholder='Enter pincode'
                />
              </div>
            </div>

            {/* Operator Assignment Section - Only in Add Mode */}
            {isAddMode && (
              <div className='space-y-4'>
                <div className='border-b pb-2'>
                  <h3 className='text-base font-semibold text-gray-800'>
                    Assign Operators (Optional)
                  </h3>
                </div>

                <div className='rounded-xl border bg-white shadow-xs overflow-hidden'>
                  <div className='px-4 pt-4 border-b bg-gray-50'>
                    <div className='flex justify-between items-center flex-1 mb-4'>
                      <CustomInput
                        mode='standalone'
                        placeholder='Search operators...'
                        value={operatorSearch}
                        onChange={(value) => {
                          setOperatorSearch(value);
                          setOperatorPage(1);
                        }}
                        inputIcon={Search}
                        className='w-full max-w-[20rem]'
                      />
                    </div>
                  </div>

                  <div className='p-4'>
                    <ScrollArea className='h-56 pr-3 -mr-3'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        {paginatedOperators.map((user: any) => {
                          const isSelected = selectedOperators.includes(
                            user.id
                          );
                          return (
                            <div
                              key={user.id}
                              onClick={() => toggleOperator(user.id)}
                              className={cn(
                                "group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
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
                        {!isLoadingStaffData && paginatedOperators.length === 0 && (
                          <div className='col-span-2 flex flex-col items-center justify-center py-10 text-gray-500'>
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
                      </div>
                      {hasMoreOperators && (
                        <button
                          type='button'
                          onClick={() => setOperatorPage((p) => p + 1)}
                          className='w-full mt-3 py-2.5 text-xs font-medium text-gray-500 hover:text-[#035864] hover:bg-gray-50 border border-dashed rounded-md transition-colors'>
                          Load more operators...
                        </button>
                      )}
                    </ScrollArea>
                  </div>
                </div>

                {/* Selected Operators Summary */}
                {selectedOperators.length > 0 && (
                  <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                    <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>
                      Selected Operators ({selectedOperators.length})
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {selectedOperators.map((opId) => {
                        const op = operators?.find((o: any) => o.id === opId);
                        if (!op) return null;
                        return (
                          <div
                            key={opId}
                            className='inline-flex items-center gap-2 bg-white border border-[#035864]/20 shadow-xs rounded-full pl-1.5 pr-3 py-1 text-sm text-gray-700 animate-in fade-in zoom-in-95 duration-200'>
                            <div className='h-6 w-6 rounded-full bg-[#035864] text-white flex items-center justify-center text-[10px] font-bold'>
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
            )}

            <div className='flex justify-end gap-4 pt-4 border-t'>
              <CustomButton
                type='button'
                text='Cancel'
                variant='secondary'
                onClick={handleClose}
              />
              <CustomButton
                type='submit'
                text={isEditMode ? "Update" : "Create Site"}
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

export default AddSiteDialog;
