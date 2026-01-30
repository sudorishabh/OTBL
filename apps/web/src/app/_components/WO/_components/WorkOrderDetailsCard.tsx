import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, FileText, Building, Hash, ExternalLink } from "lucide-react";

interface Props {
  workOrder: {
    id: number;
    code: string;
    title: string;
    description: string | null;
    date: string;
    process_type?: string | null;
    rate_contract_number?: string | null;
    document_key?: string | null;
    agreement_number?: string | null;
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
    <Card className='relative shadow-sm border-[0.1rem] bg-linear-to-br border-emerald-300 from-white to-gray-50'>
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
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm'>
          <div className='flex items-center gap-3'>
            <div className='size-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0'>
              <Building className='size-4 text-cyan-800' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                Office
              </div>
              <p className='text-gray-700 font-medium break-words'>
                {workOrder.office.name}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='size-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0'>
              <Calendar className='size-4 text-cyan-800' />
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

          <div className='flex items-center gap-3'>
            <div className='size-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0'>
              <FileText className='size-4 text-cyan-800' />
            </div>
            <div>
              <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                Process Type
              </div>
              <div className='text-gray-700 font-medium capitalize'>
                {workOrder.process_type || "N/A"}
              </div>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='size-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0'>
              <Hash className='size-4 text-cyan-800' />
            </div>
            <div>
              <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                Agreement Number
              </div>
              <div className='text-gray-700 font-medium'>
                {workOrder.agreement_number || "N/A"}
              </div>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='size-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0'>
              <Hash className='size-4 text-cyan-800' />
            </div>
            <div>
              <div className='text-[11px] uppercase tracking-wide text-gray-500'>
                Rate Contract Number
              </div>
              <div className='text-gray-700 font-medium'>
                {workOrder.rate_contract_number || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* PDF Document Link - Prominent Section */}
        {workOrder.document_key && (
          <div className='mt-6 p-4 rounded-xl bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/60 shadow-sm'>
            <div className='flex items-center justify-between gap-4 flex-wrap'>
              <div className='flex items-center gap-3'>
                <div className='size-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-md'>
                  <FileText className='size-5 text-white' />
                </div>
                <div>
                  <div className='text-xs font-medium text-emerald-700 uppercase tracking-wide'>
                    Work Order Document
                  </div>
                  <div className='text-sm text-gray-600 max-w-xs truncate'>
                    {workOrder.document_key}
                  </div>
                </div>
              </div>
              <a
                href={workOrder.document_key}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'>
                <span>View PDF</span>
                <ExternalLink className='size-4' />
              </a>
            </div>
          </div>
        )}

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
