"use client";
import React, { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { trpc } from "@/lib/trpc";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApiError } from "@/hooks/useApiError";
import CustomUploadDocument from "@/components/CustomUploadDocument";
import toast from "react-hot-toast";
import {
  Plus,
  FileText,
  DollarSign,
  Loader2,
  FileCheck,
  ShoppingCart,
} from "lucide-react";

// Activity item types labels mapping
const ITEM_TYPE_LABELS: Record<string, string> = {
  zero_days: "Zero Day Activity",
  zero_day_samples: "Zero Day Sample",
  tph: "TPH Activity",
  oil_zappers: "Oil Zapper",
  clean_up_oil_spill: "Clean Up Oil Spill",
  lifting_oil_slush: "Lifting Oil Slush",
  excavation_cont_soil: "Excavation Cont. Soil",
  trnsprt_oil_slush: "Transport Oil Slush",
};

// Phase configuration
const PHASE_CONFIG: Record<
  string,
  { label: string; icon: React.FC<{ className?: string }>; color: string }
> = {
  work_estimate: {
    label: "Work Estimate",
    icon: FileCheck,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  order: {
    label: "Order",
    icon: ShoppingCart,
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  expense: {
    label: "Expense",
    icon: DollarSign,
    color: "bg-green-100 text-green-700 border-green-200",
  },
};

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  siteActivityId: number;
  workOrderSiteId: number;
  initialItemType?: string;
  initialPhase?: string;
  onSuccess?: () => void;
};

const AddActivityItemDialog: React.FC<Props> = ({
  open,
  setOpen,
  siteActivityId,
  workOrderSiteId,
  initialItemType = "",
  initialPhase = "work_estimate",
  onSuccess,
}) => {
  const { handleError } = useApiError();
  const [isUploading, setIsUploading] = useState(false);
  const uploadedFileId = useRef<string | null>(null);

  // Get the item type and phase from props (no selection needed)
  const itemType = initialItemType;
  const phase = initialPhase;
  const phaseConfig = PHASE_CONFIG[phase] || PHASE_CONFIG.work_estimate;
  const PhaseIcon = phaseConfig.icon;

  const form = useForm({
    defaultValues: {
      type: initialPhase,
      amount: "",
      activity_description: "",
      document_key: "",
      // Dimension fields
      length: "",
      width: "",
      depth: "",
      height: "",
      length_metric: "",
      width_metric: "",
      depth_metric: "",
      volume_informed: "",
      // Sample fields
      volume_a1: "",
      density_a2: "",
      result_a: "",
      // TPH fields
      sample_collection_date: "",
      sample_send_date: "",
      sample_report_received: "no",
      tph_value: "",
      lab_info: "",
    },
  });

  // Delete file mutation for cleanup
  const deleteFileMutation = trpc.sharePointMutation.deleteFile.useMutation();

  const cleanupFile = useCallback(() => {
    if (uploadedFileId.current) {
      deleteFileMutation.mutate({ fileId: uploadedFileId.current });
      uploadedFileId.current = null;
    }
  }, [deleteFileMutation]);

  // Handle dialog close with cleanup
  const handleCloseDialog = useCallback(() => {
    if (isUploading) {
      toast.error("Please wait for the document to finish uploading.");
      return;
    }
    cleanupFile();
    setOpen(false);

    // Delay form reset until after animation completes
    setTimeout(() => {
      form.reset({
        type: initialPhase,
        amount: "",
        activity_description: "",
        document_key: "",
        length: "",
        width: "",
        depth: "",
        height: "",
        length_metric: "",
        width_metric: "",
        depth_metric: "",
        volume_informed: "",
        volume_a1: "",
        density_a2: "",
        result_a: "",
        sample_collection_date: "",
        sample_send_date: "",
        sample_report_received: "no",
        tph_value: "",
        lab_info: "",
      });
      uploadedFileId.current = null;
    }, 300);
  }, [setOpen, form, cleanupFile, isUploading, initialPhase]);

  // Reset form when dialog opens with new props
  React.useEffect(() => {
    if (open) {
      form.reset({
        type: initialPhase,
        amount: "",
        activity_description: "",
        document_key: "",
        length: "",
        width: "",
        depth: "",
        height: "",
        length_metric: "",
        width_metric: "",
        depth_metric: "",
        volume_informed: "",
        volume_a1: "",
        density_a2: "",
        result_a: "",
        sample_collection_date: "",
        sample_send_date: "",
        sample_report_received: "no",
        tph_value: "",
        lab_info: "",
      });
      uploadedFileId.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialPhase, initialItemType]);

  // Mutations for each item type
  const createZeroDay =
    trpc.siteActivityMutation.createZeroDayActivity.useMutation();
  const createZeroDaySample =
    trpc.siteActivityMutation.createZeroDaySample.useMutation();
  const createTph = trpc.siteActivityMutation.createTphActivity.useMutation();
  const createOilZapper =
    trpc.siteActivityMutation.createOilZapperActivity.useMutation();
  const linkItem = trpc.siteActivityMutation.linkItemToActivity.useMutation();

  const isLoading =
    createZeroDay.isPending ||
    createZeroDaySample.isPending ||
    createTph.isPending ||
    createOilZapper.isPending ||
    linkItem.isPending;

  const onSubmit = async (values: any) => {
    if (!itemType) {
      return;
    }

    if (isUploading) {
      toast.error("Please wait for document upload to complete.");
      return;
    }

    try {
      let itemId: number | undefined;

      // Create the item based on type
      switch (itemType) {
        case "zero_days": {
          const result = await createZeroDay.mutateAsync({
            work_order_site_id: workOrderSiteId,
            site_activity_id: siteActivityId,
            type: phase as "work_estimate" | "order" | "expense",
            amount: values.amount ? Number(values.amount) : undefined,
            length_metric: values.length_metric
              ? Number(values.length_metric)
              : undefined,
            width_metric: values.width_metric
              ? Number(values.width_metric)
              : undefined,
            depth_metric: values.depth_metric
              ? Number(values.depth_metric)
              : undefined,
            volume_informed: values.volume_informed
              ? Number(values.volume_informed)
              : undefined,
            document_key: values.document_key || "",
          });
          itemId = result.id;
          break;
        }
        case "zero_day_samples": {
          const result = await createZeroDaySample.mutateAsync({
            work_order_site_id: workOrderSiteId,
            site_activity_id: siteActivityId,
            type: phase as "work_estimate" | "order" | "expense",
            amount: values.amount ? Number(values.amount) : undefined,
            activity_description: values.activity_description || undefined,
            length: values.length ? Number(values.length) : undefined,
            width: values.width ? Number(values.width) : undefined,
            height: values.height ? Number(values.height) : undefined,
            volume_a1: values.volume_a1 ? Number(values.volume_a1) : undefined,
            density_a2: values.density_a2
              ? Number(values.density_a2)
              : undefined,
            result_a: values.result_a ? Number(values.result_a) : undefined,
            document_key: values.document_key || "",
          });
          itemId = result.id;
          break;
        }
        case "tph": {
          const result = await createTph.mutateAsync({
            work_order_site_id: workOrderSiteId,
            site_activity_id: siteActivityId,
            type: phase as "work_estimate" | "order" | "expense",
            amount: values.amount ? Number(values.amount) : undefined,
            activity_description: values.activity_description || undefined,
            sample_collection_date: values.sample_collection_date,
            sample_send_date: values.sample_send_date,
            sample_report_received: values.sample_report_received || "no",
            tph_value: values.tph_value ? Number(values.tph_value) : undefined,
            lab_info: values.lab_info || undefined,
            document_key: values.document_key || "",
          });
          itemId = result.id;
          break;
        }
        case "oil_zappers": {
          const result = await createOilZapper.mutateAsync({
            work_order_site_id: workOrderSiteId,
            site_activity_id: siteActivityId,
            type: phase as "work_estimate" | "order" | "expense",
            amount: values.amount ? Number(values.amount) : undefined,
            activity_description: values.activity_description || undefined,
            length: values.length ? Number(values.length) : undefined,
            width: values.width ? Number(values.width) : undefined,
            depth: values.depth ? Number(values.depth) : undefined,
            document_key: values.document_key || "",
          });
          itemId = result.id;
          break;
        }
        // For other types, use oil_zappers mutation (same fields)
        default: {
          const result = await createOilZapper.mutateAsync({
            work_order_site_id: workOrderSiteId,
            site_activity_id: siteActivityId,
            type: phase as "work_estimate" | "order" | "expense",
            amount: values.amount ? Number(values.amount) : undefined,
            activity_description: values.activity_description || undefined,
            length: values.length ? Number(values.length) : undefined,
            width: values.width ? Number(values.width) : undefined,
            depth: values.depth ? Number(values.depth) : undefined,
            document_key: values.document_key || "",
          });
          itemId = result.id;
        }
      }

      // Link the item to the activity
      if (itemId) {
        await linkItem.mutateAsync({
          site_activity_id: siteActivityId,
          item_table_name: itemType,
          item_id: itemId,
        });
      }

      // Clear the ref so we don't delete on close
      uploadedFileId.current = null;
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      cleanupFile();
      handleError(err, { showToast: true });
    }
  };

  const renderItemTypeFields = () => {
    switch (itemType) {
      case "zero_days":
        return (
          <>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='length_metric'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (m)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='width_metric'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (m)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='depth_metric'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depth (m)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='volume_informed'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume Informed (m³)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </>
        );

      case "zero_day_samples":
        return (
          <>
            <FormField
              control={form.control}
              name='activity_description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Activity description...'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='length'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (m)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='width'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (m)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='height'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (m)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='volume_a1'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume A1</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>L × W × H</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='density_a2'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Density A2</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='result_a'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Result A</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>A1 × A2</FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </>
        );

      case "tph":
        return (
          <>
            <FormField
              control={form.control}
              name='activity_description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Activity description...'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='sample_collection_date'
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sample Collection Date *</FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='sample_send_date'
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sample Send Date *</FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='sample_report_received'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Received</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='no'>No</SelectItem>
                        <SelectItem value='yes'>Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='tph_value'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TPH Value</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='lab_info'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lab Information</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Lab details...'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        );

      case "oil_zappers":
      case "clean_up_oil_spill":
      case "lifting_oil_slush":
      case "excavation_cont_soil":
      case "trnsprt_oil_slush":
        return (
          <>
            <FormField
              control={form.control}
              name='activity_description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Activity description...'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className='grid grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='length'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (m)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='width'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (m)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='depth'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depth (m)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // Don't render if no item type is provided
  if (!itemType) {
    return null;
  }

  // Generate folder path based on item type and phase
  const folderPath = `/Activities/${itemType}/${phase}`;

  return (
    <Dialog
      open={open}
      onOpenChange={handleCloseDialog}>
      <DialogContent className='max-w-2xl max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Plus className='w-5 h-5 text-blue-500' />
            Add Entry
          </DialogTitle>
          <DialogDescription className='flex flex-wrap items-center gap-2 pt-2'>
            <span>Adding new entry for</span>
            <Badge
              variant='secondary'
              className='font-medium'>
              <FileText className='w-3 h-3 mr-1' />
              {ITEM_TYPE_LABELS[itemType] || itemType}
            </Badge>
            <span>in</span>
            <Badge className={`${phaseConfig.color} border font-medium`}>
              <PhaseIcon className='w-3 h-3 mr-1' />
              {phaseConfig.label}
            </Badge>
            <span>phase</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[calc(90vh-10rem)] pr-4'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-5'>
              {/* Amount Field (common to all types) */}
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The amount for this {phaseConfig.label.toLowerCase()}
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Dynamic fields based on item type */}
              {renderItemTypeFields()}

              {/* Document Upload */}
              <FormField
                control={form.control}
                name='document_key'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CustomUploadDocument
                        label='Supporting Document'
                        folderPath={folderPath}
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

              <div className='flex justify-end gap-2 pt-4 border-t'>
                <Button
                  type='button'
                  variant='ghost'
                  onClick={handleCloseDialog}
                  disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={isLoading || isUploading}>
                  {isLoading && (
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  )}
                  Add Entry
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddActivityItemDialog;
