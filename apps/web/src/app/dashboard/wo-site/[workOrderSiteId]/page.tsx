"use client";

import CustomButton from "@/components/CustomButton";
import DeferredFilePicker from "@/components/DeferredFilePicker";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSharePointUpload } from "@/hooks/useSharePointUpload";
import { trpc, type RouterOutputs } from "@/lib/trpc";
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

type PendingItem = { file: File; description: string };

type OperatorUploadRow =
  RouterOutputs["workOrderSiteQuery"]["getOperatorUploads"][number];

export default function WoSiteOperatorUploadPage() {
  const params = useParams();
  const workOrderSiteId = Number(params.workOrderSiteId);
  const { logout } = useAuthContext();

  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [isUploadingAll, setIsUploadingAll] = useState(false);

  const utils = trpc.useUtils();

  const { data: siteDetails, isLoading } =
    trpc.workOrderSiteQuery.getWorkOrderSiteDetails.useQuery(
      { work_order_site_id: workOrderSiteId },
      { enabled: Number.isFinite(workOrderSiteId) && workOrderSiteId > 0 },
    );

  const { data: operatorUploads = [] } =
    trpc.workOrderSiteQuery.getOperatorUploads.useQuery(
      { work_order_site_id: workOrderSiteId },
      { enabled: Number.isFinite(workOrderSiteId) && workOrderSiteId > 0 },
    );

  const operatorUpload = useSharePointUpload({
    folderPath: `/WorkOrders/Sites/${workOrderSiteId}/OperatorUploads`,
  });

  const createOperatorUploadMutation =
    trpc.workOrderSiteMutation.createOperatorUpload.useMutation({
      onSuccess: () => {
        void utils.workOrderSiteQuery.getOperatorUploads.invalidate();
        void utils.workOrderSiteQuery.getWorkOrderSiteDetails.invalidate();
        toast.success("Document saved");
      },
    });

  const deleteOperatorUploadMutation =
    trpc.workOrderSiteMutation.deleteOperatorUpload.useMutation({
      onSuccess: () => {
        void utils.workOrderSiteQuery.getOperatorUploads.invalidate();
        toast.success("Document deleted");
      },
    });

  const handleFileSelect = useCallback((file: File | null) => {
    if (file) {
      setPendingItems((prev) => [...prev, { file, description: "" }]);
    }
  }, []);

  const handleRemovePending = (index: number) => {
    setPendingItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePendingDescription = (index: number, description: string) => {
    setPendingItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, description } : item)),
    );
  };

  const handleUploadAll = async () => {
    if (pendingItems.length === 0 || !workOrderSiteId) return;

    const missing = pendingItems.findIndex((p) => !p.description.trim());
    if (missing !== -1) {
      toast.error("Add a description for each file before uploading.");
      return;
    }

    setIsUploadingAll(true);
    try {
      for (const { file, description } of pendingItems) {
        const result = await operatorUpload.uploadFile(file);
        if (result) {
          await createOperatorUploadMutation.mutateAsync({
            work_order_site_id: workOrderSiteId,
            description: description.trim(),
            document_url: result.webUrl,
            document_id: result.id,
            file_name: file.name,
          });
        }
      }
      setPendingItems([]);
      operatorUpload.reset();
      toast.success("All files uploaded successfully");
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploadingAll(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteOperatorUploadMutation.mutate({ id });
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
            Site documents
          </span>
        </div>
        <p className='text-[11px] text-muted-foreground mb-3'>
          Files are stored in SharePoint; add a short description for each file.
        </p>

        <DeferredFilePicker
          label='Select files'
          selectedFile={null}
          onFileSelect={handleFileSelect}
          multiple={true}
          isUploadBgWhite={true}
          helperText='You can select multiple files'
        />

        {pendingItems.length > 0 && (
          <div className='mt-3 space-y-2'>
            <div className='flex items-center justify-between px-1'>
              <div className='flex items-center gap-2'>
                <span className='text-[10px] font-bold text-amber-600 uppercase tracking-widest'>
                  Pending upload
                </span>
                <Badge
                  variant='outline'
                  className='text-[9px] px-1.5 py-0 h-4 bg-amber-50 text-amber-600 border-amber-200'>
                  {pendingItems.length}
                </Badge>
              </div>
              <button
                type='button'
                onClick={() => setPendingItems([])}
                className='text-[10px] text-red-500 hover:text-red-600 font-medium transition-colors'>
                Clear all
              </button>
            </div>
            <div className='space-y-3'>
              {pendingItems.map((item, idx) => (
                <div
                  key={`${item.file.name}-${idx}`}
                  className='rounded-lg border border-amber-100 bg-amber-50/30 p-3 space-y-2'>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2 min-w-0'>
                      <FileText className='w-3 h-3 text-amber-500 shrink-0' />
                      <span className='text-[11px] text-amber-900 truncate font-medium'>
                        {item.file.name}
                      </span>
                    </div>
                    <button
                      type='button'
                      onClick={() => handleRemovePending(idx)}
                      className='p-1 text-amber-400 hover:text-red-500 shrink-0'>
                      <X className='w-3 h-3' />
                    </button>
                  </div>
                  <Textarea
                    placeholder='Description (required)'
                    value={item.description}
                    onChange={(e) =>
                      handlePendingDescription(idx, e.target.value)
                    }
                    className='min-h-[72px] text-xs bg-white'
                  />
                </div>
              ))}
            </div>
            <CustomButton
              onClick={() => void handleUploadAll()}
              disabled={isUploadingAll || operatorUpload.isUploading}
              variant='primary'
              Icon={Upload}
              text={isUploadingAll ? "Uploading…" : "Upload all"}
              loading={isUploadingAll}
              className='w-full mt-2 h-9 text-xs'
            />
            {operatorUpload.isUploading && (
              <div className='mt-1'>
                <Progress
                  value={operatorUpload.progress}
                  className='h-1'
                  indicatorClassName='bg-emerald-500'
                />
              </div>
            )}
          </div>
        )}

        {operatorUploads.length > 0 && (
          <div className='mt-6 pt-4 border-t border-gray-200/60'>
            <span className='text-[10px] font-bold text-gray-500 uppercase tracking-widest'>
              Uploaded
            </span>
            <ScrollArea
              className={
                operatorUploads.length > 4 ? "h-40 mt-2" : "mt-2"
              }>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 pr-3'>
                {operatorUploads.map((doc: OperatorUploadRow) => (
                  <div
                    key={doc.id}
                    className='relative group flex flex-col gap-1.5 p-2 bg-white rounded-lg border border-gray-100'>
                    <div className='min-w-0 flex-1 py-0.5'>
                      <a
                        href={doc.document_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-[11px] font-medium flex items-center text-gray-800 truncate hover:text-emerald-600'>
                        {doc.file_name ?? `Document ${doc.id}`}
                        <ExternalLink className='inline size-3.5 ml-1 opacity-40 shrink-0' />
                      </a>
                      <p className='text-[10px] text-gray-600 mt-1 line-clamp-3'>
                        {doc.description}
                      </p>
                      <p className='text-[9px] text-gray-400 mt-1'>
                        {doc.uploaded_by_name} ·{" "}
                        {doc.created_at &&
                          format(new Date(doc.created_at), "dd MMM yy")}
                      </p>
                    </div>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type='button'
                            className='self-end p-1 text-gray-400 hover:text-red-500'
                            onClick={() => void handleDeleteDocument(doc.id)}
                            disabled={deleteOperatorUploadMutation.isPending}>
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
