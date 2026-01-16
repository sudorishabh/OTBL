import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, FileText, IndianRupee, Building, Hash } from "lucide-react";

interface Props {
  workOrder: {
    id: number;
    code: string;
    title: string;
    description: string | null;
    date: string;
    budget_amount: string | null;
    expense_amount: string | null;
    status: "pending" | "completed" | "cancelled";
    cancellation_reason: string | null;
    created_at: string;
    updated_at: string;
    office: {
      id: number;
      name: string;
    };
  };
}

const WorkOrderDetailsCard = ({ workOrder }: Props) => {
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

  return (
    <Card className='relative shadow-sm border-[0.1rem] bg-gradient-to-br border-emerald-300 from-white to-gray-50'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
              <FileText className='size-5 text-emerald-600' />
              {workOrder.title}
            </CardTitle>
            <div className='flex items-center gap-2 mt-1'>
              <Hash className='size-3.5 text-gray-500' />
              <span className='text-sm text-gray-600 font-mono'>
                {workOrder.code}
              </span>
            </div>
          </div>
          <Badge className={`${getStatusColor(workOrder.status)} border`}>
            {workOrder.status.charAt(0).toUpperCase() +
              workOrder.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className='flex flex-wrap items-center gap-x-8 gap-y-4 text-sm'>
          <div className='flex flex-1 items-center gap-3'>
            <div className='size-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center'>
              <Building className='size-3.5 text-cyan-800' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                Office
              </div>
              <p className='text-gray-700 font-medium break-words line-clamp-1'>
                {workOrder.office.name}
              </p>
            </div>
          </div>

          <div className='hidden sm:block h-8 w-px bg-gray-200' />

          <div className='flex flex-1 items-center gap-3'>
            <div className='size-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center'>
              <Calendar className='size-3.5 text-cyan-800' />
            </div>
            <div>
              <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                Work Order Date
              </div>
              <div className='text-gray-700 font-medium'>
                {format(new Date(workOrder.date), "MMM dd, yyyy")}
              </div>
            </div>
          </div>

          <div className='hidden sm:block h-8 w-px bg-gray-200' />

          <div className='flex flex-1 items-center gap-3'>
            <div className='size-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center'>
              <IndianRupee className='size-3.5 text-cyan-800' />
            </div>
            <div>
              <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                Budget Amount
              </div>
              <div className='text-gray-700 font-medium'>
                ₹
                {workOrder.budget_amount
                  ? Number(workOrder.budget_amount).toLocaleString()
                  : "0"}
              </div>
            </div>
          </div>

          <div className='hidden sm:block h-8 w-px bg-gray-200' />

          <div className='flex flex-1 items-center gap-3 min-w-0'>
            <div className='size-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center'>
              <IndianRupee className='size-3.5 text-cyan-800' />
            </div>
            <div className='min-w-0'>
              <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                Expense Amount
              </div>
              <div className='text-gray-700 font-medium'>
                ₹
                {workOrder.expense_amount
                  ? Number(workOrder.expense_amount).toLocaleString()
                  : "0"}
              </div>
            </div>
          </div>
        </div>

        {workOrder.description && (
          <div className='mt-4 pt-4 border-t border-gray-200'>
            <div className='text-[11px] uppercase tracking-wide text-gray-500 mb-2'>
              Description
            </div>
            <p className='text-gray-700 text-sm leading-relaxed'>
              {workOrder.description}
            </p>
          </div>
        )}

        {workOrder.cancellation_reason && (
          <div className='mt-4 pt-4 border-t border-gray-200'>
            <div className='text-[11px] uppercase tracking-wide text-gray-500 mb-2'>
              Cancellation Reason
            </div>
            <p className='text-red-700 text-sm leading-relaxed bg-red-50 p-3 rounded-lg'>
              {workOrder.cancellation_reason}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkOrderDetailsCard;
