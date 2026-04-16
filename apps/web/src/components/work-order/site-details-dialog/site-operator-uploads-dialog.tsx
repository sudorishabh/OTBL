"use client";

import DialogWindow from "@/components/shared/dialog-window";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc, type RouterOutputs } from "@/lib/trpc";
import { format } from "date-fns";
import { ExternalLink, FileText } from "lucide-react";
import useHandleParams from "@/hooks/useHandleParams";
import { useMemo } from "react";

type UploadRow =
  RouterOutputs["workOrderSiteQuery"]["getOperatorUploads"][number];

const isImageFileName = (fileName: string | null | undefined) => {
  if (!fileName) return false;
  const normalized = fileName.trim().toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(normalized);
};

interface Props {
  workOrderSiteId: number;
  siteName?: string;
}

export function SiteOperatorUploadsDialog({ workOrderSiteId, siteName }: Props) {
  const { getParam, deleteParam } = useHandleParams();

  const open =
    getParam("dialog") === "site-details" &&
    getParam("site-dialog") === "operator-uploads";

  const { data: uploads = [], isLoading } =
    trpc.workOrderSiteQuery.getOperatorUploads.useQuery(
      { work_order_site_id: workOrderSiteId },
      { enabled: open && workOrderSiteId > 0 },
    );

  const rows = useMemo(() => {
    return (uploads as UploadRow[]).map((row: UploadRow) => ({
      ...row,
      isImage: isImageFileName(row.file_name),
    }));
  }, [uploads]);

  const handleClose = () => {
    deleteParam("site-dialog");
  };

  return (
    <DialogWindow
      open={open}
      setOpen={(next) => {
        if (!next) handleClose();
      }}
      title={siteName ? `${siteName} — operator uploads` : "Operator uploads"}
      description='Uploads from field operators (stored in SharePoint).'
      size='lg'
      heightMode='fixed'
      isLoading={isLoading}>
      {rows.length === 0 && !isLoading ? (
        <p className='text-sm text-muted-foreground py-6 text-center'>
          No operator documents uploaded yet for this site.
        </p>
      ) : (
        <ScrollArea className='h-[min(420px,55vh)] pr-3'>
          <ul className='space-y-3'>
            {rows.map((row) => (
              <li
                key={row.id}
                className='rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-sm'>
                <div className='flex items-start gap-2'>
                  {row.isImage ? (
                    <a
                      href={row.document_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='shrink-0 mt-0.5'>
                      <img
                        src={row.document_url}
                        alt={row.file_name ?? `Operator upload ${row.id}`}
                        loading='lazy'
                        className='h-12 w-12 rounded-md object-cover border border-gray-200 bg-white'
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    </a>
                  ) : (
                    <FileText className='size-4 text-emerald-600 shrink-0 mt-0.5' />
                  )}
                  <div className='min-w-0 flex-1 space-y-1'>
                    <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
                      <span className='text-xs text-gray-500'>
                        {row.created_at
                          ? format(new Date(row.created_at), "dd MMM yyyy HH:mm")
                          : ""}
                      </span>
                    </div>
                    <a
                      href={row.document_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-xs font-medium text-emerald-700 hover:underline inline-flex items-center gap-1'>
                      {row.file_name ?? `Document #${row.id}`}
                      <ExternalLink className='size-3 opacity-70' />
                    </a>
                    <p className='text-xs text-gray-600 leading-relaxed'>
                      {row.description}
                    </p>
                    <p className='text-[11px] text-gray-400'>
                      Uploaded by {row.uploaded_by_name}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </DialogWindow>
  );
}

