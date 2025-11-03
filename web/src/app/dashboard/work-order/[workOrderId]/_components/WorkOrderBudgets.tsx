import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, TrendingUp, TrendingDown, MapPin } from "lucide-react";

interface Props {
  siteBudgets: Array<{
    site: {
      id: number;
      name: string;
      address: string;
      city: string;
      state: string;
    };
    budgets: Array<{
      id: number;
      budget_category: {
        id: number;
        name: string;
        description: string;
      };
      budget_amount: string;
      expense_amount: string;
      utilization_percentage: number;
    }>;
    siteTotalBudget: number;
    siteTotalExpense: number;
    siteTotalUtilization: number;
  }>;
}

const WorkOrderBudgets = ({ siteBudgets }: Props) => {
  if (!siteBudgets || siteBudgets.length === 0) {
    return (
      <Card className='shadow-sm border-[0.1rem] bg-gradient-to-br border-emerald-300 from-white to-gray-50'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
            <IndianRupee className='size-5 text-emerald-600' />
            Site Budget Distribution ({siteBudgets?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-gray-500'>
            <IndianRupee className='size-12 mx-auto mb-3 text-gray-300' />
            <p>No budget categories assigned to this work order</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  const getUtilizationIcon = (percentage: number) => {
    if (percentage >= 75) return TrendingUp;
    return TrendingDown;
  };

  return (
    <Card className='shadow-sm border-[0.1rem] bg-gradient-to-br border-emerald-300 from-white to-gray-50'>
      <CardHeader>
        <CardTitle className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
          <IndianRupee className='size-5 text-emerald-600' />
          Site Budget Distribution ({siteBudgets.length} sites)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {siteBudgets.map((siteBudget) => (
            <div
              key={siteBudget.site.id}
              className='border border-gray-200 rounded-lg bg-white overflow-hidden'>
              {/* Site Header */}
              <div className='bg-gradient-to-r from-emerald-50 to-gray-50 px-4 py-3 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-semibold text-gray-800 flex items-center gap-2'>
                      <MapPin className='size-4 text-emerald-600' />
                      {siteBudget.site.name}
                    </h3>
                    <p className='text-sm text-gray-600 mt-1'>
                      {siteBudget.site.address}, {siteBudget.site.city},{" "}
                      {siteBudget.site.state}
                    </p>
                  </div>
                  <Badge
                    variant='outline'
                    className='text-xs'>
                    Site #{siteBudget.site.id}
                  </Badge>
                </div>

                {/* Site Budget Summary */}
                <div className='mt-3 grid grid-cols-3 gap-4 text-sm'>
                  <div>
                    <span className='text-gray-500'>Total Budget:</span>
                    <p className='font-semibold text-gray-800'>
                      ₹{siteBudget.siteTotalBudget.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className='text-gray-500'>Total Spent:</span>
                    <p className='font-semibold text-gray-800'>
                      ₹{siteBudget.siteTotalExpense.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className='text-gray-500'>Utilization:</span>
                    <p
                      className={`font-semibold ${getUtilizationColor(
                        siteBudget.siteTotalUtilization
                      )}`}>
                      {siteBudget.siteTotalUtilization.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget Categories */}
              <div className='p-4 space-y-4'>
                <h4 className='font-medium text-gray-700 text-sm uppercase tracking-wide'>
                  Budget Categories
                </h4>

                {siteBudget.budgets.map((budget) => {
                  const budgetAmount = Number(budget.budget_amount);
                  const expenseAmount = Number(budget.expense_amount);
                  const remainingAmount = budgetAmount - expenseAmount;
                  const UtilizationIcon = getUtilizationIcon(
                    budget.utilization_percentage
                  );

                  return (
                    <div
                      key={budget.id}
                      className='p-3 border border-gray-100 rounded-lg bg-gray-50 hover:shadow-sm transition-shadow group'>
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <h5 className='font-medium text-gray-800 group-hover:text-emerald-700 transition-colors'>
                            {budget.budget_category.name}
                          </h5>
                          <p className='text-xs text-gray-600 mt-1'>
                            {budget.budget_category.description}
                          </p>
                        </div>
                        <Badge
                          variant='outline'
                          className='text-xs'>
                          Category #{budget.budget_category.id}
                        </Badge>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <IndianRupee className='size-3 text-gray-500' />
                            <span className='text-xs text-gray-500 uppercase tracking-wide'>
                              Budget
                            </span>
                          </div>
                          <p className='text-sm font-semibold text-gray-800'>
                            ₹{budgetAmount.toLocaleString()}
                          </p>
                        </div>

                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <IndianRupee className='size-3 text-gray-500' />
                            <span className='text-xs text-gray-500 uppercase tracking-wide'>
                              Spent
                            </span>
                          </div>
                          <p className='text-sm font-semibold text-gray-800'>
                            ₹{expenseAmount.toLocaleString()}
                          </p>
                        </div>

                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <UtilizationIcon
                              className={`size-3 ${getUtilizationColor(
                                budget.utilization_percentage
                              )}`}
                            />
                            <span className='text-xs text-gray-500 uppercase tracking-wide'>
                              Utilization
                            </span>
                          </div>
                          <p
                            className={`text-sm font-semibold ${getUtilizationColor(
                              budget.utilization_percentage
                            )}`}>
                            {budget.utilization_percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className='mt-3 pt-3 border-t border-gray-200'>
                        <div className='flex items-center justify-between text-xs mb-2'>
                          <span className='text-gray-600'>Remaining:</span>
                          <span
                            className={`font-medium ${
                              remainingAmount >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}>
                            ₹{remainingAmount.toLocaleString()}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className='w-full bg-gray-200 rounded-full h-1.5'>
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              budget.utilization_percentage >= 90
                                ? "bg-red-500"
                                : budget.utilization_percentage >= 75
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                budget.utilization_percentage,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Overall Summary */}
        <div className='mt-6 pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-4'>
          <h4 className='font-semibold text-gray-800 mb-3'>
            Work Order Budget Summary
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
            <div>
              <span className='text-gray-600'>
                Total Budget Across All Sites:
              </span>
              <p className='font-semibold text-gray-800'>
                ₹
                {siteBudgets
                  .reduce((sum, site) => sum + site.siteTotalBudget, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div>
              <span className='text-gray-600'>
                Total Spent Across All Sites:
              </span>
              <p className='font-semibold text-gray-800'>
                ₹
                {siteBudgets
                  .reduce((sum, site) => sum + site.siteTotalExpense, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div>
              <span className='text-gray-600'>Overall Utilization:</span>
              <p className='font-semibold text-gray-800'>
                {(
                  siteBudgets.reduce(
                    (sum, site) => sum + site.siteTotalUtilization,
                    0
                  ) / siteBudgets.length
                ).toFixed(1)}
                %
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderBudgets;
