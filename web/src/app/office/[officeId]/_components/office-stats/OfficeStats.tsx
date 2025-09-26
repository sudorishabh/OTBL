import { ArrowUpRight, CheckCircle2, IndianRupee, MapPin } from "lucide-react";
import React, { useState } from "react";
import OfficeStatCard from "./OfficeStatCard";
import TotalSitesDialog from "./TotalSitesDialog";
import CompletedWODialog from "./CompletedWODialog";
import TotalBudgetDialog from "./TotalBudgetDialog";
import TotalExpenseDialog from "./TotalExpenseDialog";

interface Props {
  stats:
    | {
        siteCount: number;
        completedWorkOrders: number;
        totalBudgetAmount: number;
        totalExpenseAmount: number;
      }
    | undefined;
  officeId: string;
}

const OfficeStats = ({ stats, officeId }: Props) => {
  const [isTotolSiteDialog, setIsTotalSiteDialog] = useState(false);
  const [isCompletedWODialog, setIsCompletedWODialog] = useState(false);
  const [isTotolBudgetDialog, setIsTotalBudgetDialog] = useState(false);
  const [isTotolExpenseDialog, setIsTotalExpenseDialog] = useState(false);

  return (
    <>
      <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
        <OfficeStatCard
          Icon={MapPin}
          title='Total Sites'
          stat={stats ? Number(stats.siteCount).toLocaleString() : 0}
          openDialog={isTotolSiteDialog}
          setOpenDialog={setIsTotalSiteDialog}
        />
        <OfficeStatCard
          Icon={CheckCircle2}
          title='Completed Work Orders'
          stat={stats ? Number(stats.completedWorkOrders).toLocaleString() : 0}
          openDialog={isCompletedWODialog}
          setOpenDialog={setIsCompletedWODialog}
        />
        <OfficeStatCard
          Icon={IndianRupee}
          title='Total Budget'
          stat={stats ? Number(stats.totalBudgetAmount).toLocaleString() : 0}
          openDialog={isTotolBudgetDialog}
          setOpenDialog={setIsTotalBudgetDialog}
        />
        <OfficeStatCard
          Icon={IndianRupee}
          title='Total Expense'
          stat={stats ? Number(stats.totalExpenseAmount).toLocaleString() : 0}
          openDialog={isTotolExpenseDialog}
          setOpenDialog={setIsTotalExpenseDialog}
        />
      </div>
      <TotalSitesDialog
        open={isTotolSiteDialog}
        setOpen={setIsTotalSiteDialog}
      />
      <CompletedWODialog
        open={isCompletedWODialog}
        setOpen={setIsCompletedWODialog}
      />
      <TotalBudgetDialog
        open={isTotolBudgetDialog}
        setOpen={setIsTotalBudgetDialog}
      />
      <TotalExpenseDialog
        open={isTotolExpenseDialog}
        setOpen={setIsTotalExpenseDialog}
      />
    </>
  );
};

export default OfficeStats;
