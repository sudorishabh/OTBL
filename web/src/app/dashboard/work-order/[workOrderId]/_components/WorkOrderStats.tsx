import {
  ArrowUpRight,
  MapPin,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import WorkOrderStatCard from "./WorkOrderStatCard";

interface Props {
  stats: {
    totalSites: number;
    completedActivities: number;
    totalBudgetAmount: number;
    totalExpenseAmount: number;
    budgetUtilization: number;
  };
}

const WorkOrderStats = ({ stats }: Props) => {
  const [isTotalSitesDialog, setIsTotalSitesDialog] = useState(false);
  const [isCompletedActivitiesDialog, setIsCompletedActivitiesDialog] =
    useState(false);
  const [isTotalBudgetDialog, setIsTotalBudgetDialog] = useState(false);
  const [isTotalExpenseDialog, setIsTotalExpenseDialog] = useState(false);
  const [isBudgetUtilizationDialog, setIsBudgetUtilizationDialog] =
    useState(false);

  return (
    <>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
        <WorkOrderStatCard
          Icon={MapPin}
          title='Total Sites'
          stat={Number(stats.totalSites).toLocaleString()}
          openDialog={isTotalSitesDialog}
          setOpenDialog={setIsTotalSitesDialog}
        />
        <WorkOrderStatCard
          Icon={CheckCircle2}
          title='Completed Activities'
          stat={Number(stats.completedActivities).toLocaleString()}
          openDialog={isCompletedActivitiesDialog}
          setOpenDialog={setIsCompletedActivitiesDialog}
        />
        <WorkOrderStatCard
          Icon={IndianRupee}
          title='Total Budget'
          stat={`₹${Number(stats.totalBudgetAmount).toLocaleString()}`}
          openDialog={isTotalBudgetDialog}
          setOpenDialog={setIsTotalBudgetDialog}
        />
        <WorkOrderStatCard
          Icon={IndianRupee}
          title='Total Expense'
          stat={`₹${Number(stats.totalExpenseAmount).toLocaleString()}`}
          openDialog={isTotalExpenseDialog}
          setOpenDialog={setIsTotalExpenseDialog}
        />
        <WorkOrderStatCard
          Icon={TrendingUp}
          title='Budget Utilization'
          stat={`${Number(stats.budgetUtilization).toFixed(1)}%`}
          openDialog={isBudgetUtilizationDialog}
          setOpenDialog={setIsBudgetUtilizationDialog}
        />
      </div>

      {/* Placeholder dialogs - can be implemented later */}
      {/* <TotalSitesDialog
        open={isTotalSitesDialog}
        setOpen={setIsTotalSitesDialog}
      />
      <CompletedActivitiesDialog
        open={isCompletedActivitiesDialog}
        setOpen={setIsCompletedActivitiesDialog}
      />
      <TotalBudgetDialog
        open={isTotalBudgetDialog}
        setOpen={setIsTotalBudgetDialog}
      />
      <TotalExpenseDialog
        open={isTotalExpenseDialog}
        setOpen={setIsTotalExpenseDialog}
      />
      <BudgetUtilizationDialog
        open={isBudgetUtilizationDialog}
        setOpen={setIsBudgetUtilizationDialog}
      /> */}
    </>
  );
};

export default WorkOrderStats;
