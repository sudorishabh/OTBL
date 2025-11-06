import CustomButton from "@/components/CustomButton";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Plus,
  FileText,
} from "lucide-react";
import React, { useState } from "react";
import ActiveWOCard from "./ActiveWOCard";
import CompletedWOCard from "./CompletedWOCard";
import CreateWODialog from "./CreateWO/CreateWODialog";
import { trpc } from "@/lib/trpc";
import { useParams } from "next/navigation";
import NoFetchData from "@/components/NoFetchData";

type WorkOrder = {
  id: number;
  code: string;
  title: string;
  description: string | null;
  budget_amount: string | number | null;
  expense_amount: string | number | null;
  start_date: Date | string;
  status: string;
};

const OfficeWOComp = () => {
  const [isCreateWODialog, setIsCreateWODialog] = useState(false);
  const params = useParams();
  const officeId = Number(params.officeId);

  const workOrdersQuery = trpc.officeQuery.getOfficeWorkOrders.useQuery(
    { id: officeId },
    { enabled: !!officeId }
  );

  const activeWorkOrders = workOrdersQuery.data?.active || [];
  const completedWorkOrders = workOrdersQuery.data?.completed || [];

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <div className='flex gap-5'>
        <div className='w-4/6 bg-gradient-to-br from-white to-gray-50 shadow-sm py-2 px-0.5 rounded-xl border'>
          <div className='flex items-center justify-between py-2 px-4'>
            <h3 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
              <Clock className='h-4 w-4 text-amber-600' /> Active Work Orders
              {activeWorkOrders.length > 0 && (
                <span className='ml-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full'>
                  {activeWorkOrders.length}
                </span>
              )}
            </h3>
            <div className='flex items-center gap-3'>
              <CustomButton
                text='Create Work Order'
                variant='outline'
                Icon={Plus}
                onClick={() => setIsCreateWODialog(!isCreateWODialog)}
              />
              <div className='h-8 w-8 rounded-full bg-white border hover:border-0 group flex items-center justify-center hover:bg-emerald-600 relative cursor-pointer'>
                <ArrowUpRight className='h-4 w-4 text-emerald-700 group-hover:text-white' />
              </div>
            </div>
          </div>
          <div className='px-4 pb-4 pt-2 grid grid-cols-1 gap-5'>
            {activeWorkOrders.length > 0 ? (
              activeWorkOrders.map((wo: WorkOrder) => (
                <ActiveWOCard
                  key={wo.id}
                  id={wo.id}
                  title={wo.title}
                  code={wo.code}
                  description={wo.description || ""}
                  budget_amount={Number(wo.budget_amount || 0)}
                  date={formatDate(wo.start_date)}
                />
              ))
            ) : (
              <div className='py-8'>
                <NoFetchData
                  Icon={FileText}
                  title='No active work orders'
                  description='Create a new work order to get started.'
                />
              </div>
            )}
          </div>
        </div>

        <div className='w-2/6 bg-gradient-to-br from-white to-gray-50 shadow-sm py-2 px-0.5  rounded-xl border'>
          <div className='flex items-center justify-between py-2 px-4'>
            <h3 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 text-green-600' /> Completed
              {completedWorkOrders.length > 0 && (
                <span className='ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full'>
                  {completedWorkOrders.length}
                </span>
              )}
            </h3>
            <div className='h-8 w-8 rounded-full bg-white border hover:border-0 group flex items-center justify-center hover:bg-emerald-600 relative cursor-pointer'>
              <ArrowUpRight className='h-4 w-4 text-emerald-700 group-hover:text-white' />
            </div>
          </div>
          <div className='px-4 pb-4 pt-2 grid grid-cols-1 gap-5'>
            {completedWorkOrders.length > 0 ? (
              completedWorkOrders.map((wo: WorkOrder) => (
                <CompletedWOCard
                  key={wo.id}
                  title={wo.title}
                  description={wo.description || ""}
                  code={wo.code}
                  budget_amount={Number(wo.budget_amount || 0)}
                  expense_amount={Number(wo.expense_amount || 0)}
                />
              ))
            ) : (
              <div className='py-8'>
                <NoFetchData
                  Icon={CheckCircle2}
                  title='No completed work orders'
                  description='Completed work orders will appear here.'
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <CreateWODialog
        open={isCreateWODialog}
        setOpen={setIsCreateWODialog}
      />
    </>
  );
};

export default OfficeWOComp;
