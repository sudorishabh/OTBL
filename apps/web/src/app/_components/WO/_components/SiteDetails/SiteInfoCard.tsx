"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, MapPin, User, IndianRupee, Users } from "lucide-react";
import { capitalFirstLetter } from "@pkg/utils";
import type { Site } from "./types";

type SiteInfoCardProps = {
  site: Site;
};

const SiteInfoCard: React.FC<SiteInfoCardProps> = ({ site }) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className='bg-white rounded-xl border-2 border-gray-50 shadow-sm overflow-hidden'>
      {/* Header */}
      <div className='flex items-start justify-between px-4 pt-4 pb-3'>
        <div>
          <h3 className='text font-semibold text-gray-700 line-clamp-1'>
            {capitalFirstLetter(site.name)}
          </h3>
          <div className='flex items-center space-x-1 text-xs text-gray-400 mt-1'>
            <MapPin className='h-3 w-3' />
            <span className='line-clamp-1'>
              {site.address}, {site.city}, {site.state} - {site.pincode}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-2 flex-shrink-0'>
          {site.activity_type && (
            <Badge
              variant='secondary'
              className={`text-xs ${
                site.activity_type === "insitu"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-purple-100 text-purple-700"
              }`}>
              {site.activity_type === "insitu" ? "In-Situ" : "Ex-Situ"}
            </Badge>
          )}
          <Badge
            variant='secondary'
            className={`text-xs capitalize ${statusColors[site.status]}`}>
            {site.status}
          </Badge>
        </div>
      </div>

      {/* Content Sections */}
      <div className='bg-gray-100/60 m-2.5 rounded-lg p-4 space-y-4'>
        {/* Dates & Metrics Section */}
        <TimelineMetricsSection site={site} />

        {/* Financials Section */}
        {(site.budget_amount || site.total_expense_amount) && (
          <FinancialsSection site={site} />
        )}

        {/* Assigned Operators Section */}
        {site.users && site.users.length > 0 && (
          <AssignedOperatorsSection users={site.users} />
        )}
      </div>
    </div>
  );
};

// Sub-component: Timeline & Metrics Section
const TimelineMetricsSection: React.FC<{ site: Site }> = ({ site }) => (
  <div className='space-y-2'>
    <div className='flex items-center space-x-2 mb-3'>
      <div className='p-[5px] bg-[#00d57f]/10 rounded-md'>
        <Calendar className='size-3.5 text-[#035864]' />
      </div>
      <span className='text-xs font-semibold text-gray-700 uppercase tracking-wide'>
        Timeline & Metrics
      </span>
    </div>

    <div className='ml-1 flex gap-2 flex-wrap'>
      <MetricCard
        label='Start Date'
        value={format(new Date(site.start_date), "MMM dd, yyyy")}
      />
      <MetricCard
        label='End Date'
        value={format(new Date(site.end_date), "MMM dd, yyyy")}
      />

      {site.metric_ton && (
        <MetricCard
          label='Metric Ton'
          value={`${Number(site.metric_ton).toLocaleString("en-IN")} MT`}
        />
      )}

      {site.metric_ton_rate && (
        <MetricCard
          label='Rate/MT'
          value={`₹${Number(site.metric_ton_rate).toLocaleString("en-IN")}`}
        />
      )}
    </div>
  </div>
);

// Sub-component: Financials Section
const FinancialsSection: React.FC<{ site: Site }> = ({ site }) => {
  const utilization = site.budget_amount
    ? Math.min(
        100,
        Math.round(
          ((Number(site.total_expense_amount) || 0) /
            Number(site.budget_amount)) *
            100
        )
      )
    : 0;

  const getUtilizationColor = (percent: number) => {
    if (percent > 90) return "text-red-600";
    if (percent > 70) return "text-amber-600";
    return "text-emerald-600";
  };

  const getProgressColor = (percent: number) => {
    if (percent > 90) return "bg-red-500";
    if (percent > 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className='space-y-2'>
      <div className='flex items-center space-x-2 mb-3'>
        <div className='p-[5px] bg-[#00d57f]/10 rounded-md'>
          <IndianRupee className='size-3.5 text-[#035864]' />
        </div>
        <span className='text-xs font-semibold text-gray-700 uppercase tracking-wide'>
          Financials
        </span>
      </div>

      <div className='ml-1'>
        <div className='flex gap-2 flex-wrap mb-3'>
          {site.budget_amount && (
            <div className='bg-white px-3 py-2 rounded-md shadow-sm text-xs text-gray-700 flex-1 min-w-[100px]'>
              <div className='text-[11px] text-gray-500'>Budget Amount</div>
              <div className='font-semibold text-sm text-blue-600'>
                ₹{Number(site.budget_amount).toLocaleString("en-IN")}
              </div>
            </div>
          )}

          {site.total_expense_amount && (
            <div className='bg-white px-3 py-2 rounded-md shadow-sm text-xs text-gray-700 flex-1 min-w-[100px]'>
              <div className='text-[11px] text-gray-500'>Total Expense</div>
              <div className='font-semibold text-sm text-amber-600'>
                ₹{Number(site.total_expense_amount).toLocaleString("en-IN")}
              </div>
            </div>
          )}

          {site.budget_amount && (
            <div className='bg-white px-3 py-2 rounded-md shadow-sm text-xs text-gray-700 flex-1 min-w-[100px]'>
              <div className='text-[11px] text-gray-500'>Utilization</div>
              <div
                className={`font-semibold text-sm ${getUtilizationColor(utilization)}`}>
                {utilization}%
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {site.budget_amount && Number(site.budget_amount) > 0 && (
          <div className='bg-white px-3 py-2 rounded-md shadow-sm'>
            <div className='flex justify-between text-[11px] mb-1'>
              <span className='text-gray-500'>Budget Utilization</span>
              <span className='text-gray-700 font-medium'>{utilization}%</span>
            </div>
            <div className='h-1.5 bg-gray-200 rounded-full overflow-hidden'>
              <div
                className={`h-full rounded-full transition-all ${getProgressColor(utilization)}`}
                style={{ width: `${utilization}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component: Assigned Operators Section
const AssignedOperatorsSection: React.FC<{
  users: NonNullable<Site["users"]>;
}> = ({ users }) => (
  <div className='space-y-2'>
    <div className='flex items-center space-x-2 mb-3'>
      <div className='p-[5px] bg-[#00d57f]/10 rounded-md'>
        <Users className='size-3.5 text-[#035864]' />
      </div>
      <span className='text-xs font-semibold text-gray-700 uppercase tracking-wide'>
        Assigned Operators ({users.length})
      </span>
    </div>

    <div className='ml-1 flex flex-wrap gap-2'>
      {users.map((user) => (
        <div
          key={user.user_id}
          className='bg-white px-3 py-1.5 rounded-md shadow-sm flex items-center gap-1.5'>
          <div className='w-5 h-5 rounded-full bg-[#00d57f]/10 flex items-center justify-center'>
            <User className='w-3 h-3 text-[#035864]' />
          </div>
          <span className='text-xs font-medium text-gray-700'>
            {capitalFirstLetter(user.user_name)}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// Helper component: Metric Card
const MetricCard: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className='bg-white px-3 py-2 rounded-md shadow-sm text-xs text-gray-700 flex-1 min-w-[100px]'>
    <div className='text-[11px] text-gray-500'>{label}</div>
    <div className='font-medium text-sm text-gray-800'>{value}</div>
  </div>
);

export default SiteInfoCard;
