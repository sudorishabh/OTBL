"use client";
import React from "react";
import Wrapper from "@/components/Wrapper";
import { trpc } from "@/lib/trpc";
import PageFetchingData from "@/components/PageFetchingData";
import { capitalFirstLetter } from "@/utils/capitalFirstLetter";
import { useRouter } from "next/navigation";
import WorkOrderDetailsCard from "./_components/WorkOrderDetailsCard";
import WorkOrderStats from "./_components/WorkOrderStats";
import WorkOrderSites from "./_components/WorkOrderSites";
import WorkOrderBudgets from "./_components/WorkOrderBudgets";

type PageProps = {
  params: Promise<{ workOrderId: string }>;
};

const WorkOrder = ({ params }: PageProps) => {
  const { workOrderId } = React.use(params);
  const router = useRouter();

  // Fetch work order details from the backend
  const workOrderQuery = trpc.workOrderQuery.getWorkOrderDetails.useQuery(
    { id: Number(workOrderId) },
    { enabled: !!workOrderId }
  );

  if (workOrderQuery.isLoading) {
    return <PageFetchingData title='Loading work order data' />;
  }

  if (workOrderQuery.isError) {
    return (
      <Wrapper
        title='Work Order'
        description='Work Order Details and Management'>
        <div className='text-sm text-red-600'>
          Failed to load work order. {workOrderQuery.error.message}
        </div>
      </Wrapper>
    );
  }

  const data = workOrderQuery.data;
  if (!data) {
    return (
      <Wrapper
        title='Work Order'
        description='Work Order Details and Management'>
        <div className='text-sm text-gray-600'>No work order found.</div>
      </Wrapper>
    );
  }

  const { workOrder, sites, stats } = data;

  // Transform sites data for the components
  const sitesForSiteComponent = sites.map((s: any) => ({
    id: s.site.id!,
    name: s.site.name!,
    address: s.site.address!,
    city: s.site.city!,
    state: s.site.state!,
    pincode: s.site.pincode!,
    contact_person: s.site.contact_person!,
    contact_number: s.site.contact_number!,
    email: s.site.email!,
    created_at: new Date().toISOString(), // Placeholder
    updated_at: new Date().toISOString(), // Placeholder
  }));

  // Transform site activities for the component
  const siteActivities = sites.map((s: any) => ({
    site_id: s.site.id!,
    activities: s.budgets.map((budget: any) => {
      const budgetActivities = s.activities.filter((act: any) =>
        act.expenses.some((exp: any) => exp.site_budget_id === budget.id)
      );

      return {
        id: budget.budget_category_id!,
        budget_category: {
          id: budget.budget_category_id!,
          name: budget.category_name!,
          description: budget.category_description!,
        },
        activities: budgetActivities.map((act: any) => {
          const activityExpenses = act.expenses.filter(
            (exp: any) => exp.site_budget_id === budget.id
          );
          const activityBudget = activityExpenses.reduce(
            (sum: number, exp: any) => sum + Number(exp.expense_amount || 0),
            0
          );

          return {
            id: act.site_activity_id!,
            name: act.activity_name!,
            description: act.activity_description || "",
            status: act.status as "completed" | "pending" | "cancelled",
            start_date: act.start_date!.toISOString(),
            end_date: act.end_date!.toISOString(),
            budget_amount: activityBudget.toString(),
            expense_amount: act.total_expense.toString(),
            utilization_percentage:
              activityBudget > 0
                ? (act.total_expense / activityBudget) * 100
                : 0,
            expenses: activityExpenses.map((exp: any) => ({
              id: exp.id!,
              amount: exp.expense_amount!.toString(),
              description: exp.description!,
              expense_date: exp.expense_date!.toISOString(),
              category: exp.category!,
              receipt_number: exp.receipt_number || "",
            })),
          };
        }),
      };
    }),
  }));

  // Transform site budgets for the component
  const siteBudgets = sites.map((s: any) => ({
    site: {
      id: s.site.id!,
      name: s.site.name!,
      address: s.site.address!,
      city: s.site.city!,
      state: s.site.state!,
    },
    budgets: s.budgets.map((budget: any) => ({
      id: budget.id!,
      budget_category: {
        id: budget.budget_category_id!,
        name: budget.category_name!,
        description: budget.category_description!,
      },
      budget_amount: budget.budget_amount!.toString(),
      expense_amount: budget.expense_amount!.toString(),
      utilization_percentage:
        Number(budget.budget_amount) > 0
          ? (Number(budget.expense_amount) / Number(budget.budget_amount)) * 100
          : 0,
    })),
    siteTotalBudget: s.site_total_budget,
    siteTotalExpense: s.site_total_expense,
    siteTotalUtilization: s.site_utilization,
  }));

  const statsForComponent = {
    totalSites: stats.total_sites,
    completedActivities: stats.completed_activities,
    totalBudgetAmount: stats.total_budget,
    totalExpenseAmount: stats.total_expense,
    budgetUtilization: stats.budget_utilization,
  };

  // Transform workOrder for the component
  const workOrderForComponent = {
    id: workOrder.id,
    code: workOrder.code,
    title: workOrder.title,
    description: workOrder.description,
    date: workOrder.start_date
      ? new Date(workOrder.start_date).toISOString()
      : new Date().toISOString(),
    budget_amount: workOrder.budget_amount?.toString() || "0",
    expense_amount: workOrder.expense_amount?.toString() || "0",
    status: workOrder.status as "pending" | "completed" | "cancelled",
    cancellation_reason: workOrder.cancellation_reason,
    created_at: workOrder.created_at
      ? new Date(workOrder.created_at).toISOString()
      : new Date().toISOString(),
    updated_at: workOrder.updated_at
      ? new Date(workOrder.updated_at).toISOString()
      : new Date().toISOString(),
    office: {
      id: workOrder.office_id,
      name: workOrder.office_name || "Unknown Office",
    },
  };

  return (
    <Wrapper
      title={`${workOrder.code} - ${capitalFirstLetter(workOrder.title)}`}
      description='Work Order Details and Management'
      backClick={() => router.back()}>
      <div className='mt-4 space-y-6'>
        <WorkOrderDetailsCard workOrder={workOrderForComponent} />
        <WorkOrderStats stats={statsForComponent} />
        <WorkOrderSites
          sites={sitesForSiteComponent}
          siteActivities={siteActivities}
        />
        <WorkOrderBudgets siteBudgets={siteBudgets} />
      </div>
    </Wrapper>
  );
};

export default WorkOrder;
