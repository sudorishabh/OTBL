"use client";
import React, { useState } from "react";
import DialogWindow from "@/components/DialogWindow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { capitalFirstLetter } from "@pkg/utils";
import {
  Calendar,
  MapPin,
  Briefcase,
  User,
  FileText,
  Plus,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Building2,
  Clock,
  Package,
  Truck,
  Calculator,
  Save,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

interface SiteDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  siteData: {
    id: number;
    wo_site_id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    start_date: string;
    end_date: string;
    status: "pending" | "completed" | "cancelled";
    client_id?: number;
    work_order_id?: number;
    [key: string]: any;
  } | null;
}

// Activity types based on schema
const ACTIVITY_TYPES = [
  { value: "cleaning_up_soil_area", label: "Cleaning Up Soil Area" },
  {
    value: "lifting_recovery_oil_slush",
    label: "Lifting/Recovery of Oil Slush",
  },
  { value: "excavation_cont_soil", label: "Excavation of Contaminated Soil" },
  {
    value: "transportation_cont_soil",
    label: "Transportation of Contaminated Soil",
  },
  {
    value: "refilling_excavated_cont_soil",
    label: "Refilling Excavated Contaminated Soil",
  },
  {
    value: "bioremediation_cont_soil",
    label: "Bioremediation of Contaminated Soil",
  },
] as const;

interface ActivityDetailFormData {
  estimated_quantity: string;
  amount: string;
  transportation_km: string;
}

