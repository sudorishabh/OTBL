import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Mail,
  User,
  Building2,
  Calendar,
  IndianRupee,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Layers,
} from "lucide-react";
import { format } from "date-fns";
import DialogWindow from "@/components/DialogWindow";
import AddActivityDialog from "./AddActivityDialog";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  site: {
    id: number;
    name: string;
    address: string;
    state: string;
    city: string;
    pincode: string;
    contact_person: string;
    contact_number: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
  woSiteId?: number;
  activityType?: "insitu" | "exsitu" | null;
  activities: Array<{
    id: number;
    budget_category: {
      id: number;
      name: string;
      description: string;
    };
    activities: Array<{
      id: number;
      name: string;
      description: string;
      status: "pending" | "completed" | "cancelled";
      start_date: string;
      end_date: string;
      budget_amount: string;
      expense_amount: string;
      utilization_percentage: number;
      activity_sub_type?: string | null;
      activity_specific_data?: any;
      expenses: Array<{
        id: number;
        amount: string;
        description: string;
        expense_date: string;
        category: string;
        receipt_number: string | null;
      }>;
    }>;
  }>;
  onActivityAdded?: () => void;
}

const SiteInfoDialog = ({
  open,
  setOpen,
  site,
  woSiteId,
  activityType,
  activities,
  onActivityAdded,
}: Props) => {
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);

  // Debug logging
  console.log("SiteInfoDialog props:", {
    woSiteId,
    activityType,
    hasWoSiteId: !!woSiteId,
    hasActivityType: !!activityType,
    activitiesCount: activities?.length || 0,
    activities: activities,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className='size-4 text-green-600' />;
      case "cancelled":
        return <XCircle className='size-4 text-red-600' />;
      default:
        return <Clock className='size-4 text-yellow-600' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <DialogWindow
      open={open}
      setOpen={setOpen}
      size='lg'
      title={site.name}>
      <div className='space-y-6'>
        {/* Site Information */}
        <div className='bg-gradient-to-r from-emerald-50 to-gray-50 p-4 rounded-lg border'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='font-semibold text-gray-800 flex items-center gap-2'>
              <MapPin className='size-4 text-emerald-600' />
              Site Information
            </h3>
            {activityType && (
              <Badge
                variant='outline'
                className={
                  activityType === "insitu"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }>
                <Layers className='size-3 mr-1' />
                {activityType === "insitu" ? "In-Situ" : "Ex-Situ"}
              </Badge>
            )}
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div className='flex items-start gap-3'>
              <MapPin className='size-4 text-gray-500 mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-gray-500 text-xs uppercase tracking-wide'>
                  Address
                </p>
                <p className='text-gray-700 font-medium'>{site.address}</p>
                <p className='text-gray-600'>
                  {site.city}, {site.state} - {site.pincode}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <User className='size-4 text-gray-500 mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-gray-500 text-xs uppercase tracking-wide'>
                  Contact Person
                </p>
                <p className='text-gray-700 font-medium'>
                  {site.contact_person}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Phone className='size-4 text-gray-500 mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-gray-500 text-xs uppercase tracking-wide'>
                  Phone
                </p>
                <a
                  href={`tel:${site.contact_number}`}
                  className='text-gray-700 font-medium hover:text-emerald-600 hover:underline transition-colors'>
                  {site.contact_number}
                </a>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Mail className='size-4 text-gray-500 mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-gray-500 text-xs uppercase tracking-wide'>
                  Email
                </p>
                <a
                  href={`mailto:${site.email}`}
                  className='text-gray-700 font-medium hover:text-emerald-600 hover:underline transition-colors'>
                  {site.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Activities by Budget Category */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='font-semibold text-gray-800 flex items-center gap-2'>
              <Calendar className='size-4 text-emerald-600' />
              Activities & Expenses
            </h3>
            {woSiteId && activityType && (
              <Button
                size='sm'
                className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700'
                onClick={() => setIsAddActivityOpen(true)}>
                <Plus className='size-4' />
                Add Activity
              </Button>
            )}
          </div>

          {activities && activities.length > 0 ? (
            activities.map((budgetCategory) => (
              <div
                key={budgetCategory.id}
                className='border border-gray-200 rounded-lg overflow-hidden'>
                {/* Budget Category Header */}
                <div className='bg-gray-50 px-4 py-3 border-b border-gray-200'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium text-gray-800'>
                        {budgetCategory.budget_category.name}
                      </h4>
                      <p className='text-sm text-gray-600'>
                        {budgetCategory.budget_category.description}
                      </p>
                    </div>
                    <Badge
                      variant='outline'
                      className='text-xs'>
                      {budgetCategory.activities.length} Activities
                    </Badge>
                  </div>
                </div>

                {/* Activities */}
                <div className='divide-y divide-gray-100'>
                  {budgetCategory.activities.map((activity) => {
                    console.log("Rendering activity in SiteInfoDialog:", {
                      id: activity.id,
                      name: activity.name,
                      activity_sub_type: activity.activity_sub_type,
                      activity_specific_data: activity.activity_specific_data,
                    });

                    return (
                      <div
                        key={activity.id}
                        className='p-4'>
                        <div className='flex items-start justify-between mb-3'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                              {getStatusIcon(activity.status)}
                              <h5 className='font-medium text-gray-800'>
                                {activity.name}
                              </h5>
                              <Badge
                                className={`${getStatusColor(
                                  activity.status
                                )} border text-xs`}>
                                {activity.status.charAt(0).toUpperCase() +
                                  activity.status.slice(1)}
                              </Badge>
                            </div>
                            <p className='text-sm text-gray-600 mb-2'>
                              {activity.description}
                            </p>
                            <div className='flex items-center gap-4 text-xs text-gray-500'>
                              <span className='flex items-center gap-1'>
                                <Calendar className='size-3' />
                                {format(
                                  new Date(activity.start_date),
                                  "MMM dd, yyyy"
                                )}{" "}
                                -{" "}
                                {format(
                                  new Date(activity.end_date),
                                  "MMM dd, yyyy"
                                )}
                              </span>
                            </div>

                            {/* Activity-Specific Data Display */}
                            {console.log(
                              "🔍 Checking activity_specific_data:",
                              {
                                has_data: !!activity.activity_specific_data,
                                sub_type: activity.activity_sub_type,
                                data: activity.activity_specific_data,
                              }
                            )}
                            {activity.activity_specific_data && (
                              <div className='mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200'>
                                <h6 className='text-xs font-semibold text-blue-900 mb-2'>
                                  Activity Details (Sub-type:{" "}
                                  {activity.activity_sub_type})
                                </h6>
                                <div className='grid grid-cols-2 gap-2 text-xs'>
                                  {activity.activity_sub_type ===
                                    "zero_day_activity" && (
                                    <>
                                      {console.log(
                                        "✅ Rendering zero_day_activity fields:",
                                        activity.activity_specific_data
                                      )}
                                      {activity.activity_specific_data
                                        .length_metric != null &&
                                        activity.activity_specific_data
                                          .length_metric !== "" && (
                                          <div>
                                            <span className='text-gray-600'>
                                              Length:
                                            </span>
                                            <span className='ml-1 font-medium'>
                                              {
                                                activity.activity_specific_data
                                                  .length_metric
                                              }
                                              m
                                            </span>
                                          </div>
                                        )}
                                      {activity.activity_specific_data
                                        .width_metric != null &&
                                        activity.activity_specific_data
                                          .width_metric !== "" && (
                                          <div>
                                            <span className='text-gray-600'>
                                              Width:
                                            </span>
                                            <span className='ml-1 font-medium'>
                                              {
                                                activity.activity_specific_data
                                                  .width_metric
                                              }
                                              m
                                            </span>
                                          </div>
                                        )}
                                      {activity.activity_specific_data
                                        .depth_metric != null &&
                                        activity.activity_specific_data
                                          .depth_metric !== "" && (
                                          <div>
                                            <span className='text-gray-600'>
                                              Depth:
                                            </span>
                                            <span className='ml-1 font-medium'>
                                              {
                                                activity.activity_specific_data
                                                  .depth_metric
                                              }
                                              m
                                            </span>
                                          </div>
                                        )}
                                      {activity.activity_specific_data
                                        .volume_informed != null &&
                                        activity.activity_specific_data
                                          .volume_informed !== "" && (
                                          <div>
                                            <span className='text-gray-600'>
                                              Volume:
                                            </span>
                                            <span className='ml-1 font-medium'>
                                              {
                                                activity.activity_specific_data
                                                  .volume_informed
                                              }
                                              m³
                                            </span>
                                          </div>
                                        )}
                                    </>
                                  )}

                                  {activity.activity_sub_type ===
                                    "zero_day_sample" && (
                                    <>
                                      {activity.activity_specific_data.length !=
                                        null &&
                                        activity.activity_specific_data
                                          .length !== "" && (
                                          <div>
                                            <span className='text-gray-600'>
                                              Length:
                                            </span>
                                            <span className='ml-1 font-medium'>
                                              {
                                                activity.activity_specific_data
                                                  .length
                                              }
                                              m
                                            </span>
                                          </div>
                                        )}
                                      {activity.activity_specific_data.width !=
                                        null &&
                                        activity.activity_specific_data
                                          .width !== "" && (
                                          <div>
                                            <span className='text-gray-600'>
                                              Width:
                                            </span>
                                            <span className='ml-1 font-medium'>
                                              {
                                                activity.activity_specific_data
                                                  .width
                                              }
                                              m
                                            </span>
                                          </div>
                                        )}
                                      {activity.activity_specific_data.height !=
                                        null &&
                                        activity.activity_specific_data
                                          .height !== "" && (
                                          <div>
                                            <span className='text-gray-600'>
                                              Height:
                                            </span>
                                            <span className='ml-1 font-medium'>
                                              {
                                                activity.activity_specific_data
                                                  .height
                                              }
                                              m
                                            </span>
                                          </div>
                                        )}
                                      {activity.activity_specific_data
                                        .density != null &&
                                        activity.activity_specific_data
                                          .density !== "" && (
                                          <div>
                                            <span className='text-gray-600'>
                                              Density:
                                            </span>
                                            <span className='ml-1 font-medium'>
                                              {
                                                activity.activity_specific_data
                                                  .density
                                              }
                                              kg/m³
                                            </span>
                                          </div>
                                        )}
                                      {activity.activity_specific_data
                                        .volume_m3 != null &&
                                        activity.activity_specific_data
                                          .volume_m3 !== "" && (
                                          <div>
                                            <span className='text-gray-600'>
                                              Volume:
                                            </span>
                                            <span className='ml-1 font-medium'>
                                              {
                                                activity.activity_specific_data
                                                  .volume_m3
                                              }
                                              m³
                                            </span>
                                          </div>
                                        )}
                                      {activity.activity_specific_data
                                        .final_value != null &&
                                        activity.activity_specific_data
                                          .final_value !== "" && (
                                          <div>
                                            <span className='text-gray-600'>
                                              Final Value:
                                            </span>
                                            <span className='ml-1 font-medium'>
                                              {
                                                activity.activity_specific_data
                                                  .final_value
                                              }
                                            </span>
                                          </div>
                                        )}
                                    </>
                                  )}

                                  {activity.activity_sub_type ===
                                    "tph_activity" && (
                                    <>
                                      {activity.activity_specific_data
                                        .tph_value != null &&
                                        activity.activity_specific_data
                                          .tph_value !== "" && (
                                          <div>
                                            <span className='text-gray-600'>
                                              TPH Value:
                                            </span>
                                            <span className='ml-1 font-medium'>
                                              {
                                                activity.activity_specific_data
                                                  .tph_value
                                              }
                                            </span>
                                          </div>
                                        )}
                                      {activity.activity_specific_data
                                        .lab_name != null &&
                                        activity.activity_specific_data
                                          .lab_name !== "" && (
                                          <div className='col-span-2'>
                                            <span className='text-gray-600'>
                                              Lab:
                                            </span>
                                            <span className='ml-1 font-medium'>
                                              {
                                                activity.activity_specific_data
                                                  .lab_name
                                              }
                                            </span>
                                          </div>
                                        )}
                                      {activity.activity_specific_data
                                        .sample_collection_date && (
                                        <div className='col-span-2'>
                                          <span className='text-gray-600'>
                                            Collection Date:
                                          </span>
                                          <span className='ml-1 font-medium'>
                                            {format(
                                              new Date(
                                                activity.activity_specific_data.sample_collection_date
                                              ),
                                              "MMM dd, yyyy"
                                            )}
                                          </span>
                                        </div>
                                      )}
                                    </>
                                  )}

                                  {activity.activity_sub_type ===
                                    "oil_zapper_activity" && (
                                    <>
                                      {activity.activity_specific_data
                                        .first_intimation_raised != null &&
                                        activity.activity_specific_data
                                          .first_intimation_raised !== "" && (
                                          <div>
                                            <span className='text-gray-600'>
                                              Intimation:
                                            </span>
                                            <span className='ml-1 font-medium'>
                                              {activity.activity_specific_data
                                                .first_intimation_raised ===
                                              "yes"
                                                ? "Yes"
                                                : "No"}
                                            </span>
                                          </div>
                                        )}
                                      {activity.activity_specific_data
                                        .first_intimation_date && (
                                        <div className='col-span-2'>
                                          <span className='text-gray-600'>
                                            Intimation Date:
                                          </span>
                                          <span className='ml-1 font-medium'>
                                            {format(
                                              new Date(
                                                activity.activity_specific_data.first_intimation_date
                                              ),
                                              "MMM dd, yyyy"
                                            )}
                                          </span>
                                        </div>
                                      )}
                                      {activity.activity_specific_data
                                        .activity_completed_date && (
                                        <div className='col-span-2'>
                                          <span className='text-gray-600'>
                                            Completed Date:
                                          </span>
                                          <span className='ml-1 font-medium'>
                                            {format(
                                              new Date(
                                                activity.activity_specific_data.activity_completed_date
                                              ),
                                              "MMM dd, yyyy"
                                            )}
                                          </span>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <Button
                            size='sm'
                            variant='outline'
                            className='flex items-center gap-1'>
                            <Plus className='size-3' />
                            Add Expense
                          </Button>
                        </div>

                        {/* Budget Info */}
                        <div className='grid grid-cols-3 gap-4 mb-3 text-sm'>
                          <div>
                            <span className='text-gray-500 text-xs uppercase tracking-wide'>
                              Budget
                            </span>
                            <p className='font-semibold text-gray-800 flex items-center gap-1'>
                              <IndianRupee className='size-3' />
                              {Number(activity.budget_amount).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className='text-gray-500 text-xs uppercase tracking-wide'>
                              Spent
                            </span>
                            <p className='font-semibold text-gray-800 flex items-center gap-1'>
                              <IndianRupee className='size-3' />
                              {Number(activity.expense_amount).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className='text-gray-500 text-xs uppercase tracking-wide'>
                              Utilization
                            </span>
                            <p
                              className={`font-semibold ${getUtilizationColor(
                                activity.utilization_percentage
                              )}`}>
                              {activity.utilization_percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {/* Expenses */}
                        {activity.expenses.length > 0 && (
                          <div className='mt-4'>
                            <h6 className='font-medium text-gray-700 text-sm mb-2 flex items-center gap-2'>
                              <IndianRupee className='size-3' />
                              Expenses ({activity.expenses.length})
                            </h6>
                            <div className='space-y-2'>
                              {activity.expenses.map((expense) => (
                                <div
                                  key={expense.id}
                                  className='bg-gray-50 p-3 rounded-lg border'>
                                  <div className='flex items-start justify-between'>
                                    <div className='flex-1'>
                                      <p className='text-sm font-medium text-gray-800'>
                                        {expense.description}
                                      </p>
                                      <div className='flex items-center gap-4 mt-1 text-xs text-gray-500'>
                                        <span className='flex items-center gap-1'>
                                          <Calendar className='size-3' />
                                          {format(
                                            new Date(expense.expense_date),
                                            "MMM dd, yyyy"
                                          )}
                                        </span>
                                        <span className='bg-gray-200 px-2 py-0.5 rounded text-xs'>
                                          {expense.category}
                                        </span>
                                        {expense.receipt_number && (
                                          <span className='text-gray-500'>
                                            Receipt: {expense.receipt_number}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className='text-right'>
                                      <p className='font-semibold text-gray-800 flex items-center gap-1'>
                                        <IndianRupee className='size-3' />
                                        {Number(
                                          expense.amount
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activity.expenses.length === 0 && (
                          <div className='mt-4 text-center py-4 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200'>
                            <IndianRupee className='size-8 mx-auto mb-2 text-gray-300' />
                            <p className='text-sm'>
                              No expenses recorded for this activity
                            </p>
                            <Button
                              size='sm'
                              variant='outline'
                              className='mt-2'>
                              Add First Expense
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {budgetCategory.activities.length === 0 && (
                  <div className='p-8 text-center text-gray-500'>
                    <Calendar className='size-12 mx-auto mb-3 text-gray-300' />
                    <p className='text-sm'>
                      No activities assigned to this budget category
                    </p>
                    <Button
                      size='sm'
                      variant='outline'
                      className='mt-2'
                      onClick={() => setIsAddActivityOpen(true)}>
                      Add Activity
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className='text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200'>
              <Calendar className='size-12 mx-auto mb-3 text-gray-300' />
              <p className='text-sm'>No activities assigned to this site yet</p>
              {woSiteId && activityType && (
                <Button
                  size='sm'
                  variant='outline'
                  className='mt-2'
                  onClick={() => setIsAddActivityOpen(true)}>
                  Add First Activity
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Activity Dialog */}
      {woSiteId && activityType && (
        <AddActivityDialog
          open={isAddActivityOpen}
          setOpen={setIsAddActivityOpen}
          woSiteId={woSiteId}
          activityType={activityType}
          siteName={site.name}
          onSuccess={onActivityAdded}
        />
      )}
    </DialogWindow>
  );
};

export default SiteInfoDialog;
