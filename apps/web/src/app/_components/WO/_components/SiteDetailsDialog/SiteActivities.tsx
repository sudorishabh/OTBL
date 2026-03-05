import React, { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { constants } from "@pkg/utils";
import { BioremediationSections } from "./BioremediationSections";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Building2, Trash2, ExternalLink } from "lucide-react";
import DeferredFilePicker from "@/components/DeferredFilePicker";
import { useSharePointUpload } from "@/hooks/useSharePointUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CustomButton from "@/components/CustomButton";

type DocType =
  | "sub_wo"
  | "estimate"
  | "completion"
  | "estimate_sub-wo"
  | "bills"
  | "completion_certificate";

const PHASES: DocType[] = ["estimate_sub-wo", "completion"];
const PHASE_LABELS: Record<string, string> = {
  sub_wo: "Sub WO",
  estimate: "Estimate",
  completion: "Completion",
  "estimate_sub-wo": "Estimate / Sub-WO",
  bills: "Bills",
  completion_certificate: "Completion Certificate",
};

interface ActivityData {
  estimated_quantity: string;
  amount: string;
  transportation_km: string;
}

const PhaseForm = ({
  woSiteId,
  phase,
  processType,
  activities,
  getActivityData,
  siteDocuments,
  oilZappingData,
}: {
  woSiteId: number;
  phase: DocType;
  processType: string | undefined;
  activities: {
    id: number;
    activity: string;
    unit: string | null;
    rate?: string | null;
    sor_estimated_quantity?: string | null;
    total_used_quantity?: string | null;
    total_completion_quantity?: string | null;
  }[];
  getActivityData: (
    activityKey: string,
    phase: DocType,
    isBioremediation: boolean,
  ) =>
    | {
        estimated_quantity: string | number;
        amount: string | number | null;
        transportation_km: string | number | null;
      }
    | undefined;
  siteDocuments:
    | { id: number; type: string; document_url: string }[]
    | undefined;
  oilZappingData?: { estimated_quantity?: string | null }[];
}) => {
  const utils = trpc.useUtils();
  const isBioremediation = processType === "bioremediation";

  // Compute total oil zapping quantity for bioremediation completion auto-fill
  const totalOilZappingQty = React.useMemo(() => {
    if (!isBioremediation || !oilZappingData) return 0;
    return oilZappingData.reduce((sum, entry) => {
      return sum + (parseFloat(entry.estimated_quantity || "0") || 0);
    }, 0);
  }, [isBioremediation, oilZappingData]);

  const [formData, setFormData] = useState<Record<string, ActivityData>>({});
  const [file, setFile] = useState<File | null>(null);
  const [subWoFile, setSubWoFile] = useState<File | null>(null);
  const [estimateFile, setEstimateFile] = useState<File | null>(null);
  const [completionCertFile, setCompletionCertFile] = useState<File | null>(
    null,
  );
  const [billFiles, setBillFiles] = useState<File[]>([]);

  const {
    uploadFile,
    isUploading: isFileUploading,
    progress,
    reset: resetUpload,
  } = useSharePointUpload({
    folderPath: `/WorkOrders/Sites/${woSiteId}/${phase}`,
  });

  const deleteDocumentMutation =
    trpc.workOrderSiteMutation.deleteSiteDocument.useMutation({
      onSuccess: () => {
        toast.success("Document deleted");
        utils.workOrderSiteQuery.getSiteDocuments.invalidate();
      },
      onError: (err) => {
        toast.error(`Failed to delete document: ${err.message}`);
      },
    });

  const createSiteDocMutation =
    trpc.workOrderSiteMutation.createSiteDocument.useMutation();

  useEffect(() => {
    const newFormData: Record<string, ActivityData> = {};
    activities.forEach((activity) => {
      const isBioremActivity =
        activity.activity === "biorem_cont_soil" ||
        activity.activity ===
          constants.WO_ACTIVITIES.BIOREMEDIATION_OIL_CONTAMINATED_SOIL;

      // For bioremediation completion phase, auto-fill from oil zapping total
      if (
        isBioremediation &&
        phase === "completion" &&
        isBioremActivity &&
        totalOilZappingQty > 0
      ) {
        const rate = parseFloat(activity.rate || "0");
        const autoAmount = (totalOilZappingQty * rate).toFixed(2);
        newFormData[activity.activity] = {
          estimated_quantity: totalOilZappingQty.toFixed(2),
          amount: autoAmount,
          transportation_km: "",
        };
      } else {
        const data = getActivityData(
          activity.activity,
          phase,
          isBioremediation,
        );
        if (data) {
          newFormData[activity.activity] = {
            estimated_quantity: data.estimated_quantity?.toString() || "",
            amount: data.amount?.toString() || "",
            transportation_km: data.transportation_km?.toString() || "",
          };
        } else {
          newFormData[activity.activity] = {
            estimated_quantity: "",
            amount: "",
            transportation_km: "",
          };
        }
      }
    });
    setFormData(newFormData);
  }, [
    activities,
    phase,
    getActivityData,
    isBioremediation,
    totalOilZappingQty,
  ]);

  const handleChange = (
    activityKey: string,
    field: keyof ActivityData,
    value: string,
  ) => {
    setFormData((prev) => {
      const updatedActivity = {
        ...prev[activityKey],
        [field]: value,
      };

      // Automatic Calculation of amount if quantity is entered
      if (field === "estimated_quantity") {
        const activity = activities.find((a) => a.activity === activityKey);
        const rate = parseFloat(activity?.rate || "0");
        const qty = parseFloat(value) || 0;

        console.log(
          `Calculating amount for ${activityKey}: Qty=${qty}, Rate=${rate}`,
        );

        // Update amount even if rate is 0 to clear it if needed
        updatedActivity.amount = (qty * rate).toFixed(2);
      }

      return {
        ...prev,
        [activityKey]: updatedActivity,
      };
    });
  };

  const saveRestoration =
    trpc.workOrderSiteMutation.saveRestorationPhase.useMutation({
      onSuccess: () => {
        toast.success("All phase activities saved successfully.");
        utils.workOrderSiteQuery.getRestorationData.invalidate();
        utils.workOrderSiteQuery.getSiteDocuments.invalidate();
        setFile(null);
        setSubWoFile(null);
        setEstimateFile(null);
        setCompletionCertFile(null);
        setBillFiles([]);
        resetUpload();
      },
      onError: (err) => {
        toast.error(`Failed to save: ${err.message}`);
      },
    });

  const saveContaminatedSoil =
    trpc.workOrderSiteMutation.saveContaminatedSoil.useMutation({
      onSuccess: () => {
        toast.success("Bioremediation data saved.");
        utils.workOrderSiteQuery.getBioremediationData.invalidate();
        utils.workOrderSiteQuery.getSiteDocuments.invalidate();
        setFile(null);
        setSubWoFile(null);
        setEstimateFile(null);
        setCompletionCertFile(null);
        setBillFiles([]);
        resetUpload();
      },
      onError: (err) => {
        toast.error(`Failed to save: ${err.message}`);
      },
    });

  const handleSaveAll = async () => {
    // --- Validation: Check all activity fields are filled ---
    const missingFieldActivities: string[] = [];
    activities.forEach((activity) => {
      const data = formData[activity.activity];
      if (!data || !data.estimated_quantity?.trim()) {
        missingFieldActivities.push(formatName(activity.activity));
      }
    });

    if (missingFieldActivities.length > 0) {
      toast.error(
        `Please fill in the Estimated Quantity for: ${missingFieldActivities.join(", ")}`,
      );
      return;
    }

    // --- Validation: Check quantity against SOR (based on completion quantities) ---
    const exceedingQuantityActivities: string[] = [];
    activities.forEach((activity) => {
      const data = formData[activity.activity];
      if (data && activity.sor_estimated_quantity) {
        const enteringQty = parseFloat(data.estimated_quantity) || 0;
        const sorQty = parseFloat(activity.sor_estimated_quantity) || 0;
        const totalCompletionUsed = parseFloat(
          activity.total_completion_quantity || "0",
        );
        const availableForThisSite = sorQty - totalCompletionUsed;

        // Only enforce SOR limit on completion phase
        if (
          phase === "completion" &&
          enteringQty > availableForThisSite + 0.001
        ) {
          exceedingQuantityActivities.push(
            `${formatName(activity.activity)} (Available: ${availableForThisSite.toFixed(2)})`,
          );
        }
      }
    });

    if (exceedingQuantityActivities.length > 0) {
      toast.error(
        `Quantity cannot exceed the SOR limit: ${exceedingQuantityActivities.join(", ")}`,
      );
      return;
    }

    // --- Validation: Check documents ---
    let subWoDocUrl = siteDocuments?.find(
      (d) => d.type === "sub_wo",
    )?.document_url;
    let estimateDocUrl = siteDocuments?.find(
      (d) => d.type === "estimate",
    )?.document_url;
    let docUrl = siteDocuments?.find((d) => d.type === phase)?.document_url;
    let completionCertUrl = siteDocuments?.find(
      (d) => d.type === "completion_certificate",
    )?.document_url;

    if (phase === "estimate_sub-wo") {
      if ((!subWoDocUrl && !subWoFile) || (!estimateDocUrl && !estimateFile)) {
        toast.error("Please upload both Sub WO and Estimate documents.");
        return;
      }
    } else if (phase === "completion") {
      if (!completionCertUrl && !completionCertFile) {
        toast.error("Please upload Completion Certificate.");
        return;
      }
    } else {
      if (!docUrl && !file) {
        toast.error(`Please upload the ${PHASE_LABELS[phase]} document.`);
        return;
      }
    }

    // --- Upload files ---
    if (phase === "estimate_sub-wo") {
      if (subWoFile) {
        const result = await uploadFile(subWoFile);
        if (result) subWoDocUrl = result.webUrl;
        else return;
      }
      if (estimateFile) {
        const result = await uploadFile(estimateFile);
        if (result) estimateDocUrl = result.webUrl;
        else return;
      }
    } else if (phase === "completion") {
      if (completionCertFile) {
        const result = await uploadFile(completionCertFile);
        if (result) completionCertUrl = result.webUrl;
        else return;
      }
      // Upload bills
      for (const billFile of billFiles) {
        const result = await uploadFile(billFile);
        if (result) {
          await createSiteDocMutation.mutateAsync({
            work_order_site_id: woSiteId,
            type: "bills",
            document_url: result.webUrl,
          });
        }
      }
    } else if (file) {
      const result = await uploadFile(file);
      if (result) docUrl = result.webUrl;
      else return;
    }

    if (completionCertFile && completionCertUrl) {
      await createSiteDocMutation.mutateAsync({
        work_order_site_id: woSiteId,
        type: "completion_certificate",
        document_url: completionCertUrl,
      });
    }

    // --- Prepare Payload ---
    const commonData = {
      work_order_site_id: woSiteId,
      phase,
      document_url: docUrl,
      sub_wo_document_url: subWoDocUrl,
      estimate_document_url: estimateDocUrl,
    };

    // --- Save data ---
    if (isBioremediation) {
      const bioremActivity = activities.find(
        (a) =>
          a.activity === "biorem_cont_soil" ||
          a.activity ===
            constants.WO_ACTIVITIES.BIOREMEDIATION_OIL_CONTAMINATED_SOIL,
      );
      if (bioremActivity) {
        const data = formData[bioremActivity.activity];
        if (data) {
          saveContaminatedSoil.mutate({
            ...(commonData as any),
            data: {
              estimated_quantity: data.estimated_quantity,
              amount: data.amount || undefined,
              transportation_km: data.transportation_km || undefined,
            },
          });
        }
      }
    } else {
      const payload: any = {
        ...commonData,
        phase: phase as any,
      };

      activities.forEach((activity) => {
        const data = formData[activity.activity];
        if (!data) return;

        let fieldName = "";
        switch (activity.activity) {
          case "clean_up_oil_spill":
          case "clean_soil_area":
          case constants.WO_ACTIVITIES.clean_soil_area:
            fieldName = "clean_soil_area";
            break;
          case "lifting_oil_slush":
          case constants.WO_ACTIVITIES.LIFTING_OILY_SLUSH_OR_RECOVERY_OF_OIL:
            fieldName = "lifting_oil_slush";
            break;
          case "excav_cont_soil":
          case constants.WO_ACTIVITIES.EXCAVATION_OIL_CONTAMINATED_SOIL:
            fieldName = "excav_cont_soil";
            break;
          case "trans_cont_soil":
          case "trnsprt_oil_slush":
          case constants.WO_ACTIVITIES.TRANSPORTATION_CONTAMINATED_SOIL:
            fieldName = "trans_cont_soil";
            break;
          case "refill_excav_soil":
          case constants.WO_ACTIVITIES
            .REFILLING_EXCAVATED_OIL_CONTAMINATED_SOIL_LAND:
            fieldName = "refill_excav_soil";
            break;
        }

        if (fieldName) {
          payload[fieldName] = {
            estimated_quantity: data.estimated_quantity,
            amount: data.amount || undefined,
            transportation_km: data.transportation_km || undefined,
          };
        }
      });

      saveRestoration.mutate(payload);
    }
  };

  const isLoading =
    saveRestoration.isPending ||
    saveContaminatedSoil.isPending ||
    isFileUploading;

  const formatName = (name: string) => {
    return name
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const renderDocumentSection = (
    type: string,
    currentFile: File | null,
    setFileFn: (f: File | null) => void,
  ) => {
    const existing = siteDocuments?.find((d) => d.type === type);
    if (existing && !currentFile) {
      return (
        <div className='flex justify-between items-center bg-slate-50 p-2 rounded-md border border-slate-200 mb-2'>
          <a
            href={existing.document_url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-[11px] font-medium flex items-center text-gray-600 truncate hover:text-emerald-600 transition-colors leading-tight'>
            View {PHASE_LABELS[type as DocType] || type} Document
            <ExternalLink className='inline size-3.5 text-gray-700 ml-1 opacity-40 group-hover:opacity-100 transition-opacity' />
          </a>
          <Button
            size='sm'
            variant='ghost'
            onClick={() =>
              confirm("Delete this document?") &&
              deleteDocumentMutation.mutate({ id: existing.id })
            }
            className='h-6 w-6 p-0 text-slate-400 hover:text-red-500'>
            <Trash2 className='size-3.5' />
          </Button>
        </div>
      );
    }
    return (
      <div className='mb-2'>
        <DeferredFilePicker
          label={`Upload ${PHASE_LABELS[type as DocType] || type} Document`}
          selectedFile={currentFile}
          onFileSelect={setFileFn}
          isUploading={isFileUploading}
          uploadProgress={progress}
          className='bg-white'
        />
      </div>
    );
  };

  return (
    <div className='space-y-4'>
      <div>
        {phase === "estimate_sub-wo" ? (
          <>
            {renderDocumentSection("sub_wo", subWoFile, setSubWoFile)}
            {renderDocumentSection("estimate", estimateFile, setEstimateFile)}
          </>
        ) : phase === "completion" ? (
          <>
            {renderDocumentSection(
              "completion_certificate",
              completionCertFile,
              setCompletionCertFile,
            )}
            <div className='bg-white/30 p-3 rounded-lg border border-slate-200'>
              <h4 className='text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider'>
                Bills
              </h4>
              <div className='space-y-1.5 mb-3'>
                {siteDocuments
                  ?.filter((d) => d.type === "bills")
                  .map((doc, index) => (
                    <div
                      key={doc.id}
                      className='flex justify-between items-center bg-slate-50/50 p-1.5 rounded border border-slate-200/60'>
                      <a
                        href={doc.document_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-[11px] font-medium flex items-center text-gray-600 truncate hover:text-emerald-600 transition-colors leading-tight'>
                        Bill Document {index + 1}
                        <ExternalLink className='size-3.5 ml-1' />
                      </a>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() =>
                          confirm("Delete this bill?") &&
                          deleteDocumentMutation.mutate({ id: doc.id })
                        }
                        className='h-5 w-5 p-0 text-slate-400 hover:text-red-500'>
                        <Trash2 className='size-3.5' />
                      </Button>
                    </div>
                  ))}
              </div>
              <DeferredFilePicker
                label='Add New Bill'
                onFileSelect={(f) => f && setBillFiles((prev) => [...prev, f])}
                selectedFile={null}
                isUploading={isFileUploading}
                uploadProgress={progress}
                className='bg-white h-9'
              />
              {billFiles.length > 0 && (
                <div className='mt-2 space-y-1'>
                  {billFiles.map((f, i) => (
                    <div
                      key={i}
                      className='text-[10px] text-slate-500 flex items-center justify-between bg-blue-50/50 px-2 py-1 rounded border border-blue-100'>
                      <span className='truncate mr-2'>{f.name}</span>
                      <button
                        onClick={() =>
                          setBillFiles((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          )
                        }
                        className='text-red-400 hover:text-red-600 font-bold'>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          renderDocumentSection(phase, file, setFile)
        )}
      </div>
      {/* SOR Availability Summary */}
      {activities.some((a) => a.sor_estimated_quantity) && (
        <div className='rounded-lg border border-slate-200 bg-white/60 overflow-hidden'>
          <div className='px-3 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center gap-1.5'>
            <span className='text-[10px] font-semibold uppercase tracking-wider text-slate-500'>
              SOR Availability (Based on Completion)
            </span>
          </div>
          <div className='divide-y divide-slate-100'>
            {activities
              .filter((a) => a.sor_estimated_quantity)
              .map((activity) => {
                const sorQty = parseFloat(
                  activity.sor_estimated_quantity || "0",
                );
                const completionUsed = parseFloat(
                  activity.total_completion_quantity || "0",
                );
                const available = sorQty - completionUsed;
                const usedPct =
                  sorQty > 0
                    ? Math.min(100, (completionUsed / sorQty) * 100)
                    : 0;
                return (
                  <div
                    key={activity.id}
                    className='px-3 py-2'>
                    <div className='flex items-center justify-between mb-1'>
                      <span className='text-[11px] font-medium text-slate-700'>
                        {formatName(activity.activity)}
                      </span>
                      <div className='flex items-center gap-3 text-[10px]'>
                        <span className='text-slate-400'>
                          SOR:{" "}
                          <span className='font-medium text-slate-600'>
                            {sorQty.toFixed(2)} {activity.unit || "Nos"}
                          </span>
                        </span>
                        <span className='text-amber-600'>
                          Completed:{" "}
                          <span className='font-semibold'>
                            {completionUsed.toFixed(2)}
                          </span>
                        </span>
                        <span
                          className={
                            available < 0 ? "text-red-600" : "text-emerald-600"
                          }>
                          Available:{" "}
                          <span className='font-bold'>
                            {available.toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className='h-1.5 bg-slate-100 rounded-full overflow-hidden'>
                      <div
                        className={`h-full rounded-full transition-all ${usedPct >= 100 ? "bg-red-400" : usedPct >= 80 ? "bg-amber-400" : "bg-emerald-400"}`}
                        style={{ width: `${Math.min(100, usedPct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      {(() => {
        const hasTransportActivity = activities.some(
          (a) => a.activity === "trans_cont_soil",
        );
        return (
          <div className='border rounded-lg overflow-hidden bg-white/50 border-slate-200 shadow-xs'>
            <Table className='w-full text-xs'>
              <TableHeader className='bg-gray-200/50'>
                <TableRow className='border-b border-slate-200 hover:bg-transparent'>
                  <TableHead className='px-4 py-3 text-left border-r border-slate-200 w-[30%] text-slate-600 font-semibold h-auto'>
                    Activity Name
                  </TableHead>
                  <TableHead className='px-2 py-3 text-center border-r border-slate-200 w-[10%] text-slate-600 font-semibold h-auto'>
                    Unit
                  </TableHead>
                  <TableHead className='px-2 py-3 text-center border-r border-slate-200 w-[15%] text-slate-600 font-semibold h-auto'>
                    Rate
                  </TableHead>
                  <TableHead className='px-2 py-3 text-center border-r border-slate-200 w-[15%] text-slate-600 font-semibold h-auto'>
                    Est. Qty
                  </TableHead>
                  <TableHead
                    className={`px-2 py-3 text-center ${hasTransportActivity ? "border-r border-slate-200" : ""} w-[15%] text-slate-600 font-semibold h-auto`}>
                    Amount
                  </TableHead>
                  {hasTransportActivity && (
                    <TableHead className='px-2 py-3 text-center w-[15%] text-slate-600 font-semibold h-auto'>
                      Transport (KM)
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody className='divide-y divide-slate-200 bg-white/40'>
                {activities.map((activity) => {
                  const currentData = formData[activity.activity] || {
                    estimated_quantity: "",
                    amount: "",
                    transportation_km: "",
                  };

                  const isTransportActivity =
                    activity.activity === "trans_cont_soil";

                  const isBioremActivity =
                    isBioremediation &&
                    (activity.activity === "biorem_cont_soil" ||
                      activity.activity ===
                        constants.WO_ACTIVITIES
                          .BIOREMEDIATION_OIL_CONTAMINATED_SOIL);

                  // Auto-fill from oil zapping on completion phase
                  const isAutoFilledFromZapping =
                    isBioremActivity &&
                    phase === "completion" &&
                    totalOilZappingQty > 0;

                  // Check if exceeded: compare oil zapping total vs estimate phase quantity
                  const estimatePhaseData = isBioremActivity
                    ? getActivityData(
                        activity.activity,
                        "estimate_sub-wo" as DocType,
                        true,
                      )
                    : undefined;
                  const estimateQty = parseFloat(
                    estimatePhaseData?.estimated_quantity?.toString() || "0",
                  );
                  const exceededQty =
                    isAutoFilledFromZapping && estimateQty > 0
                      ? totalOilZappingQty - estimateQty
                      : 0;

                  return (
                    <TableRow
                      key={activity.id}
                      className='group hover:bg-slate-50/50 transition-colors border-slate-200'>
                      <TableCell className='px-4 py-2 border-r border-slate-200 font-medium text-slate-700 bg-slate-50/30'>
                        {formatName(activity.activity)}
                      </TableCell>
                      <TableCell className='px-2 py-2 border-r border-slate-200 text-center text-slate-500 bg-slate-50/20'>
                        {activity.unit || "Nos"}
                      </TableCell>
                      <TableCell className='px-2 py-2 border-r border-slate-200 text-center text-emerald-600 font-medium bg-emerald-50/20'>
                        {activity.rate || "0.00"}
                      </TableCell>
                      <TableCell className='p-0 border-r border-slate-200'>
                        <Input
                          value={currentData.estimated_quantity}
                          onChange={(e) =>
                            handleChange(
                              activity.activity,
                              "estimated_quantity",
                              e.target.value,
                            )
                          }
                          readOnly={isAutoFilledFromZapping}
                          className={`h-10 w-full border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-3 text-center text-xs placeholder:text-slate-300 ${isAutoFilledFromZapping ? "bg-blue-50/60 text-blue-700 font-semibold cursor-default" : "bg-transparent"}`}
                          placeholder={
                            activity.sor_estimated_quantity
                              ? `Max: ${activity.sor_estimated_quantity}`
                              : "0.00"
                          }
                        />
                        {isAutoFilledFromZapping && (
                          <div className='px-2 py-1.5 flex flex-col gap-1 text-xs border-t border-blue-100 bg-blue-50/40'>
                            <div className='flex justify-between text-blue-600'>
                              <span className='opacity-70'>
                                Oil Zapping Total:
                              </span>
                              <span className='font-medium'>
                                {totalOilZappingQty.toFixed(2)}
                              </span>
                            </div>
                            {estimateQty > 0 && (
                              <div className='flex justify-between text-slate-500'>
                                <span className='opacity-70'>
                                  Estimate Qty:
                                </span>
                                <span className='font-medium'>
                                  {estimateQty.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {exceededQty > 0 && (
                              <div className='flex justify-between border-t border-red-200/60 pt-1 mt-0.5'>
                                <span className='font-semibold text-red-600'>
                                  Exceeded:
                                </span>
                                <span className='text-red-600 font-bold'>
                                  +{exceededQty.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className='p-0 border-r border-slate-200'>
                        <Input
                          value={currentData.amount}
                          readOnly
                          className='h-10 w-full border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-slate-50/50 px-3 text-center text-xs font-semibold text-slate-700 placeholder:text-slate-300'
                          placeholder='0.00'
                        />
                      </TableCell>
                      {hasTransportActivity && (
                        <TableCell className='p-0'>
                          {isTransportActivity ? (
                            <Input
                              value={currentData.transportation_km}
                              onChange={(e) =>
                                handleChange(
                                  activity.activity,
                                  "transportation_km",
                                  e.target.value,
                                )
                              }
                              className='h-10 w-full border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-3 text-center text-xs placeholder:text-slate-300'
                              placeholder='0.00'
                            />
                          ) : (
                            <div className='flex items-center justify-center h-10 text-slate-400'>
                              -
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      })()}

      <div className='flex justify-end pt-2'>
        <CustomButton
          variant='primary'
          text={`Save ${PHASE_LABELS[phase]} Data`}
          onClick={handleSaveAll}
          type='button'
          loading={isLoading}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

const SiteActivities = ({
  woSiteId,
  processType,
}: {
  woSiteId: number;
  processType: string | undefined;
}) => {
  const siteActivitiesQuery =
    trpc.workOrderSiteQuery.getSiteActivities.useQuery(
      { work_order_site_id: woSiteId },
      { enabled: !!woSiteId },
    );

  console.log(siteActivitiesQuery.data);

  const restorationDataQuery =
    trpc.workOrderSiteQuery.getRestorationData.useQuery(
      { work_order_site_id: woSiteId },
      { enabled: !!woSiteId },
    );

  const bioremediationDataQuery =
    trpc.workOrderSiteQuery.getBioremediationData.useQuery(
      { work_order_site_id: woSiteId },
      { enabled: !!woSiteId },
    );

  const siteDocumentsQuery = trpc.workOrderSiteQuery.getSiteDocuments.useQuery(
    { work_order_site_id: woSiteId },
    { enabled: !!woSiteId },
  );

  const getActivityData = useCallback(
    (activityKey: string, phase: DocType, isBioremediation: boolean) => {
      if (isBioremediation) {
        if (!bioremediationDataQuery.data) return undefined;
        const data = bioremediationDataQuery.data;
        if (
          activityKey === "biorem_cont_soil" ||
          activityKey ===
            constants.WO_ACTIVITIES.BIOREMEDIATION_OIL_CONTAMINATED_SOIL
        ) {
          const activityType =
            phase === "completion" ? "completion" : "estimate_sub-wo";
          return data.contaminatedSoil.find(
            (item) => item.type === activityType,
          );
        }
        return undefined;
      } else {
        if (!restorationDataQuery.data) return undefined;
        const data = restorationDataQuery.data;
        const activityType =
          phase === "completion" ? "completion" : "estimate_sub-wo";
        switch (activityKey) {
          case "clean_up_oil_spill":
          case "clean_soil_area":
          case constants.WO_ACTIVITIES.clean_soil_area:
            return data.cleaningUpSoilArea.find(
              (item) => item.type === activityType,
            );
          case "lifting_oil_slush":
          case constants.WO_ACTIVITIES.LIFTING_OILY_SLUSH_OR_RECOVERY_OF_OIL:
            return data.liftingRecoveryOilSlush.find(
              (item) => item.type === activityType,
            );
          case "excav_cont_soil":
          case constants.WO_ACTIVITIES.EXCAVATION_OIL_CONTAMINATED_SOIL:
            return data.excavationContSoil.find(
              (item) => item.type === activityType,
            );
          case "trans_cont_soil":
          case "trnsprt_oil_slush":
          case constants.WO_ACTIVITIES.TRANSPORTATION_CONTAMINATED_SOIL:
            return data.transportationContSoil.find(
              (item) => item.type === activityType,
            );
          case "refill_excav_soil":
          case constants.WO_ACTIVITIES
            .REFILLING_EXCAVATED_OIL_CONTAMINATED_SOIL_LAND:
            return data.refillingExcavatedContSoil.find(
              (item) => item.type === activityType,
            );
          default:
            return undefined;
        }
      }
    },
    [bioremediationDataQuery.data, restorationDataQuery.data],
  );

  return (
    <div>
      <div className='space-y-4'>
        <div className={`rounded-xl bg-gray-100/60 p-5 border`}>
          <Tabs
            defaultValue='estimate_sub-wo'
            className='w-full'>
            <div className='flex items-start justify-between'>
              <h3
                className={`text-xs font-medium uppercase tracking-wide flex items-center gap-2 text-gray-700`}>
                {processType === "bioremediation" ? (
                  <FlaskConical className='w-4 h-4' />
                ) : (
                  <Building2 className='w-4 h-4' />
                )}
                {processType === "bioremediation"
                  ? "Bioremediation Data"
                  : "Restoration Data"}
              </h3>

              <TabsList className='grid w-[30%] cursor-pointer grid-cols-2 mb-4 bg-gray-200 p-1 rounded-lg'>
                {PHASES.map((phase) => (
                  <TabsTrigger
                    key={phase}
                    value={phase}
                    className='text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm'>
                    {PHASE_LABELS[phase]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {PHASES.map((phase) => (
              <TabsContent
                key={phase}
                value={phase}
                className='space-y-6'>
                {siteActivitiesQuery.data &&
                siteActivitiesQuery.data.length > 0 ? (
                  <PhaseForm
                    woSiteId={woSiteId}
                    phase={phase}
                    processType={processType}
                    activities={siteActivitiesQuery.data}
                    getActivityData={getActivityData}
                    siteDocuments={siteDocumentsQuery.data}
                    oilZappingData={bioremediationDataQuery.data?.oilZapping}
                  />
                ) : (
                  <div className='text-xs text-center text-slate-500 italic py-4'>
                    No activities found for this site.
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {processType === "bioremediation" && (
          <BioremediationSections woSiteId={woSiteId} />
        )}
      </div>
    </div>
  );
};

export default SiteActivities;
