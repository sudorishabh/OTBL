import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import useHandleParams from "@/hooks/useHandleParams";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  FlaskConical,
  Building2,
  Upload,
  File,
  ExternalLink,
  Trash2,
  TestTube,
  Zap,
} from "lucide-react";
import { SitePhaseForm } from "./SitePhaseForm";
import {
  ContaminatedSoilForm,
  BioSamplesForm,
  OilZappingForm,
} from "./BioremediationForms";
import { useSharePointUpload } from "@/hooks/useSharePointUpload";
import CustomButton from "@/components/CustomButton";
import DeferredFilePicker from "@/components/DeferredFilePicker";
import { format } from "date-fns";
import toast from "react-hot-toast";

type DocType = "sub_wo" | "estimate" | "expense";

const PHASES: DocType[] = ["sub_wo", "estimate", "expense"];
const PHASE_LABELS: Record<DocType, string> = {
  sub_wo: "Sub WO",
  estimate: "Estimate",
  expense: "Expense",
};

const SiteActivities = ({
  woSiteId,
  processType,
}: {
  woSiteId: number;
  processType: string | undefined;
}) => {
  const bioremediationQuery =
    trpc.workOrderSiteQuery.getBioremediationData.useQuery(
      { work_order_site_id: woSiteId },
      { enabled: !!woSiteId && processType === "bioremediation" },
    );

  const restorationQuery = trpc.workOrderSiteQuery.getRestorationData.useQuery(
    { work_order_site_id: woSiteId },
    { enabled: !!woSiteId && processType === "restoration" },
  );

  // Documents
  const documentsQuery = trpc.workOrderSiteQuery.getSiteDocuments.useQuery(
    { work_order_site_id: woSiteId },
    { enabled: !!woSiteId },
  );

  console.log("processType", processType);
  console.log("bioremediationQuery", bioremediationQuery.data);
  console.log("restorationQuery", restorationQuery.data);

  // Document Mutations
  const utils = trpc.useUtils();
  const createDocumentMutation =
    trpc.workOrderSiteMutation.createSiteDocument.useMutation({
      onSuccess: () => {
        toast.success("Document uploaded");
        utils.workOrderSiteQuery.getSiteDocuments.invalidate();
      },
      onError: (err) => toast.error(err.message),
    });

  const deleteDocumentMutation =
    trpc.workOrderSiteMutation.deleteSiteDocument.useMutation({
      onSuccess: () => {
        toast.success("Document deleted");
        utils.workOrderSiteQuery.getSiteDocuments.invalidate();
      },
      onError: (err) => toast.error(err.message),
    });

  // Prepare Data for Phase Form
  const getPhaseData = (phase: DocType) => {
    if (processType === "bioremediation" && bioremediationQuery.data) {
      const { contaminatedSoil, bioSamples, oilZapping } =
        bioremediationQuery.data;
      return {
        contaminated_soil: contaminatedSoil.find((i: any) => i.type === phase),
        bio_samples: bioSamples.filter((i: any) => i.type === phase),
        oil_zapping: oilZapping.filter((i: any) => i.type === phase),
      };
    }
    if (processType === "restoration" && restorationQuery.data) {
      // Assume restorationQuery.data keys match the form expectations
      // cleaningUpSoilArea, liftingRecoveryOilSlush, etc.
      const data = restorationQuery.data as any;
      return {
        clean_soil_area: data.cleaningUpSoilArea.find(
          (i: any) => i.type === phase,
        ),
        lifting_oil_slush: data.liftingRecoveryOilSlush.find(
          (i: any) => i.type === phase,
        ),
        excav_cont_soil: data.excavationContSoil.find(
          (i: any) => i.type === phase,
        ),
        trans_cont_soil: data.transportationContSoil.find(
          (i: any) => i.type === phase,
        ),
        refill_excav_soil: data.refillingExcavatedContSoil.find(
          (i: any) => i.type === phase,
        ),
      };
    }
    return {};
  };

  // if (siteDetailsQuery.isLoading) {
  //   return (
  //     <div className='flex justify-center p-8'>
  //       <Loader2 className='animate-spin' />
  //     </div>
  //   );
  // }

  if (!processType) return null;

  if (processType === "bioremediation") {
    return (
      <div className='space-y-6'>
        {/* 1. Contaminated Soil (Main) */}
        <div className='rounded-xl p-5 border bg-linear-to-br from-emerald-50/80 to-teal-50/80 border-emerald-100/50'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-xs font-medium uppercase tracking-wide flex items-center gap-2 text-emerald-700'>
              <FlaskConical className='w-4 h-4' />
              Bioremediation - Contaminated Soil
            </h3>
            <Badge className='text-[10px] border-0 bg-emerald-100/80 text-emerald-700'>
              {processType}
            </Badge>
          </div>

          <Tabs
            defaultValue='sub_wo'
            className='w-full'>
            <TabsList className='grid w-full grid-cols-3 mb-4 bg-white/50 p-1 rounded-lg'>
              {PHASES.map((phase) => (
                <TabsTrigger
                  key={phase}
                  value={phase}
                  className='text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm'>
                  {PHASE_LABELS[phase]}
                </TabsTrigger>
              ))}
            </TabsList>

            {PHASES.map((phase) => {
              const data = bioremediationQuery.data
                ? bioremediationQuery.data.contaminatedSoil.find(
                    (i: any) => i.type === phase,
                  )
                : null;
              return (
                <TabsContent
                  key={phase}
                  value={phase}
                  className='space-y-6'>
                  <ContaminatedSoilForm
                    workOrderSiteId={woSiteId}
                    phase={phase}
                    initialData={data}
                    onSuccess={() => {}}
                  />
                  <PhaseDocumentUpload
                    workOrderSiteId={woSiteId}
                    phase={phase}
                    existingDocuments={
                      documentsQuery.data?.filter(
                        (d: any) => d.type === phase,
                      ) || []
                    }
                    onUpload={(url: string, id: number) =>
                      createDocumentMutation.mutate({
                        work_order_site_id: woSiteId,
                        document_url: url,
                        type: phase,
                      })
                    }
                    onDelete={(id: number) =>
                      deleteDocumentMutation.mutate({ id })
                    }
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        </div>

        {/* 2. Bio Sampling */}
        <div className='rounded-xl p-5 border bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border-emerald-100/50'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-xs font-medium uppercase tracking-wide flex items-center gap-2 text-emerald-700'>
              <TestTube className='w-4 h-4' />
              Bio Sampling
            </h3>
          </div>
          <BioSamplesForm
            workOrderSiteId={woSiteId}
            initialData={bioremediationQuery.data?.bioSamples}
            onSuccess={() => {}}
          />
        </div>

        {/* 3. Oil Zapping */}
        <div className='rounded-xl p-5 border bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border-emerald-100/50'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-xs font-medium uppercase tracking-wide flex items-center gap-2 text-emerald-700'>
              <Zap className='w-4 h-4' />
              Oil Zapping
            </h3>
          </div>
          <OilZappingForm
            workOrderSiteId={woSiteId}
            initialData={bioremediationQuery.data?.oilZapping}
            onSuccess={() => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div
        className={`rounded-xl p-5 border ${processType === "bioremediation" ? "bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border-emerald-100/50" : "bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-blue-100/50"}`}>
        <div className='flex items-center justify-between mb-4'>
          <h3
            className={`text-xs font-medium uppercase tracking-wide flex items-center gap-2 ${processType === "bioremediation" ? "text-emerald-700" : "text-blue-700"}`}>
            {processType === "bioremediation" ? (
              <FlaskConical className='w-4 h-4' />
            ) : (
              <Building2 className='w-4 h-4' />
            )}
            {processType === "bioremediation"
              ? "Bioremediation Data"
              : "Restoration Data"}
          </h3>
          <Badge
            className={`text-[10px] border-0 ${processType === "bioremediation" ? "bg-emerald-100/80 text-emerald-700" : "bg-blue-100/80 text-blue-700"}`}>
            {processType}
          </Badge>
        </div>

        <Tabs
          defaultValue='sub_wo'
          className='w-full'>
          <TabsList className='grid w-full grid-cols-3 mb-4 bg-white/50 p-1 rounded-lg'>
            {PHASES.map((phase) => (
              <TabsTrigger
                key={phase}
                value={phase}
                className='text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm'>
                {PHASE_LABELS[phase]}
              </TabsTrigger>
            ))}
          </TabsList>

          {PHASES.map((phase) => (
            <TabsContent
              key={phase}
              value={phase}
              className='space-y-6'>
              {/* Unified Form */}
              <SitePhaseForm
                workOrderSiteId={woSiteId}
                phase={phase}
                processType={processType}
                initialData={getPhaseData(phase)}
                onSuccess={() => {}}
              />

              {/* Document Upload Section - Keeping this similar to previous logic but inline */}
              <PhaseDocumentUpload
                workOrderSiteId={woSiteId}
                phase={phase}
                existingDocuments={
                  documentsQuery.data?.filter((d: any) => d.type === phase) ||
                  []
                }
                onUpload={(url: string, id: number) =>
                  createDocumentMutation.mutate({
                    work_order_site_id: woSiteId,
                    document_url: url,
                    type: phase,
                  })
                }
                onDelete={(id: number) => deleteDocumentMutation.mutate({ id })}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

// Extracted Component for Documents to keep main file clean
const PhaseDocumentUpload = ({
  workOrderSiteId,
  phase,
  existingDocuments,
  onUpload,
  onDelete,
}: any) => {
  // SharePoint Hook
  // Note: Hook needs strictly defined folder path mapping or similar.
  // Assuming simple mapping:
  const folderPath = `/WorkOrderSiteDocs/${phase === "sub_wo" ? "SubWO" : phase === "estimate" ? "Estimate" : "Expense"}`;
  const uploadHook = useSharePointUpload({
    folderPath,
    conflictBehavior: "replace",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // reset selection if phase changes
  // actually component is re-rendered for each phase in map, so state is isolated if key is unique.
  // TabsContent unmounts/mounts? No, Radix Tabs usually keep content in DOM or unmount.
  // To be safe, use key.

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const res = await uploadHook.uploadFile(selectedFile);
      if (res) {
        onUpload(res.webUrl, res.id); // Passing SharePoint ID if needed, but DB uses its own ID?
        // The mutation creates a DB record.
        setSelectedFile(null);
        uploadHook.reset();
      }
    } catch (e) {
      console.error(e);
      toast.error("Upload failed");
    }
  };

  return (
    <div className='bg-white/60 p-4 rounded-xl border border-gray-100'>
      <h4 className='text-xs font-medium text-gray-600 mb-3 flex items-center gap-2 uppercase tracking-wide'>
        <Upload className='w-3.5 h-3.5' />
        {PHASE_LABELS[phase as DocType]} Documents
      </h4>

      <div className='p-3 bg-gray-50/50 rounded-lg space-y-2 mb-3'>
        <DeferredFilePicker
          label='Select Document'
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
          isUploading={uploadHook.isUploading}
          uploadProgress={uploadHook.progress}
          isUploaded={false}
          onDelete={() => {
            setSelectedFile(null);
            uploadHook.reset();
          }}
        />
        {selectedFile && (
          <CustomButton
            onClick={handleUpload}
            disabled={uploadHook.isUploading}
            variant='primary'
            text={uploadHook.isUploading ? "Uploading..." : "Upload"}
            loading={uploadHook.isUploading}
            className='w-full'
          />
        )}
      </div>

      <div className='space-y-1.5'>
        {existingDocuments.length === 0 ? (
          <p className='text-center py-2 text-gray-400 text-xs'>
            No documents uploaded
          </p>
        ) : (
          existingDocuments.map((doc: any) => (
            <div
              key={doc.id}
              className='flex items-center justify-between py-2 px-3 bg-white/80 rounded-lg border border-gray-100'>
              <div className='flex items-center gap-2'>
                <File className='w-3.5 h-3.5 text-emerald-500' />
                <div>
                  <a
                    href={doc.document_url}
                    target='_blank'
                    className='text-xs font-medium text-emerald-600 hover:underline flex items-center gap-1'>
                    View Document <ExternalLink className='w-2.5 h-2.5' />
                  </a>
                  <span className='text-[10px] text-gray-400 block'>
                    {format(new Date(doc.created_at), "dd MMM yyyy")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onDelete(doc.id)}
                className='text-gray-400 hover:text-red-500 transition-colors'>
                <Trash2 className='w-3.5 h-3.5' />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SiteActivities;
