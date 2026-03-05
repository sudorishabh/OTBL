"use client";
import DialogWindow from "@/components/DialogWindow";
import useHandleParams from "@/hooks/useHandleParams";
import { trpc } from "@/lib/trpc";
import { capitalFirstLetter } from "@pkg/utils";
import { format } from "date-fns";
import {
  Search,
  FileText,
  IndianRupee,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Briefcase,
  Check,
  Link2Off,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Hash,
  FileCode,
  Calendar,
  CalendarCheck,
  Beaker,
  Shovel,
  AlignEndHorizontal,
  ExternalLink,
} from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";
import { keepPreviousData } from "@tanstack/react-query";

interface Props {
  clientId: number;
}

const ITEMS_PER_PAGE = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy");
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "approved":
    case "completed":
      return {
        icon: CheckCircle2,
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        ring: "ring-emerald-200",
        dot: "bg-emerald-500",
      };
    case "rejected":
    case "cancelled":
      return {
        icon: XCircle,
        bg: "bg-red-50",
        text: "text-red-700",
        ring: "ring-red-200",
        dot: "bg-red-500",
      };
    default:
      return {
        icon: Clock,
        bg: "bg-amber-50",
        text: "text-amber-700",
        ring: "ring-amber-200",
        dot: "bg-amber-500",
      };
  }
};

