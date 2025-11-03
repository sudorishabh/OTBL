import React from "react";
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
} from "lucide-react";
import { format } from "date-fns";
import DialogWindow from "@/components/DialogWindow";

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
}

const SiteInfoDialog = ({ open, setOpen, site, activities }: Props) => {
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
          <h3 className='font-semibold text-gray-800 mb-3 flex items-center gap-2'>
            <MapPin className='size-4 text-emerald-600' />
            Site Information
          </h3>
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
            <Button
              size='sm'
              className='flex items-center gap-2'>
              <Plus className='size-4' />
              Add Activity
            </Button>
          </div>

          {activities.map((budgetCategory) => (
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
                {budgetCategory.activities.map((activity) => (
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
                                    {Number(expense.amount).toLocaleString()}
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
                ))}
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
                    className='mt-2'>
                    Add Activity
                  </Button>
                </div>
              )}
            </div>
          ))}

          {activities.length === 0 && (
            <div className='text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200'>
              <Calendar className='size-12 mx-auto mb-3 text-gray-300' />
              <p className='text-sm'>No activities assigned to this site</p>
              <Button
                size='sm'
                variant='outline'
                className='mt-2'>
                Add First Activity
              </Button>
            </div>
          )}
        </div>
      </div>
    </DialogWindow>
  );
};

export default SiteInfoDialog;
