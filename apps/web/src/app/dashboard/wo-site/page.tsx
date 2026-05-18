"use client";

import CustomButton from "@/components/shared/btn";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { trpc, type RouterOutputs } from "@/lib/trpc";
import { format } from "date-fns";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  FileText,
  Hash,
  LogOut,
  MapPin,
  Upload,
} from "lucide-react";
import Link from "next/link";

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "cancelled":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-amber-100 text-amber-700 border-amber-200";
  }
};

type AssignedSite =
  RouterOutputs["workOrderSiteQuery"]["getMyAssignedWorkOrderSites"][number];

export default function OperatorAssignedSitesPage() {
  const { logout } = useAuthContext();
  const { data, isLoading } =
    trpc.workOrderSiteQuery.getMyAssignedWorkOrderSites.useQuery();
  const sites: AssignedSite[] = data ?? [];

  return (
    <div className='mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-6'>
      <div className='sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 border-b'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <p className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
              My assignments
            </p>
            <h1 className='text-lg sm:text-xl font-semibold text-foreground'>
              Sites assigned to me
            </h1>
            <p className='text-sm text-muted-foreground mt-1'>
              Open a site to upload measurement sheets, bills, or photos.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Badge
              variant='secondary'
              className='text-[11px]'>
              {sites.length} {sites.length === 1 ? "site" : "sites"}
            </Badge>
            <CustomButton
              type='button'
              variant='outline'
              text='Log out'
              Icon={LogOut}
              onClick={() => void logout()}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='rounded-xl border bg-card p-4 space-y-3'>
              <div className='h-4 w-3/4 rounded-md bg-muted animate-pulse' />
              <div className='h-3 w-1/2 rounded-md bg-muted/70 animate-pulse' />
              <div className='h-3 w-2/3 rounded-md bg-muted/70 animate-pulse' />
            </div>
          ))}
        </div>
      ) : sites.length === 0 ? (
        <div className='rounded-xl border bg-card p-8 text-center'>
          <FileText className='mx-auto size-8 text-muted-foreground/60' />
          <p className='mt-3 text-sm font-medium text-foreground'>
            No sites assigned yet
          </p>
          <p className='mt-1 text-xs text-muted-foreground'>
            Your office will assign you to a work order site. Check back later.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {sites.map((s) => (
            <Link
              key={s.work_order_site_id}
              href={`/dashboard/wo-site/${s.work_order_site_id}`}
              className='group rounded-xl border bg-card p-4 shadow-sm hover:border-emerald-400 hover:shadow transition-all'>
              <div className='flex items-start justify-between gap-2'>
                <div className='min-w-0'>
                  <p className='text-[10px] font-semibold text-emerald-700 uppercase tracking-wider truncate'>
                    {s.wo_code}
                  </p>
                  <h3 className='text-sm font-semibold text-foreground truncate mt-0.5'>
                    {s.site_name}
                  </h3>
                </div>
                <Badge
                  variant='outline'
                  className={`shrink-0 text-[10px] capitalize ${statusBadgeClass(s.status)}`}>
                  {s.status}
                </Badge>
              </div>

              <p className='text-[11px] text-muted-foreground mt-1 line-clamp-1'>
                {s.wo_title}
              </p>

              <div className='mt-3 space-y-1.5'>
                <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
                  <MapPin className='size-3 shrink-0' />
                  <span className='truncate'>
                    {[s.site_city, s.site_state].filter(Boolean).join(", ") ||
                      s.site_address ||
                      "—"}
                  </span>
                </div>
                <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
                  <Hash className='size-3 shrink-0' />
                  <span className='font-medium text-foreground/80'>
                    Job {s.job_number}
                  </span>
                  {s.area && (
                    <>
                      <span className='text-muted-foreground/50'>·</span>
                      <Briefcase className='size-3 shrink-0' />
                      <span className='truncate'>{s.area}</span>
                    </>
                  )}
                </div>
                <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
                  <Calendar className='size-3 shrink-0' />
                  <span>
                    {s.start_date
                      ? format(new Date(s.start_date), "dd MMM yy")
                      : "—"}
                    {" – "}
                    {s.end_date
                      ? format(new Date(s.end_date), "dd MMM yy")
                      : "—"}
                  </span>
                </div>
              </div>

              <div className='mt-3 pt-3 border-t flex items-center justify-between'>
                <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
                  <Upload className='size-3' />
                  <span>
                    {s.uploads_count}{" "}
                    {s.uploads_count === 1 ? "upload" : "uploads"}
                  </span>
                </div>
                <span className='flex items-center gap-1 text-[11px] font-medium text-emerald-700 group-hover:gap-1.5 transition-all'>
                  Open
                  <ArrowRight className='size-3' />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
