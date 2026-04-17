import { CheckCircle2, IndianRupee, MapPin } from "lucide-react";
import React, { useState } from "react";
import ClientStatCard from "./client-stat-card";
import TotalSitesDialog from "./client-stats-dialogs/total-sites-dialog";
import CompletedWODialog from "./client-stats-dialogs/completed-wo-dialog";
import TotalBudgetDialog from "./client-stats-dialogs/total-budget-dialog";
import TotalExpenseDialog from "./client-stats-dialogs/total-expense-dialog";

interface Props {
  stats:
    | {
        siteCount: number;
        completedWorkOrders: number;
        totalBudgetAmount: number;
        totalExpenseAmount: number;
      }
    | undefined;
  clientId: string;
}

const ClientStats = ({ stats, clientId }: Props) => {
  const [isTotalSiteDialog, setIsTotalSiteDialog] = useState(false);
  const [isCompletedWODialog, setIsCompletedWODialog] = useState(false);
  const [isTotalBudgetDialog, setIsTotalBudgetDialog] = useState(false);
  const [isTotalExpenseDialog, setIsTotalExpenseDialog] = useState(false);

  return (
    <>
      <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
        <ClientStatCard
          Icon={MapPin}
          title='Total Sites'
          stat={stats ? Number(stats.siteCount).toLocaleString() : 0}
          openDialog={isTotalSiteDialog}
          setOpenDialog={setIsTotalSiteDialog}
        />
        <ClientStatCard
          Icon={CheckCircle2}
          title='Completed Work Orders'
          stat={stats ? Number(stats.completedWorkOrders).toLocaleString() : 0}
          openDialog={isCompletedWODialog}
          setOpenDialog={setIsCompletedWODialog}
        />
        <ClientStatCard
          Icon={IndianRupee}
          title='Total Budget'
          stat={stats ? Number(stats.totalBudgetAmount).toLocaleString() : 0}
          openDialog={isTotalBudgetDialog}
          setOpenDialog={setIsTotalBudgetDialog}
        />
        <ClientStatCard
          Icon={IndianRupee}
          title='Total Expense'
          stat={stats ? Number(stats.totalExpenseAmount).toLocaleString() : 0}
          openDialog={isTotalExpenseDialog}
          setOpenDialog={setIsTotalExpenseDialog}
        />
      </div>
      <TotalSitesDialog
        open={isTotalSiteDialog}
        setOpen={setIsTotalSiteDialog}
      />
      <CompletedWODialog
        open={isCompletedWODialog}
        setOpen={setIsCompletedWODialog}
      />
      <TotalBudgetDialog
        open={isTotalBudgetDialog}
        setOpen={setIsTotalBudgetDialog}
      />
      <TotalExpenseDialog
        open={isTotalExpenseDialog}
        setOpen={setIsTotalExpenseDialog}
      />
    </>
  );
};

export default ClientStats;
