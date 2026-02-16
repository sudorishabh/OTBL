import { Badge } from "@/components/ui/badge";
import React from "react";
import {
  Calendar,
  MapPin,
  Briefcase,
  User,
  FileText,
  Loader2,
  Trash2,
  Building2,
  Upload,
  File,
  ExternalLink,
  Plus,
  FlaskConical,
  Package,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { capitalFirstLetter } from "@pkg/utils";
import { format } from "date-fns";

const InfoCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className='flex items-start gap-2.5'>
    <Icon className='w-3.5 h-3.5 text-gray-400 mt-0.5' />
    <div>
      <p className='text-[10px] text-gray-400 uppercase tracking-wide'>
        {label}
      </p>
      <p className='text-sm text-gray-800 font-medium'>{value}</p>
    </div>
  </div>
);

interface WorkOrderSiteDetails {
  id: number;
  end_date: string;
  status: "pending" | "completed" | "cancelled";
  client_id: number;
  work_order_id: number;
  site_id: number;
  date: string;
  process_type: string;
  job_number: string;
  area: string;
  installation_type: string;
  joint_estimate_number: string;
  land_owner_name: string;
  remarks: string;
  created_at: string;
  updated_at: string;
  site: {
    id: number;
    name: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
  };
  work_order: {
    id: number;
    code: string | null;
    title: string | null;
    process_type: string | null;
  };
  activities:
    | {
        id: number;
        work_order_site_id: number;
        created_at: string;
        updated_at: string;
        activity: string;
      }[]
    | undefined;
}

interface Props {
  siteDetails: WorkOrderSiteDetails | undefined | null;
}

const SiteDetailsCard = ({ siteDetails }: Props) => {
  // const siteDetailsQuery =
  //   trpc.workOrderSiteQuery.getWorkOrderSiteDetails.useQuery(
  //     { work_order_site_id: woSiteId },
  //     { enabled: !!woSiteId },
  //   );

  // const siteDetails = siteDetailsQuery.data;
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "cancelled":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };
  return (
    <div className='bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-100'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
          Site Information
        </h3>
        <Badge
          className={`text-[10px] border ${getStatusColor(siteDetails?.status ?? "pending")}`}>
          {capitalFirstLetter(siteDetails?.status ?? "pending")}
        </Badge>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <InfoCard
          icon={Briefcase}
          label='Process Type'
          value={capitalFirstLetter(siteDetails?.process_type ?? "N/A")}
        />
        <InfoCard
          icon={FileText}
          label='Job Number'
          value={siteDetails?.job_number ?? "N/A"}
        />
        <InfoCard
          icon={FileText}
          label='Joint Estimate No.'
          value={siteDetails?.joint_estimate_number ?? "N/A"}
        />
        <InfoCard
          icon={MapPin}
          label='Area'
          value={siteDetails?.area ?? "N/A"}
        />
        <InfoCard
          icon={Building2}
          label='Installation'
          value={siteDetails?.installation_type ?? "N/A"}
        />
        <InfoCard
          icon={User}
          label='Land Owner'
          value={siteDetails?.land_owner_name ?? "N/A"}
        />
        <InfoCard
          icon={Calendar}
          label='Start Date'
          value={
            siteDetails?.date
              ? format(new Date(siteDetails.date), "dd MMM yyyy")
              : "N/A"
          }
        />
        <InfoCard
          icon={Calendar}
          label='End Date'
          value={
            siteDetails?.end_date
              ? format(new Date(siteDetails.end_date), "dd MMM yyyy")
              : "N/A"
          }
        />
      </div>

      <div className='mt-4 pt-3 border-t border-gray-200/50'>
        <div className='flex items-start gap-2.5'>
          <MapPin className='w-3.5 h-3.5 text-gray-400 mt-0.5' />
          <div>
            <p className='text-[10px] text-gray-400 uppercase tracking-wide'>
              Address
            </p>
            <p className='text-sm text-gray-800'>
              {siteDetails?.site?.address ?? "N/A"},{" "}
              {siteDetails?.site?.city ?? "N/A"},{" "}
              {siteDetails?.site?.state ?? "N/A"}
            </p>
          </div>
        </div>
      </div>

      {siteDetails?.remarks && (
        <div className='mt-3 pt-3 border-t border-gray-200/50'>
          <p className='text-[10px] text-gray-400 uppercase tracking-wide mb-1'>
            Remarks
          </p>
          <p className='text-xs text-gray-600'>{siteDetails.remarks}</p>
        </div>
      )}

      {/* <div className='mt-4 pt-4 border-t border-gray-200/50'>
        <div className='flex items-center gap-2 mb-3'>
          <FileText className='w-3.5 h-3.5 text-emerald-500' />
          <span className='text-xs font-medium text-gray-700'>
            Measurement Sheet
          </span>
          {measurementSheetDocs.length > 0 && (
            <Badge
              variant='secondary'
              className='ml-auto text-[10px]'>
              {measurementSheetDocs.length}
            </Badge>
          )}
        </div>

        <DeferredFilePicker
          label='Measurement Sheet Document'
          selectedFile={measurementSheetFile}
          onFileSelect={handleMeasurementSheetFileSelect}
          isUploading={measurementSheetUpload.isUploading}
          uploadProgress={measurementSheetUpload.progress}
          isUploaded={!!measurementSheetUploadedUrl}
          uploadedUrl={measurementSheetUploadedUrl}
          onDelete={handleDeleteMeasurementSheetFile}
          isDeleting={measurementSheetUpload.isDeleting}
        />

        {measurementSheetFile && !measurementSheetUploadedUrl && (
          <CustomButton
            onClick={handleUploadMeasurementSheet}
            disabled={
              measurementSheetUpload.isUploading ||
              createDocumentMutation.isPending
            }
            variant='primary'
            Icon={Upload}
            text={
              measurementSheetUpload.isUploading ||
              createDocumentMutation.isPending
                ? "Uploading..."
                : "Upload"
            }
            loading={
              measurementSheetUpload.isUploading ||
              createDocumentMutation.isPending
            }
            className='w-full mt-2'
          />
        )}

        {measurementSheetDocs.length > 0 && (
          <div className='mt-2 space-y-1.5'>
            {measurementSheetDocs.map((doc: any) => (
              <div
                key={doc.id}
                className='flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-100 group hover:bg-gray-50 transition-colors'>
                <div className='flex items-center gap-2'>
                  <File className='w-3.5 h-3.5 text-emerald-500' />
                  <div>
                    <a
                      href={doc.document_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-xs font-medium text-emerald-600 hover:underline flex items-center gap-1'>
                      View Sheet
                      <ExternalLink className='w-2.5 h-2.5' />
                    </a>
                    <span className='text-[10px] text-gray-400'>
                      {format(new Date(doc.created_at), "dd MMM yyyy")}
                    </span>
                  </div>
                </div>
                <button
                  type='button'
                  className='opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all'
                  onClick={() => handleDeleteDocument(doc.id)}
                  disabled={deleteDocumentMutation.isPending}>
                  <Trash2 className='w-3.5 h-3.5' />
                </button>
              </div>
            ))}
          </div>
        )}
      </div> */}
    </div>
  );
};

export default SiteDetailsCard;
