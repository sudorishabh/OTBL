"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { capitalFirstLetter } from "@pkg/utils";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  FileCode,
  Beaker,
  Shovel,
  AlignEndHorizontal,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { useHandleParams } from "@/hooks/useHandleParams";
import CustomButton from "@/components/CustomButton";

type WorkOrder = {
  id: number;
  code: string;
  title: string;
  status: string;
  process_type: string;
  start_date: string;
  end_date: string;
  agreement_number: string;
  handing_over_date: string;
  [key: string]: any;
};

type ProposalWithWO = {
  proposal: any;
  workOrder: WorkOrder | null;
};

interface Props {
  proposals: ProposalWithWO[];
}

type TabKey = "ongoing" | "completed";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusConfig = (status: string) => {
  switch (status) {
    case "completed":
      return {
        icon: CheckCircle2,
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        ring: "ring-emerald-200",
      };
    case "cancelled":
      return {
        icon: XCircle,
        bg: "bg-red-50",
        text: "text-red-700",
        ring: "ring-red-200",
      };
    default:
      return {
        icon: AlertCircle,
        bg: "bg-amber-50",
        text: "text-amber-700",
        ring: "ring-amber-200",
      };
  }
};

const getProcessIcon = (type: string) => {
  switch (type) {
    case "bioremediation":
      return { icon: Beaker, label: "Bioremediation", color: "text-emerald-600" };
    case "restoration":
      return { icon: Shovel, label: "Restoration", color: "text-green-600" };
    case "bioremediation_restoration":
      return { icon: AlignEndHorizontal, label: "Bio + Restoration", color: "text-emerald-600" };
    default:
      return { icon: FileCode, label: type, color: "text-gray-600" };
  }
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

// ─── Mini WO Card ─────────────────────────────────────────────────────────────

const MiniWOCard = ({ wo }: { wo: WorkOrder }) => {
  const router = useRouter();
  const statusConfig = getStatusConfig(wo.status);
  const StatusIcon = statusConfig.icon;
  const processConfig = getProcessIcon(wo.process_type);
  const ProcessIcon = processConfig.icon;

  return (
    <div
      onClick={() => router.push(`/dashboard/client/workorder/${wo.id}`)}
      className="group relative rounded-lg border border-gray-100 bg-white p-3 cursor-pointer
        hover:border-emerald-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Left accent */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg ${
          wo.status === "completed"
            ? "bg-emerald-400"
            : wo.status === "cancelled"
              ? "bg-red-400"
              : "bg-amber-400"
        }`}
      />

      {/* Header: code + status */}
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-mono font-medium ring-1 ring-emerald-200">
          {wo.code}
        </span>
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${statusConfig.bg} ${statusConfig.text} ring-1 ${statusConfig.ring}`}>
          <StatusIcon className="w-2.5 h-2.5" />
          {capitalFirstLetter(wo.status)}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 mb-2 group-hover:text-emerald-700 transition-colors">
        {wo.title ? capitalFirstLetter(wo.title) : "Untitled Work Order"}
      </h4>

      {/* Process type */}
      <div className="flex items-center gap-1.5 mb-2">
        <ProcessIcon className={`w-3 h-3 ${processConfig.color}`} />
        <span className={`text-[10px] font-medium ${processConfig.color}`}>
          {processConfig.label}
        </span>
      </div>

      {/* Date row */}
      <div className="flex items-center gap-3 text-[10px] text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(wo.start_date)}
        </div>
        <span className="text-gray-300">→</span>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(wo.end_date)}
        </div>
      </div>

      {/* Hover arrow */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center">
          <ArrowRight className="w-3 h-3 text-emerald-600" />
        </div>
      </div>
    </div>
  );
};

// ─── Main Panel ───────────────────────────────────────────────────────────────

const RightSidePanel = ({ proposals }: Props) => {
  const { setParam } = useHandleParams();
  const [activeTab, setActiveTab] = useState<TabKey>("ongoing");

  // Derive work orders from proposals
  const allWorkOrders = proposals
    .filter((p) => p.workOrder !== null)
    .map((p) => p.workOrder as WorkOrder);

  const ongoingWOs = allWorkOrders.filter((wo) => wo.status === "pending");
  const completedWOs = allWorkOrders.filter((wo) => wo.status === "completed");

  const tabs: { key: TabKey; label: string; count: number; icon: React.ElementType; color: string }[] = [
    {
      key: "ongoing",
      label: "Ongoing",
      count: ongoingWOs.length,
      icon: Loader2,
      color: "amber",
    },
    {
      key: "completed",
      label: "Completed",
      count: completedWOs.length,
      icon: CheckCircle2,
      color: "emerald",
    },
  ];

  const activeWOs = activeTab === "ongoing" ? ongoingWOs : completedWOs;

  return (
    <div className="w-4/12 bg-gradient-to-br from-white to-gray-50 shadow-sm py-2 px-0.5 rounded-xl border flex flex-col">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">
              Work Orders
            </h3>
          </div>
          <CustomButton   type="button" variant="arrow" arrowType="upright" onClick={() => setParam("dialog", "client-wo-stats")}/>
          {/* <button 
            title="View spending stats"
            onClick={() => setParam("dialog", "client-wo-stats")}
            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
          >
            <AlignEndHorizontal className="w-4 h-4" />
          </button> */}
        </div>

        {/* ─── Tab Toggle ───────────────────────────────────────── */}
        <div className="flex rounded-lg bg-gray-100 p-0.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                <TabIcon
                  className={`w-3.5 h-3.5 ${
                    isActive
                      ? tab.color === "amber"
                        ? "text-amber-500"
                        : "text-emerald-500"
                      : ""
                  } ${tab.key === "ongoing" && isActive ? "animate-spin" : ""}`}
                  style={
                    tab.key === "ongoing" && isActive
                      ? { animationDuration: "3s" }
                      : undefined
                  }
                />
                {tab.label}
                <span
                  className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold ${
                    isActive
                      ? tab.color === "amber"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Content ────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-2">
        {activeWOs.length > 0 ? (
          <div className="space-y-3">
            {activeWOs.map((wo) => (
              <MiniWOCard key={wo.id} wo={wo} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 text-gray-400 mb-4 shadow-sm">
              {activeTab === "ongoing" ? (
                <Clock className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              {activeTab === "ongoing"
                ? "No ongoing work orders"
                : "No completed work orders"}
            </p>
            <p className="text-xs text-gray-400 max-w-[180px]">
              {activeTab === "ongoing"
                ? "All work orders are either completed or not yet created."
                : "Work orders will appear here once they are marked as completed."}
            </p>
          </div>
        )}
      </div>

      {/* ─── Summary Footer ─────────────────────────────────────── */}
      {allWorkOrders.length > 0 && (
        <div className="shrink-0 mx-4 mb-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                {ongoingWOs.length} Ongoing
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                {completedWOs.length} Done
              </span>
            </div>
            <span className="font-medium text-gray-600">
              {allWorkOrders.length} Total
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidePanel;
