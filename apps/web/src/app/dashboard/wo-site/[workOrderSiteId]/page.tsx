"use client";

import CustomButton from "@/components/CustomButton";
import DeferredFilePicker from "@/components/DeferredFilePicker";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSharePointUpload } from "@/hooks/useSharePointUpload";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import {
  ExternalLink,
  FileText,
  LogOut,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

export default function WoSiteOperatorUploadPage() {
  const params = useParams();
  const workOrderSiteId = Number(params.workOrderSiteId);
  const { logout } = useAuthContext();

  const [measurementSheetFiles, setMeasurementSheetFiles] = useState<File[]>(
    [],
  );
  const [isUploadingAll, setIsUploadingAll] = useState(false);

  const utils = trpc.useUtils();

  const { data: siteDetails, isLoading } =
    trpc.workOrderSiteQuery.getWorkOrderSiteDetails.useQuery(
      { work_order_site_id: workOrderSiteId },
      { enabled: Number.isFinite(workOrderSiteId) && workOrderSiteId > 0 },
    );

  const { data: measurementSheetDocs = [] } =
    trpc.workOrderSiteQuery.getMeasurementSheets.useQuery(
      { work_order_site_id: workOrderSiteId },
      { enabled: Number.isFinite(workOrderSiteId) && workOrderSiteId > 0 },
    );

  const measurementSheetUpload = useSharePointUpload({
    folderPath: `/WorkOrders/Sites/${workOrderSiteId}/MeasurementSheets`,
  });

  const createMeasurementSheetMutation =
    trpc.workOrderSiteMutation.createMeasurementSheet.useMutation({
      onSuccess: () => {
        void utils.workOrderSiteQuery.getMeasurementSheets.invalidate();
        void utils.workOrderSiteQuery.getWorkOrderSiteDetails.invalidate();
        toast.success("Measurement sheet added");
      },
    });

  const deleteMeasurementSheetMutation =
    trpc.workOrderSiteMutation.deleteMeasurementSheet.useMutation({
      onSuccess: () => {
        void utils.workOrderSiteQuery.getMeasurementSheets.invalidate();
        toast.success("Document deleted");
      },
    });

  const handleMeasurementSheetFileSelect = useCallback((file: File | null) => {
    if (file) {
      setMeasurementSheetFiles((prev) => [...prev, file]);
    }
  }, []);

  const handleRemovePendingFile = (index: number) => {
    setMeasurementSheetFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    if (measurementSheetFiles.length === 0 || !workOrderSiteId) return;

    setIsUploadingAll(true);
    try {
      for (const file of measurementSheetFiles) {
        const result = await measurementSheetUpload.uploadFile(file);
        if (result) {
          await createMeasurementSheetMutation.mutateAsync({
            work_order_site_id: workOrderSiteId,
            document_url: result.webUrl,
            document_id: result.id,
          });
        }
      }
      setMeasurementSheetFiles([]);
      measurementSheetUpload.reset();
      toast.success("All files uploaded successfully");
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploadingAll(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMeasurementSheetMutation.mutate({ id });
    }
  };

  if (!Number.isFinite(workOrderSiteId) || workOrderSiteId <= 0) {
    return (
      <p className='p-6 text-sm text-muted-foreground'>Invalid work order site.</p>
    );
  }

  if (isLoading) {
    return (
      <div className='p-6 text-sm text-muted-foreground'>Loading…</div>
    );
  }

  if (!siteDetails) {
    return (
      <div className='p-6 space-y-4'>
        <p className='text-sm text-muted-foreground'>
          Work order site not found or you do not have access.
        </p>
        <CustomButton
          type='button'
          variant='outline'
          text='Log out'
          Icon={LogOut}
          onClick={() => void logout()}
        />
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-3xl p-6 space-y-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            Work order
          </p>
          <h1 className='text-xl font-semibold text-gray-900'>
            {siteDetails.work_order?.code ?? "—"} —{" "}
            {siteDetails.work_order?.title ?? "Documents"}
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Site: {siteDetails.site?.name ?? "—"} · Job{" "}
            {siteDetails.job_number}
          </p>
        </div>
        <CustomButton
          type='button'
          variant='outline'
          text='Log out'
          Icon={LogOut}
          onClick={() => void logout()}
        />
      </div>

      <div className='rounded-xl border bg-linear-to-br from-gray-50 to-gray-100/50 p-5'>
        <div className='flex items-center gap-2 mb-3'>
          <FileText className='w-3.5 h-3.5 text-emerald-500' />
          <span className='text-xs font-medium text-gray-700'>
            Measurement sheets
          </span>
        </div>

        <DeferredFilePicker
          label='Select measurement sheets'
          selectedFile={null}
          onFileSelect={handleMeasurementSheetFileSelect}
          multiple={true}
          isUploadBgWhite={true}
          helperText='You can select multiple files'
        />

        {measurementSheetFiles.length > 0 && (
          <div className='mt-3 space-y-2'>
            <div className='flex items-center justify-between px-1'>
              <div className='flex items-center gap-2'>
                <span className='text-[10px] font-bold text-amber-600 uppercase tracking-widest'>
                  Pending upload
                </span>
                <Badge
                  variant='outline'
                  className='text-[9px] px-1.5 py-0 h-4 bg-amber-50 text-amber-600 border-amber-200'>
                  {measurementSheetFiles.length}
                </Badge>
              </div>
              <button
                type='button'
                onClick={() => setMeasurementSheetFiles([])}
                className='text-[10px] text-red-500 hover:text-red-600 font-medium transition-colors'>
                Clear all
              </button>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
              {measurementSheetFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className='flex items-center justify-between py-1.5 px-2.5 bg-amber-50/30 rounded-lg border border-amber-100'>
                  <div className='flex items-center gap-2 min-w-0'>
                    <FileText className='w-3 h-3 text-amber-500 shrink-0' />
                    <span className='text-[11px] text-amber-900 truncate font-medium'>
                      {file.name}
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={() => handleRemovePendingFile(idx)}
                    className='p-1 text-amber-400 hover:text-red-500'>
                    <X className='w-3 h-3' />
                  </button>
                </div>
              ))}
            </div>
            <CustomButton
              onClick={() => void handleUploadAll()}
              disabled={isUploadingAll || measurementSheetUpload.isUploading}
              variant='primary'
              Icon={Upload}
              text={isUploadingAll ? "Uploading…" : "Upload all"}
              loading={isUploadingAll}
              className='w-full mt-2 h-9 text-xs'
            />
            {measurementSheetUpload.isUploading && (
              <div className='mt-1'>
                <Progress
                  value={measurementSheetUpload.progress}
                  className='h-1'
                  indicatorClassName='bg-emerald-500'
                />
              </div>
            )}
          </div>
        )}

        {measurementSheetDocs.length > 0 && (
          <div className='mt-6 pt-4 border-t border-gray-200/60'>
            <span className='text-[10px] font-bold text-gray-500 uppercase tracking-widest'>
              Uploaded
            </span>
            <ScrollArea
              className={
                measurementSheetDocs.length > 4 ? "h-40 mt-2" : "mt-2"
              }>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 pr-3'>
                {measurementSheetDocs.map((doc: { id: number; document_url: string; created_at?: string | Date }, index: number) => (
                  <div
                    key={doc.id}
                    className='relative group flex items-center gap-2.5 p-2 bg-white rounded-lg border border-gray-100'>
                    <div className='min-w-0 flex-1 py-0.5'>
                      <a
                        href={doc.document_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-[11px] font-medium flex items-center text-gray-600 truncate hover:text-emerald-600'>
                        Document {index + 1}
                        <ExternalLink className='inline size-3.5 ml-1 opacity-40' />
                      </a>
                      {doc.created_at && (
                        <p className='text-[9px] text-gray-400'>
                          {format(new Date(doc.created_at), "dd MMM yy")}
                        </p>
                      )}
                    </div>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type='button'
                            className='p-1 text-gray-400 hover:text-red-500'
                            onClick={() => void handleDeleteDocument(doc.id)}
                            disabled={deleteMeasurementSheetMutation.isPending}>
                            <Trash2 className='w-3 h-3' />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side='top' className='text-[10px]'>
                          Delete
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