const getProcessTypeConfig = (type: string) => {
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const ProposalCardSkeleton = () => (
  <div className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse">
    <div className="flex items-stretch gap-4">
      {/* Proposal side */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 bg-gray-200 rounded" />
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="h-12 flex-1 bg-gray-100 rounded-lg" />
          <div className="h-12 flex-1 bg-gray-100 rounded-lg" />
        </div>
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </div>

      {/* Link indicator */}
      <div className="flex items-center justify-center w-10">
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>

      {/* Work order side */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-gray-200 rounded" />
          <div className="h-5 w-14 bg-gray-200 rounded-full" />
        </div>
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="h-10 flex-1 bg-gray-100 rounded-lg" />
          <div className="h-10 flex-1 bg-gray-100 rounded-lg" />
          <div className="h-10 flex-1 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ProposalWODetailsDialog = ({ clientId }: Props) => {
  const { getParam, setParam, deleteParam, deleteParams } = useHandleParams();
  const isOpen = getParam("dialog") === "proposal-wo";
  const isFull = getParam("window") === "full";

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Reset page when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setPage(1);
      setSearchQuery("");
      setDebouncedSearch("");
    }
  }, [isOpen]);

  const { data, isLoading, isFetching } =
    trpc.proposalQuery.getProposalsByClientPaginated.useQuery(
      {
        client_id: clientId,
        page,
        limit: ITEMS_PER_PAGE,
        searchQuery: debouncedSearch || undefined,
      },
      {
        enabled: isOpen && !!clientId,
        placeholderData: keepPreviousData,
      },
    );

  const proposals = data?.proposals || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const total = pagination?.total ?? 0;

  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages],
  );

  // Generate page numbers for navigation
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <DialogWindow
      open={isOpen}
      setOpen={() => deleteParams(["dialog", "window"])}
      size="2xl"
      heightFull={true}
      title="Proposals & Work Orders"
      description={`Viewing all proposals${total > 0 ? ` · ${total} total` : ""}`}
      isFullScreen={isFull}
      onToggleFullScreen={() =>
        isFull ? deleteParam("window") : setParam("window", "full")
      }>
      <div className="flex flex-col h-full">
        {/* ─── Search Bar ──────────────────────────────────────────── */}
        <div className="shrink-0 mb-5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by proposal code or title…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400
                placeholder:text-gray-400 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ─── Results ─────────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ProposalCardSkeleton key={i} />
              ))}
            </div>
          ) : proposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 text-gray-400 mb-5 shadow-sm">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-1">
                {debouncedSearch ? "No results found" : "No proposals yet"}
              </h3>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                {debouncedSearch
                  ? `No proposals matching "${debouncedSearch}". Try a different search.`
                  : "Create your first proposal to get started."}
              </p>
            </div>
          ) : (
            proposals.map(({ proposal, workOrder }: any, index: number) => {
              const proposalStatus = getStatusConfig(proposal.status);
              const ProposalStatusIcon = proposalStatus.icon;

              const woStatus = workOrder
                ? getStatusConfig(workOrder.status)
                : null;
              const WOStatusIcon = woStatus?.icon;

              const processConfig = workOrder
                ? getProcessTypeConfig(workOrder.process_type)
                : null;
              const ProcessIcon = processConfig?.icon;

              return (
                <div
                  key={proposal.id}
                  className={`group rounded-xl border bg-white shadow-sm hover:shadow-md
                    transition-all duration-300 overflow-hidden
                    ${isFetching && !isLoading ? "opacity-60" : "opacity-100"}`}
                  style={{
                    animationDelay: `${index * 60}ms`,
                    animation: "fadeInUp 0.4s ease-out both",
                  }}>
                  {/* Top accent bar */}
                  <div
                    className={`h-1 w-full ${
                      workOrder
                        ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                        : "bg-gradient-to-r from-amber-300 to-orange-300"
                    }`}
                  />

                  <div className="p-5">
                    <div className="grid grid-cols-[1fr_48px_1fr] items-stretch gap-0">
                      {/* ─── Proposal Side ───────────────────────── */}
                      <div className="pr-3">
                        {/* Header badges */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[11px] font-mono font-medium ring-1 ring-sky-200">
                            <Hash className="w-3 h-3 mr-1 opacity-60" />
                            {proposal.code}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${proposalStatus.bg} ${proposalStatus.text} ring-1 ${proposalStatus.ring}`}>
                            <ProposalStatusIcon className="w-3 h-3" />
                            {capitalFirstLetter(proposal.status)}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-3">
                          {capitalFirstLetter(proposal.title)}
                        </h4>

                        {/* Info chips */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gradient-to-r from-emerald-50/60 to-transparent px-2.5 py-2">
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">
                                Amount
                              </div>
                              <div className="text-xs font-semibold text-gray-800 truncate">
                                {proposal.proposal_amount
                                  ? formatCurrency(proposal.proposal_amount)
                                  : "—"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gradient-to-r from-blue-50/60 to-transparent px-2.5 py-2">
                            <CalendarDays className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">
                                Submitted
                              </div>
                              <div className="text-xs font-medium text-gray-800 truncate">
                                {formatDate(proposal.proposal_submission_date)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatDate(proposal.created_at)}
                          </div>
                          {proposal.document_key && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(proposal.document_key, "_blank");
                              }}
                              className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-700 transition-colors">
                              <ExternalLink className="w-3 h-3" />
                              Document
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ─── Link Indicator ──────────────────────── */}
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-full w-px border-l border-dashed border-gray-300" />
                        </div>
                        <div
                          className={`relative z-10 inline-flex items-center justify-center rounded-full border-2 bg-white p-2 shadow-sm transition-transform duration-200 group-hover:scale-110 ${
                            workOrder
                              ? "border-emerald-200 text-emerald-600"
                              : "border-gray-200 text-gray-400"
                          }`}
                          title={
                            workOrder
                              ? "Linked with Work Order"
                              : "No Work Order linked"
                          }>
                          {workOrder ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Link2Off className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {/* ─── Work Order Side ─────────────────────── */}
                      <div className="pl-3">
                        {workOrder ? (
                          <>
                            {/* Header badges */}
                            <div className="flex items-center gap-2 mb-2.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-mono font-medium ring-1 ring-emerald-200">
                                <Briefcase className="w-3 h-3 mr-1 opacity-60" />
                                {workOrder.code}
                              </span>
                              {woStatus && WOStatusIcon && (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${woStatus.bg} ${woStatus.text} ring-1 ${woStatus.ring}`}>
                                  <WOStatusIcon className="w-3 h-3" />
                                  {capitalFirstLetter(workOrder.status)}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-2">
                              {workOrder.title
                                ? capitalFirstLetter(workOrder.title)
                                : "Untitled Work Order"}
                            </h4>

                            {/* Process type */}
                            {processConfig && ProcessIcon && (
                              <div className="flex items-center gap-1.5 mb-2.5">
                                <ProcessIcon
                                  className={`w-3.5 h-3.5 ${processConfig.color}`}
                                />
                                <span
                                  className={`text-[11px] font-medium ${processConfig.color}`}>
                                  {processConfig.label}
                                </span>
                              </div>
                            )}

                            {/* Date chips */}
                            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                              <div className="flex items-center gap-1 rounded-md border border-gray-100 bg-gradient-to-r from-blue-50/40 to-transparent px-2 py-1.5">
                                <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-[8px] uppercase tracking-wider text-gray-400">
                                    Start
                                  </div>
                                  <div className="text-[10px] font-medium text-gray-700 truncate">
                                    {formatDate(workOrder.start_date)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 rounded-md border border-gray-100 bg-gradient-to-r from-orange-50/40 to-transparent px-2 py-1.5">
                                <Calendar className="w-3 h-3 text-orange-500 shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-[8px] uppercase tracking-wider text-gray-400">
                                    End
                                  </div>
                                  <div className="text-[10px] font-medium text-gray-700 truncate">
                                    {formatDate(workOrder.end_date)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 rounded-md border border-gray-100 bg-gradient-to-r from-emerald-50/40 to-transparent px-2 py-1.5">
                                <CalendarCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-[8px] uppercase tracking-wider text-gray-400">
                                    Handover
                                  </div>
                                  <div className="text-[10px] font-medium text-gray-700 truncate">
                                    {formatDate(workOrder.handing_over_date)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Meta row */}
                            <div className="flex items-center gap-3">
                              {workOrder.agreement_number && (
                                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                  <FileCode className="w-3 h-3" />
                                  Agr: {workOrder.agreement_number}
                                </div>
                              )}
                              {workOrder.document_key && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(
                                      workOrder.document_key,
                                      "_blank",
                                    );
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 transition-colors">
                                  <ExternalLink className="w-3 h-3" />
                                  Document
                                </button>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center py-4">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 text-gray-400 mb-3">
                              <Briefcase className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 mb-0.5">
                              No Work Order
                            </p>
                            <p className="text-[10px] text-gray-400 max-w-[140px]">
                              This proposal doesn't have a linked work order yet
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ─── Pagination ──────────────────────────────────────────── */}
        {totalPages > 0 && (
          <div className="shrink-0 pt-4 mt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              {/* Left side - showing info */}
              <div className="text-xs text-gray-500">
                <span className="hidden sm:inline">Showing </span>
                <span className="font-medium text-gray-700">
                  {(page - 1) * ITEMS_PER_PAGE + 1}
                </span>
                <span>–</span>
                <span className="font-medium text-gray-700">
                  {Math.min(page * ITEMS_PER_PAGE, total)}
                </span>
                <span> of </span>
                <span className="font-medium text-gray-700">{total}</span>
              </div>

              {/* Center - page numbers */}
              <div className="flex items-center gap-1">
                {/* First page */}
                <button
                  onClick={() => goToPage(1)}
                  disabled={page === 1}
                  className="hidden sm:inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
                  title="First page">
                  <ChevronsLeft className="h-4 w-4" />
                </button>

                {/* Previous */}
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
                  title="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((p, i) =>
                  p === "ellipsis" ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="flex items-center justify-center h-8 w-8 text-gray-400 text-sm">
                      ···
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p as number)}
                      className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm font-medium transition-all duration-150 ${
                        page === p
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                      }`}>
                      {p}
                    </button>
                  ),
                )}

                {/* Next */}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
                  title="Next page">
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Last page */}
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={page === totalPages}
                  className="hidden sm:inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
                  title="Last page">
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>

              {/* Right side - page count */}
              <div className="text-xs text-gray-500">
                Page{" "}
                <span className="font-medium text-gray-700">{page}</span> of{" "}
                <span className="font-medium text-gray-700">{totalPages}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyframe animation for cards */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />
    </DialogWindow>
  );
};

export default ProposalWODetailsDialog;
