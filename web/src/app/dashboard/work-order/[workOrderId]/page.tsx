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

  // Mock data for now - replace with actual tRPC queries when backend routes are ready
  const mockWorkOrder = {
    id: Number(workOrderId),
    code: `WO-${workOrderId.padStart(4, "0")}`,
    title: "Office Renovation Project",
    description:
      "Complete renovation of the main office building including electrical work, plumbing, and interior design updates.",
    date: new Date().toISOString(),
    budget_amount: "500000",
    expense_amount: "325000",
    status: "pending" as const,
    cancellation_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    office: {
      id: 1,
      name: "Main Office Building",
    },
  };

  const mockSites = [
    {
      id: 1,
      name: "Main Office Building",
      address: "123 Business Park, Sector 5",
      state: "Delhi",
      city: "New Delhi",
      pincode: "110001",
      contact_person: "John Doe",
      contact_number: "+91-9876543210",
      email: "john.doe@company.com",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Warehouse Facility",
      address: "456 Industrial Area, Phase 2",
      state: "Haryana",
      city: "Gurgaon",
      pincode: "122001",
      contact_person: "Jane Smith",
      contact_number: "+91-9876543211",
      email: "jane.smith@company.com",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Branch Office",
      address: "789 Commercial Street, CBD",
      state: "Maharashtra",
      city: "Mumbai",
      pincode: "400001",
      contact_person: "Mike Johnson",
      contact_number: "+91-9876543212",
      email: "mike.johnson@company.com",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockSiteBudgets = [
    {
      site: {
        id: 1,
        name: "Main Office Building",
        address: "123 Business Park, Sector 5",
        city: "New Delhi",
        state: "Delhi",
      },
      budgets: [
        {
          id: 1,
          budget_category: {
            id: 1,
            name: "Electrical Work",
            description: "All electrical installations and repairs",
          },
          budget_amount: "80000",
          expense_amount: "50000",
          utilization_percentage: 62.5,
        },
        {
          id: 2,
          budget_category: {
            id: 2,
            name: "Plumbing",
            description: "Plumbing installations and maintenance",
          },
          budget_amount: "60000",
          expense_amount: "45000",
          utilization_percentage: 75.0,
        },
        {
          id: 3,
          budget_category: {
            id: 3,
            name: "Interior Design",
            description: "Furniture, paint, and interior decoration",
          },
          budget_amount: "120000",
          expense_amount: "78000",
          utilization_percentage: 65.0,
        },
      ],
      siteTotalBudget: 260000,
      siteTotalExpense: 173000,
      siteTotalUtilization: 66.5,
    },
    {
      site: {
        id: 2,
        name: "Warehouse Facility",
        address: "456 Industrial Area, Phase 2",
        city: "Gurgaon",
        state: "Haryana",
      },
      budgets: [
        {
          id: 4,
          budget_category: {
            id: 1,
            name: "Electrical Work",
            description: "All electrical installations and repairs",
          },
          budget_amount: "40000",
          expense_amount: "25000",
          utilization_percentage: 62.5,
        },
        {
          id: 5,
          budget_category: {
            id: 4,
            name: "Materials",
            description: "Raw materials and supplies",
          },
          budget_amount: "30000",
          expense_amount: "15000",
          utilization_percentage: 50.0,
        },
        {
          id: 6,
          budget_category: {
            id: 5,
            name: "Security Systems",
            description: "CCTV, access control, and security equipment",
          },
          budget_amount: "50000",
          expense_amount: "32000",
          utilization_percentage: 64.0,
        },
      ],
      siteTotalBudget: 120000,
      siteTotalExpense: 72000,
      siteTotalUtilization: 60.0,
    },
    {
      site: {
        id: 3,
        name: "Branch Office",
        address: "789 Commercial Street, CBD",
        city: "Mumbai",
        state: "Maharashtra",
      },
      budgets: [
        {
          id: 7,
          budget_category: {
            id: 1,
            name: "Electrical Work",
            description: "All electrical installations and repairs",
          },
          budget_amount: "30000",
          expense_amount: "20000",
          utilization_percentage: 66.7,
        },
        {
          id: 8,
          budget_category: {
            id: 2,
            name: "Plumbing",
            description: "Plumbing installations and maintenance",
          },
          budget_amount: "20000",
          expense_amount: "15000",
          utilization_percentage: 75.0,
        },
        {
          id: 9,
          budget_category: {
            id: 3,
            name: "Interior Design",
            description: "Furniture, paint, and interior decoration",
          },
          budget_amount: "80000",
          expense_amount: "52000",
          utilization_percentage: 65.0,
        },
      ],
      siteTotalBudget: 130000,
      siteTotalExpense: 87000,
      siteTotalUtilization: 66.9,
    },
  ];

  // Mock site activities and expenses data
  const mockSiteActivities = [
    {
      site_id: 1, // Main Office Building
      activities: [
        {
          id: 1,
          budget_category: {
            id: 1,
            name: "Electrical Work",
            description: "All electrical installations and repairs",
          },
          activities: [
            {
              id: 1,
              name: "Install Main Electrical Panel",
              description:
                "Install and configure the main electrical distribution panel",
              status: "completed" as const,
              start_date: "2024-01-15T00:00:00Z",
              end_date: "2024-01-20T00:00:00Z",
              budget_amount: "25000",
              expense_amount: "25000",
              utilization_percentage: 100.0,
              expenses: [
                {
                  id: 1,
                  amount: "15000",
                  description: "Electrical panel purchase",
                  expense_date: "2024-01-16T00:00:00Z",
                  category: "Equipment",
                  receipt_number: "RCP-001",
                },
                {
                  id: 2,
                  amount: "10000",
                  description: "Installation labor cost",
                  expense_date: "2024-01-18T00:00:00Z",
                  category: "Labor",
                  receipt_number: "RCP-002",
                },
              ],
            },
            {
              id: 2,
              name: "Wiring Installation",
              description: "Install electrical wiring throughout the building",
              status: "pending" as const,
              start_date: "2024-01-25T00:00:00Z",
              end_date: "2024-02-05T00:00:00Z",
              budget_amount: "55000",
              expense_amount: "25000",
              utilization_percentage: 45.5,
              expenses: [
                {
                  id: 3,
                  amount: "25000",
                  description: "Cable and wiring materials",
                  expense_date: "2024-01-26T00:00:00Z",
                  category: "Materials",
                  receipt_number: "RCP-003",
                },
              ],
            },
          ],
        },
        {
          id: 2,
          budget_category: {
            id: 2,
            name: "Plumbing",
            description: "Plumbing installations and maintenance",
          },
          activities: [
            {
              id: 3,
              name: "Bathroom Plumbing",
              description: "Install plumbing fixtures in all bathrooms",
              status: "completed" as const,
              start_date: "2024-01-10T00:00:00Z",
              end_date: "2024-01-25T00:00:00Z",
              budget_amount: "45000",
              expense_amount: "45000",
              utilization_percentage: 100.0,
              expenses: [
                {
                  id: 4,
                  amount: "30000",
                  description: "Bathroom fixtures and fittings",
                  expense_date: "2024-01-12T00:00:00Z",
                  category: "Fixtures",
                  receipt_number: "RCP-004",
                },
                {
                  id: 5,
                  amount: "15000",
                  description: "Plumbing installation labor",
                  expense_date: "2024-01-20T00:00:00Z",
                  category: "Labor",
                  receipt_number: "RCP-005",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      site_id: 2, // Warehouse Facility
      activities: [
        {
          id: 3,
          budget_category: {
            id: 1,
            name: "Electrical Work",
            description: "All electrical installations and repairs",
          },
          activities: [
            {
              id: 4,
              name: "Warehouse Lighting",
              description: "Install LED lighting system for warehouse",
              status: "pending" as const,
              start_date: "2024-02-01T00:00:00Z",
              end_date: "2024-02-10T00:00:00Z",
              budget_amount: "25000",
              expense_amount: "25000",
              utilization_percentage: 100.0,
              expenses: [
                {
                  id: 6,
                  amount: "20000",
                  description: "LED lights and fixtures",
                  expense_date: "2024-02-02T00:00:00Z",
                  category: "Equipment",
                  receipt_number: "RCP-006",
                },
                {
                  id: 7,
                  amount: "5000",
                  description: "Installation labor",
                  expense_date: "2024-02-05T00:00:00Z",
                  category: "Labor",
                  receipt_number: "RCP-007",
                },
              ],
            },
          ],
        },
        {
          id: 4,
          budget_category: {
            id: 5,
            name: "Security Systems",
            description: "CCTV, access control, and security equipment",
          },
          activities: [
            {
              id: 5,
              name: "CCTV Installation",
              description: "Install comprehensive CCTV surveillance system",
              status: "completed" as const,
              start_date: "2024-01-05T00:00:00Z",
              end_date: "2024-01-15T00:00:00Z",
              budget_amount: "32000",
              expense_amount: "32000",
              utilization_percentage: 100.0,
              expenses: [
                {
                  id: 8,
                  amount: "25000",
                  description: "CCTV cameras and DVR system",
                  expense_date: "2024-01-08T00:00:00Z",
                  category: "Equipment",
                  receipt_number: "RCP-008",
                },
                {
                  id: 9,
                  amount: "7000",
                  description: "Installation and configuration",
                  expense_date: "2024-01-12T00:00:00Z",
                  category: "Labor",
                  receipt_number: "RCP-009",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      site_id: 3, // Branch Office
      activities: [
        {
          id: 5,
          budget_category: {
            id: 1,
            name: "Electrical Work",
            description: "All electrical installations and repairs",
          },
          activities: [
            {
              id: 6,
              name: "Office Electrical Setup",
              description: "Complete electrical setup for office space",
              status: "pending" as const,
              start_date: "2024-02-15T00:00:00Z",
              end_date: "2024-02-28T00:00:00Z",
              budget_amount: "20000",
              expense_amount: "20000",
              utilization_percentage: 100.0,
              expenses: [
                {
                  id: 10,
                  amount: "15000",
                  description: "Electrical components and wiring",
                  expense_date: "2024-02-16T00:00:00Z",
                  category: "Materials",
                  receipt_number: "RCP-010",
                },
                {
                  id: 11,
                  amount: "5000",
                  description: "Installation labor",
                  expense_date: "2024-02-20T00:00:00Z",
                  category: "Labor",
                  receipt_number: "RCP-011",
                },
              ],
            },
          ],
        },
        {
          id: 6,
          budget_category: {
            id: 3,
            name: "Interior Design",
            description: "Furniture, paint, and interior decoration",
          },
          activities: [
            {
              id: 7,
              name: "Office Furniture Setup",
              description: "Install office furniture and workstations",
              status: "pending" as const,
              start_date: "2024-03-01T00:00:00Z",
              end_date: "2024-03-15T00:00:00Z",
              budget_amount: "52000",
              expense_amount: "32000",
              utilization_percentage: 61.5,
              expenses: [
                {
                  id: 12,
                  amount: "32000",
                  description: "Office chairs and desks",
                  expense_date: "2024-03-02T00:00:00Z",
                  category: "Furniture",
                  receipt_number: "RCP-012",
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  // Calculate stats from site budgets
  const mockStats = {
    totalSites: mockSiteBudgets.length,
    completedActivities: 8, // This would come from site activities
    totalBudgetAmount: mockSiteBudgets.reduce(
      (sum, site) => sum + site.siteTotalBudget,
      0
    ),
    totalExpenseAmount: mockSiteBudgets.reduce(
      (sum, site) => sum + site.siteTotalExpense,
      0
    ),
    budgetUtilization:
      mockSiteBudgets.reduce(
        (sum, site) => sum + site.siteTotalUtilization,
        0
      ) / mockSiteBudgets.length,
  };

  // Comment out the loading and error states for now since we're using mock data
  // const workOrderQuery = trpc.workOrderQuery.getWorkOrder.useQuery(
  //   { id: Number(workOrderId) },
  //   { enabled: !!workOrderId }
  // );

  // if (workOrderQuery.isLoading) {
  //   return <PageFetchingData title="Loading work order data" />;
  // }

  // if (workOrderQuery.isError) {
  //   return (
  //     <Wrapper
  //       title="Work Order"
  //       description="Work Order Details and Management">
  //       <div className="text-sm text-red-600">Failed to load work order.</div>
  //     </Wrapper>
  //   );
  // }

  // const workOrder = workOrderQuery.data;

  return (
    <Wrapper
      title={`${mockWorkOrder.code} - ${capitalFirstLetter(
        mockWorkOrder.title
      )}`}
      description='Work Order Details and Management'
      backClick={() => router.back()}>
      <div className='mt-4 space-y-6'>
        <WorkOrderDetailsCard workOrder={mockWorkOrder} />
        <WorkOrderStats stats={mockStats} />
        <WorkOrderSites
          sites={mockSites}
          siteActivities={mockSiteActivities}
        />
        <WorkOrderBudgets siteBudgets={mockSiteBudgets} />
      </div>
    </Wrapper>
  );
};

export default WorkOrder;