const SiteDetailDialog = ({
  isOpen,
  onClose,
  siteData,
}: SiteDetailDialogProps) => {
  const [activePhase, setActivePhase] = useState<
    "sub_wo" | "estimate" | "expense"
  >("sub_wo");
  const [newActivityName, setNewActivityName] = useState("");
  const [selectedActivityType, setSelectedActivityType] = useState<string>("");
  const [expandedActivityId, setExpandedActivityId] = useState<number | null>(
    null,
  );
  const [activityFormData, setActivityFormData] =
    useState<ActivityDetailFormData>({
      estimated_quantity: "",
      amount: "",
      transportation_km: "",
    });

  // Fetch site details from API
  const siteDetailsQuery =
    trpc.workOrderSiteQuery.getWorkOrderSiteDetails.useQuery(
      { work_order_site_id: siteData?.wo_site_id ?? 0 },
      { enabled: !!siteData?.wo_site_id },
    );

  // Fetch activities
  const activitiesQuery = trpc.workOrderSiteQuery.getSiteActivities.useQuery(
    { work_order_site_id: siteData?.wo_site_id ?? 0 },
    { enabled: !!siteData?.wo_site_id },
  );

  const utils = trpc.useUtils();

  // Create activity mutation
  const createActivityMutation =
    trpc.workOrderSiteMutation.createSiteActivity.useMutation({
      onSuccess: () => {
        toast.success("Activity created successfully");
        setNewActivityName("");
        setSelectedActivityType("");
        utils.workOrderSiteQuery.getSiteActivities.invalidate({
          work_order_site_id: siteData?.wo_site_id ?? 0,
        });
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create activity");
      },
    });

  // Delete activity mutation
  const deleteActivityMutation =
    trpc.workOrderSiteMutation.deleteSiteActivity.useMutation({
      onSuccess: () => {
        toast.success("Activity deleted successfully");
        utils.workOrderSiteQuery.getSiteActivities.invalidate({
          work_order_site_id: siteData?.wo_site_id ?? 0,
        });
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete activity");
      },
    });

  const handleCreateActivity = () => {
    if (!newActivityName.trim()) {
      toast.error("Please enter an activity name");
      return;
    }
    if (!selectedActivityType) {
      toast.error("Please select an activity type");
      return;
    }
    if (!siteData?.wo_site_id) return;

    createActivityMutation.mutate({
      work_order_site_id: siteData.wo_site_id,
      activity: `${selectedActivityType}:${newActivityName.trim()}`,
    });
  };

  const handleDeleteActivity = (activityId: number) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      deleteActivityMutation.mutate({ id: activityId });
    }
  };

  const toggleActivityExpansion = (activityId: number) => {
    if (expandedActivityId === activityId) {
      setExpandedActivityId(null);
      setActivityFormData({
        estimated_quantity: "",
        amount: "",
        transportation_km: "",
      });
    } else {
      setExpandedActivityId(activityId);
      setActivityFormData({
        estimated_quantity: "",
        amount: "",
        transportation_km: "",
      });
    }
  };

  const handleSaveActivityDetails = (activityId: number) => {
    if (!activityFormData.estimated_quantity) {
      toast.error("Estimated quantity is required");
      return;
    }
    toast.success("Activity details saved (backend integration pending)");
    setExpandedActivityId(null);
    setActivityFormData({
      estimated_quantity: "",
      amount: "",
      transportation_km: "",
    });
  };

  const parseActivityName = (activity: string) => {
    const parts = activity.split(":");
    if (parts.length > 1) {
      const typeKey = parts[0];
      const name = parts.slice(1).join(":");
      const typeInfo = ACTIVITY_TYPES.find((t) => t.value === typeKey);
      return { type: typeInfo?.label || typeKey, typeKey, name };
    }
    return { type: null, typeKey: null, name: activity };
  };

  const siteDetails = siteDetailsQuery.data;
  const activities = activitiesQuery.data ?? [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const phaseLabels = {
    sub_wo: "Sub Work Order",
    estimate: "Estimate",
    expense: "Expense",
  };

  // Build the title with site name and work order info
  const dialogTitle = siteData?.name
    ? capitalFirstLetter(siteData.name)
    : "Site Details";

  const dialogDescription = siteDetails?.work_order
    ? `${siteDetails.work_order.code} - ${siteDetails.work_order.title}`
    : undefined;

  return (
    <DialogWindow
      open={isOpen}
      setOpen={(open) => !open && onClose()}
      title={dialogTitle}
      description={dialogDescription}
      size='lg'
      isLoading={siteDetailsQuery.isLoading}>
      <div className='space-y-6 py-4'>
        {/* Site Information Section */}
        <div className='border rounded-lg p-5'>
          <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
            <FileText className='w-4 h-4 text-gray-500' />
            Site Information
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Status */}
            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
              <Briefcase className='w-4 h-4 text-gray-500' />
              <div>
                <p className='text-xs text-gray-500'>Status</p>
                <Badge
                  className={`mt-1 ${getStatusColor(siteDetails?.status ?? siteData?.status ?? "pending")}`}>
                  {capitalFirstLetter(
                    siteDetails?.status ?? siteData?.status ?? "pending",
                  )}
                </Badge>
              </div>
            </div>

            {/* Process Type */}
            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
              <Briefcase className='w-4 h-4 text-gray-500' />
              <div>
                <p className='text-xs text-gray-500'>Process Type</p>
                <p className='font-medium text-sm'>
                  {capitalFirstLetter(siteDetails?.process_type ?? "N/A")}
                </p>
              </div>
            </div>

            {/* Job Number */}
            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
              <FileText className='w-4 h-4 text-gray-500' />
              <div>
                <p className='text-xs text-gray-500'>Job Number</p>
                <p className='font-medium text-sm'>
                  {siteDetails?.job_number ?? "N/A"}
                </p>
              </div>
            </div>

            {/* Joint Estimate Number */}
            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
              <FileText className='w-4 h-4 text-gray-500' />
              <div>
                <p className='text-xs text-gray-500'>Joint Estimate No.</p>
                <p className='font-medium text-sm'>
                  {siteDetails?.joint_estimate_number ?? "N/A"}
                </p>
              </div>
            </div>

            {/* Area */}
            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
              <MapPin className='w-4 h-4 text-gray-500' />
              <div>
                <p className='text-xs text-gray-500'>Area</p>
                <p className='font-medium text-sm'>
                  {siteDetails?.area ?? "N/A"}
                </p>
              </div>
            </div>

            {/* Installation Type */}
            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
              <Building2 className='w-4 h-4 text-gray-500' />
              <div>
                <p className='text-xs text-gray-500'>Installation Type</p>
                <p className='font-medium text-sm'>
                  {siteDetails?.installation_type ?? "N/A"}
                </p>
              </div>
            </div>

            {/* Land Owner */}
            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
              <User className='w-4 h-4 text-gray-500' />
              <div>
                <p className='text-xs text-gray-500'>Land Owner</p>
                <p className='font-medium text-sm'>
                  {siteDetails?.land_owner_name ?? "N/A"}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
              <MapPin className='w-4 h-4 text-gray-500' />
              <div>
                <p className='text-xs text-gray-500'>Address</p>
                <p className='font-medium text-sm'>
                  {siteDetails?.site?.address ?? siteData?.address ?? "N/A"},{" "}
                  {siteDetails?.site?.city ?? siteData?.city},{" "}
                  {siteDetails?.site?.state ?? siteData?.state}
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className='mt-4 grid grid-cols-2 gap-4'>
            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
              <Calendar className='w-4 h-4 text-gray-500' />
              <div>
                <p className='text-xs text-gray-500'>Start Date</p>
                <p className='font-medium text-sm'>
                  {siteDetails?.date
                    ? format(new Date(siteDetails.date), "dd MMM yyyy")
                    : siteData?.start_date
                      ? format(new Date(siteData.start_date), "dd MMM yyyy")
                      : "N/A"}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
              <Calendar className='w-4 h-4 text-gray-500' />
              <div>
                <p className='text-xs text-gray-500'>End Date</p>
                <p className='font-medium text-sm'>
                  {siteDetails?.end_date
                    ? format(new Date(siteDetails.end_date), "dd MMM yyyy")
                    : siteData?.end_date
                      ? format(new Date(siteData.end_date), "dd MMM yyyy")
                      : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {siteDetails?.remarks && (
            <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
              <p className='text-xs text-gray-500 mb-1'>Remarks</p>
              <p className='text-sm text-gray-700'>{siteDetails.remarks}</p>
            </div>
          )}
        </div>

        {/* Activities Section */}
        <div className='border rounded-lg p-5'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-semibold text-gray-900 flex items-center gap-2'>
              <Clock className='w-4 h-4 text-gray-500' />
              Site Activities
            </h3>
            <Badge variant='outline'>{activities.length} Activities</Badge>
          </div>

          {/* Phase Tabs */}
          <Tabs
            value={activePhase}
            onValueChange={(v) =>
              setActivePhase(v as "sub_wo" | "estimate" | "expense")
            }>
            <TabsList className='grid w-full grid-cols-3 mb-4'>
              {(["sub_wo", "estimate", "expense"] as const).map((phase) => (
                <TabsTrigger
                  key={phase}
                  value={phase}>
                  {phaseLabels[phase]}
                </TabsTrigger>
              ))}
            </TabsList>

            {(["sub_wo", "estimate", "expense"] as const).map((phase) => (
              <TabsContent
                key={phase}
                value={phase}
                className='space-y-4'>
                {/* Add New Activity */}
                <div className='p-4 bg-gray-50 rounded-lg space-y-3'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Plus className='w-4 h-4 text-gray-500' />
                    <span className='text-sm font-medium text-gray-700'>
                      Add New Activity
                    </span>
                  </div>

                  {/* Activity Type Select */}
                  <div className='space-y-2'>
                    <Label className='text-xs text-gray-500'>
                      Activity Type
                    </Label>
                    <Select
                      value={selectedActivityType}
                      onValueChange={setSelectedActivityType}>
                      <SelectTrigger className='w-full bg-white'>
                        <SelectValue placeholder='Select activity type...' />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_TYPES.map((type) => (
                          <SelectItem
                            key={type.value}
                            value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Activity Name Input */}
                  <div className='flex gap-2'>
                    <Input
                      placeholder={`Enter activity name...`}
                      value={newActivityName}
                      onChange={(e) => setNewActivityName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateActivity();
                      }}
                      className='flex-1 bg-white'
                    />
                    <Button
                      onClick={handleCreateActivity}
                      disabled={createActivityMutation.isPending}>
                      {createActivityMutation.isPending ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : (
                        <Plus className='w-4 h-4' />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Activity List */}
                <div className='space-y-2'>
                  {activitiesQuery.isLoading ? (
                    <div className='flex items-center justify-center py-8'>
                      <Loader2 className='w-6 h-6 animate-spin text-gray-400' />
                    </div>
                  ) : activities.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <Clock className='w-12 h-12 mx-auto mb-2 text-gray-300' />
                      <p>No activities yet</p>
                      <p className='text-sm text-gray-400'>
                        Add your first activity above
                      </p>
                    </div>
                  ) : (
                    activities.map((activity: any) => {
                      const parsedActivity = parseActivityName(
                        activity.activity,
                      );
                      const isExpanded = expandedActivityId === activity.id;

                      return (
                        <div
                          key={activity.id}
                          className='bg-white rounded-lg border overflow-hidden'>
                          {/* Activity Header */}
                          <div
                            className='flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer group'
                            onClick={() =>
                              toggleActivityExpansion(activity.id)
                            }>
                            <div className='flex items-center gap-3'>
                              <Package className='w-4 h-4 text-gray-400' />
                              <div>
                                <span className='font-medium text-sm block'>
                                  {parsedActivity.name}
                                </span>
                                {parsedActivity.type && (
                                  <span className='text-xs text-gray-500'>
                                    {parsedActivity.type}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteActivity(activity.id);
                                }}
                                disabled={deleteActivityMutation.isPending}>
                                <Trash2 className='w-4 h-4' />
                              </Button>
                              {isExpanded ? (
                                <ChevronUp className='w-4 h-4 text-gray-400' />
                              ) : (
                                <ChevronDown className='w-4 h-4 text-gray-400' />
                              )}
                            </div>
                          </div>

                          {/* Activity Details Form (Expandable) */}
                          {isExpanded && (
                            <div className='p-4 bg-gray-50 border-t space-y-4'>
                              <div className='flex items-center gap-2 mb-3'>
                                <Calculator className='w-4 h-4 text-gray-500' />
                                <span className='text-sm font-medium text-gray-700'>
                                  Activity Details for {phaseLabels[phase]}
                                </span>
                              </div>

                              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                {/* Estimated Quantity */}
                                <div className='space-y-2'>
                                  <Label className='text-xs text-gray-500 flex items-center gap-1'>
                                    <Package className='w-3 h-3' />
                                    Estimated Quantity{" "}
                                    <span className='text-red-500'>*</span>
                                  </Label>
                                  <Input
                                    type='number'
                                    step='0.01'
                                    placeholder='Enter quantity...'
                                    value={activityFormData.estimated_quantity}
                                    onChange={(e) =>
                                      setActivityFormData((prev) => ({
                                        ...prev,
                                        estimated_quantity: e.target.value,
                                      }))
                                    }
                                    className='bg-white'
                                  />
                                </div>

                                {/* Amount */}
                                <div className='space-y-2'>
                                  <Label className='text-xs text-gray-500 flex items-center gap-1'>
                                    <Calculator className='w-3 h-3' />
                                    Amount (₹)
                                  </Label>
                                  <Input
                                    type='number'
                                    step='0.01'
                                    placeholder='Enter amount...'
                                    value={activityFormData.amount}
                                    onChange={(e) =>
                                      setActivityFormData((prev) => ({
                                        ...prev,
                                        amount: e.target.value,
                                      }))
                                    }
                                    className='bg-white'
                                  />
                                </div>

                                {/* Transportation KM */}
                                <div className='space-y-2'>
                                  <Label className='text-xs text-gray-500 flex items-center gap-1'>
                                    <Truck className='w-3 h-3' />
                                    Transportation (KM)
                                  </Label>
                                  <Input
                                    type='number'
                                    step='0.01'
                                    placeholder='Enter distance...'
                                    value={activityFormData.transportation_km}
                                    onChange={(e) =>
                                      setActivityFormData((prev) => ({
                                        ...prev,
                                        transportation_km: e.target.value,
                                      }))
                                    }
                                    className='bg-white'
                                  />
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className='flex justify-end gap-2 pt-3 border-t'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => {
                                    setExpandedActivityId(null);
                                    setActivityFormData({
                                      estimated_quantity: "",
                                      amount: "",
                                      transportation_km: "",
                                    });
                                  }}>
                                  <X className='w-4 h-4 mr-1' />
                                  Cancel
                                </Button>
                                <Button
                                  size='sm'
                                  onClick={() =>
                                    handleSaveActivityDetails(activity.id)
                                  }>
                                  <Save className='w-4 h-4 mr-1' />
                                  Save Details
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </DialogWindow>
  );
};

export default SiteDetailDialog;
