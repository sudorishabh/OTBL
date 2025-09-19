"use client";
import React from "react";
import Wrapper from "@/components/Wrapper";
import { trpc } from "@/lib/trpc";
import PageFetchingData from "@/components/PageFetchingData";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Phone,
  User,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: { officeId: string };
};

const WorkOrderTable = ({
  data,
  columns,
  emptyMessage,
}: {
  data: any[];
  columns: { key: string; label: string; align?: "left" | "right" }[];
  emptyMessage: string;
}) => (
  <div className='rounded-xl border overflow-x-auto'>
    <table className='w-full text-sm'>
      <thead className='bg-gray-50 text-gray-600 sticky top-0'>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={`p-3 font-medium ${
                col.align === "right" ? "text-right" : "text-left"
              }`}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((row) => (
            <tr
              key={row.id}
              className='border-t hover:bg-gray-50'>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`p-3 ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}>
                  {col.key === "budget_amount" ||
                  col.key === "expense_amount" ? (
                    <span className='inline-flex items-center gap-1'>
                      <IndianRupee className='h-3 w-3 opacity-60' />
                      {Number(row[col.key])}
                    </span>
                  ) : col.key === "date" ? (
                    new Date(row.date).toLocaleDateString()
                  ) : (
                    row[col.key]
                  )}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={columns.length}
              className='p-4 text-center text-gray-500'>
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const Page = ({ params }: PageProps) => {
  const { officeId } = params;

  const officeQuery = trpc.office.getOffice.useQuery(
    { id: Number(officeId) },
    { enabled: !!officeId }
  );
  const workOrdersQuery = trpc.office.getOfficeWorkOrders.useQuery(
    { id: Number(officeId) },
    { enabled: !!officeId }
  );

  if (officeQuery.isLoading || workOrdersQuery.isLoading) {
    return <PageFetchingData title='Loading office data' />;
  }

  if (officeQuery.isError) {
    return (
      <Wrapper
        title='Office Info'
        description='Manage Office Info and Work Orders'>
        <div className='text-sm text-red-600'>Failed to load office.</div>
      </Wrapper>
    );
  }

  const office = officeQuery.data;
  const workOrders = workOrdersQuery.data;

  return (
    <Wrapper
      title={office?.name ?? "Office Info"}
      description='Manage Office Info and Work Orders'>
      {/* Office details */}
      {office && (
        <Card className='mt-4 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-lg font-semibold text-gray-900'>
              Office Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
              <div className='flex items-start gap-2'>
                <MapPin className='h-4 w-4 text-gray-400 mt-0.5' />
                <div>
                  <p className='text-gray-700'>{office.address}</p>
                  <p className='text-gray-500'>
                    {office.city}, {office.state} - {office.pincode}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <User className='h-4 w-4 text-gray-400' />
                <span className='text-gray-700'>{office.contact_person}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Phone className='h-4 w-4 text-gray-400' />
                <a
                  href={`tel:${office.contact_number}`}
                  className='text-green-700 hover:underline'>
                  {office.contact_number}
                </a>
              </div>
              <div className='flex items-center gap-2'>
                <Mail className='h-4 w-4 text-gray-400' />
                <a
                  href={`mailto:${office.email}`}
                  className='text-green-700 hover:underline truncate'>
                  {office.email}
                </a>
              </div>
              <div className='flex items-center gap-2'>
                <CalendarDays className='h-4 w-4 text-gray-400' />
                <span className='text-gray-700'>
                  {new Date(office.created_at as string).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work orders */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6'>
        <Card className='shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-base font-semibold text-gray-900'>
              <Clock className='h-4 w-4 text-amber-600' /> Active Work Orders
            </CardTitle>
            <Badge variant='secondary'>{workOrders?.active.length ?? 0}</Badge>
          </CardHeader>
          <CardContent>
            <WorkOrderTable
              data={workOrders?.active ?? []}
              emptyMessage='No active work orders'
              columns={[
                { key: "code", label: "Code" },
                { key: "title", label: "Title" },
                { key: "date", label: "Date" },
                { key: "budget_amount", label: "Budget", align: "right" },
              ]}
            />
          </CardContent>
        </Card>

        <Card className='shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-base font-semibold text-gray-900'>
              <CheckCircle2 className='h-4 w-4 text-green-600' /> Completed Work
              Orders
            </CardTitle>
            <Badge variant='secondary'>
              {workOrders?.completed.length ?? 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <WorkOrderTable
              data={workOrders?.completed ?? []}
              emptyMessage='No completed work orders'
              columns={[
                { key: "code", label: "Code" },
                { key: "title", label: "Title" },
                { key: "date", label: "Date" },
                { key: "expense_amount", label: "Expense", align: "right" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  );
};

export default Page;
