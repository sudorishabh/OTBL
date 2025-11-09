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

  // Transform sites data for the components with wo_site_id and activity_type
  const sitesForSiteComponent = sites.map((s: any) => ({
    id: s.site.id!,
    wo_site_id: s.wo_site_id!,
    activity_type: s.activity_type || null,
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
  const siteActivities = sites.map((s: any) => {
    // Group activities by budget category based on their expenses
    const budgetCategoriesMap = new Map();

    // Initialize budget categories
    s.budgets.forEach((budget: any) => {
      budgetCategoriesMap.set(budget.budget_category_id, {
        id: budget.budget_category_id!,
        budget_category: {
          id: budget.budget_category_id!,
          name: budget.category_name!,
          description: budget.category_description!,
        },
        activities: [],
      });
    });

    // If no budget categories exist, create a default "General" category
    if (budgetCategoriesMap.size === 0) {
      budgetCategoriesMap.set(0, {
        id: 0,
        budget_category: {
          id: 0,
          name: "General Activities",
          description: "Activities without assigned budget category",
        },
        activities: [],
      });
    }

    console.log("Site activities transformation:", {
      siteId: s.site.id,
      siteName: s.site.name,
      totalActivities: s.activities?.length || 0,
      budgetCategories: budgetCategoriesMap.size,
      rawActivities: s.activities,
    });

    // Process all activities and assign them to budget categories
    (s.activities || []).forEach((act: any) => {
      console.log("Processing activity:", {
        site_activity_id: act.site_activity_id,
        activity_name: act.activity_name,
        activity_sub_type: act.activity_sub_type,
        activity_specific_data: act.activity_specific_data,
      });

      const activityExpenses = act.expenses || [];

      // Determine which budget category this activity belongs to
      // If activity has expenses, use the budget category from the first expense
      // Otherwise, put it in the first available category
      let budgetCategoryId = null;
      if (activityExpenses.length > 0) {
        budgetCategoryId = activityExpenses[0].budget_category_id;
      }

      // If we have a budget category, add to that category
      if (budgetCategoryId && budgetCategoriesMap.has(budgetCategoryId)) {
        const activityExpenseAmount = activityExpenses.reduce(
          (sum: number, exp: any) => sum + Number(exp.expense_amount || 0),
          0
        );

        budgetCategoriesMap.get(budgetCategoryId).activities.push({
          id: act.site_activity_id!,
          name: act.activity_name!,
          description: act.activity_description || "",
          status: act.status as "completed" | "pending" | "cancelled",
          start_date: act.start_date || new Date().toISOString(),
          end_date: act.end_date || new Date().toISOString(),
          budget_amount: "0",
          expense_amount: activityExpenseAmount.toString(),
          utilization_percentage: 0,
          activity_sub_type: act.activity_sub_type,
          activity_specific_data: act.activity_specific_data || null,
          expenses: activityExpenses.map((exp: any) => ({
            id: exp.id!,
            amount: exp.expense_amount!.toString(),
            description: exp.description!,
            expense_date: exp.expense_date!.toISOString(),
            category: exp.category!,
            receipt_number: exp.receipt_number || "",
          })),
        });
      } else {
        // Activity has no expenses or budget category, add to first budget category
        const firstCategory = Array.from(budgetCategoriesMap.values())[0];
        firstCategory.activities.push({
          id: act.site_activity_id!,
          name: act.activity_name!,
          description: act.activity_description || "",
          status: act.status as "completed" | "pending" | "cancelled",
          start_date: act.start_date || new Date().toISOString(),
          end_date: act.end_date || new Date().toISOString(),
          budget_amount: "0",
          expense_amount: "0",
          utilization_percentage: 0,
          activity_sub_type: act.activity_sub_type,
          activity_specific_data: act.activity_specific_data || null,
          expenses: [],
        });
      }
    });

    return {
      site_id: s.site.id!,
      activities: Array.from(budgetCategoriesMap.values()),
    };
  });

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
