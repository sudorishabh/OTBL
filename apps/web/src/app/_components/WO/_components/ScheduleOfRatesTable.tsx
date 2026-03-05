import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReceiptIndianRupee } from "lucide-react";
import DialogWindow from "@/components/DialogWindow";
import useHandleParams from "@/hooks/useHandleParams";

interface ScheduleOfRate {
  id: number;
  activity: string;
  unit: string;
  estimated_quantity: string;
  rc_unit_rate: string;
  gst_percentage: string;
  unit_rate_inc_gst: string;
  total_cost: string;
  transportation_km?: string | null;
}

interface SiteCompletion {
  id: number;
  activity_name: string;
  estimated_quantity: string;
  amount: string;
  transportation_km?: string | null;
}

interface SiteWithCompletions {
  site: {
    name: string;
  };
  completions?: SiteCompletion[];
}

interface Props {
  scheduleOfRates: ScheduleOfRate[];
  sites: SiteWithCompletions[];
}

const formatCurrency = (amount: string | number) => {
  const val = Number(amount);
  if (isNaN(val)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(val);
};

const formatActivityName = (name: string) => {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ScheduleOfRatesTable = ({ scheduleOfRates, sites }: Props) => {
  const { getParam, deleteParam } = useHandleParams();
  const dialog = getParam("dialog");
  const isDialogOpen = dialog === "schedule-of-rates";

  const handleClose = () => {
    deleteParam("dialog");
  };

  if (!scheduleOfRates || scheduleOfRates.length === 0) {
    return null;
  }

  const grandTotal = scheduleOfRates.reduce(
    (acc, curr) => acc + Number(curr.total_cost || 0),
    0,
  );

  const totalSiteCompletions = sites?.reduce((acc: number, site) => {
    return (
      acc +
      (site.completions || []).reduce(
        (sAcc: number, comp: SiteCompletion) => sAcc + Number(comp.amount || 0),
        0,
      )
    );
  }, 0);

  return (
    <DialogWindow
      size='2xl'
      heightMode='fixed'
      title='View Schedule of Rates & Site Completion Data'
      open={isDialogOpen}
      setOpen={handleClose}>
      <div className='space-y-10 pb-10'>
        <section>
          <div className='flex items-center gap-2 mb-4 px-1'>
            <div className='p-2 bg-blue-50 rounded-lg'>
              <ReceiptIndianRupee className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h3 className='text-lg font-bold text-gray-900'>
                Schedule of Rates (SOR)
              </h3>
              <p className='text-xs text-gray-500'>
                Approved rates and estimated quantities for the work order
              </p>
            </div>
          </div>
          <div className='overflow-hidden bg-white border-0 rounded-none'>
            <Table>
              <TableHeader>
                <TableRow className='bg-gray-50/50 hover:bg-gray-50/50 border-b'>
                  <TableHead className='font-semibold text-gray-700 py-4'>
                    Activity
                  </TableHead>
                  <TableHead className='font-semibold text-gray-700 text-center'>
                    Unit
                  </TableHead>
                  <TableHead className='font-semibold text-gray-700 text-right'>
                    Est. Qty
                  </TableHead>
                  <TableHead className='font-semibold text-gray-700 text-right'>
                    RC Rate
                  </TableHead>
                  <TableHead className='font-semibold text-gray-700 text-center'>
                    GST
                  </TableHead>
                  <TableHead className='font-semibold text-gray-700 text-right'>
                    Rate (Inc. GST)
                  </TableHead>
                  <TableHead className='font-semibold text-gray-700 text-right text-nowrap'>
                    Trans. Km
                  </TableHead>
                  <TableHead className='font-semibold text-gray-700 text-right'>
                    Total Cost
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleOfRates.map((item) => (
                  <TableRow
                    key={item.id}
                    className='hover:bg-blue-50/30 transition-colors border-b last:border-0'>
                    <TableCell className='font-medium text-gray-800 p-4'>
                      {formatActivityName(item.activity)}
                    </TableCell>
                    <TableCell className='text-center'>
                      <Badge
                        variant='outline'
                        className='bg-gray-100 text-gray-600 font-normal'>
                        {item.unit}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right font-mono text-gray-600'>
                      {item.estimated_quantity}
                    </TableCell>
                    <TableCell className='text-right font-mono text-gray-600'>
                      {formatCurrency(item.rc_unit_rate)}
                    </TableCell>
                    <TableCell className='text-center font-mono text-gray-600'>
                      {Number(item.gst_percentage)}%
                    </TableCell>
                    <TableCell className='text-right font-mono text-gray-600'>
                      {formatCurrency(item.unit_rate_inc_gst)}
                    </TableCell>
                    <TableCell className='text-right font-mono text-gray-600'>
                      {item.transportation_km ? (
                        <span>{item.transportation_km} km</span>
                      ) : (
                        <span className='text-gray-300'>-</span>
                      )}
                    </TableCell>
                    <TableCell className='text-right font-semibold text-gray-800'>
                      {formatCurrency(item.total_cost)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter className='bg-slate-50 border-t-2 border-slate-100'>
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-right font-bold text-base text-gray-700 py-4'>
                    SOR Grand Total
                  </TableCell>
                  <TableCell className='text-right font-bold text-lg text-emerald-700'>
                    {formatCurrency(grandTotal)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </section>

        <section>
          <div className='flex items-center gap-2 mb-4 px-1'>
            <div className='p-2 bg-emerald-50 rounded-lg'>
              <ReceiptIndianRupee className='w-5 h-5 text-emerald-600' />
            </div>
            <div>
              <h3 className='text-lg font-bold text-gray-900'>
                Site-wise Activity Completion
              </h3>
              <p className='text-xs text-gray-500'>
                Detailed breakdown of actual completion data recorded across all
                sites
              </p>
            </div>
          </div>
          <div className='border rounded-xl overflow-hidden bg-white shadow-sm'>
            <Table>
              <TableHeader>
                <TableRow className='bg-gray-50/50 hover:bg-gray-50/50 border-b'>
                  <TableHead className='font-semibold text-gray-700 py-4'>
                    Site Name
                  </TableHead>
                  <TableHead className='font-semibold text-gray-700'>
                    Activity
                  </TableHead>
                  <TableHead className='font-semibold text-gray-700 text-right'>
                    Quantity
                  </TableHead>
                  <TableHead className='font-semibold text-gray-700 text-right'>
                    Trans. Km
                  </TableHead>
                  <TableHead className='font-semibold text-gray-700 text-right'>
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites?.some((s) => (s.completions || []).length > 0) ? (
                  sites.map((site) =>
                    (site.completions || []).map((comp, idx) => (
                      <TableRow
                        key={`${site.site.name}-${comp.id}-${idx}`}
                        className='hover:bg-emerald-50/30 transition-colors border-b last:border-0'>
                        <TableCell className='font-medium text-gray-800 p-4'>
                          {idx === 0 ? site.site.name : ""}
                        </TableCell>
                        <TableCell className='text-gray-600'>
                          {formatActivityName(comp.activity_name)}
                        </TableCell>
                        <TableCell className='text-right font-mono text-gray-600'>
                          {comp.estimated_quantity}
                        </TableCell>
                        <TableCell className='text-right font-mono text-gray-600'>
                          {comp.transportation_km ? (
                            <span>{comp.transportation_km} km</span>
                          ) : (
                            <span className='text-gray-300'>-</span>
                          )}
                        </TableCell>
                        <TableCell className='text-right font-semibold text-gray-800'>
                          {formatCurrency(comp.amount)}
                        </TableCell>
                      </TableRow>
                    )),
                  )
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='text-center py-8 text-gray-400 italic'>
                      No completion data recorded for any site yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter className='bg-emerald-50/50 border-t-2 border-emerald-100'>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className='text-right font-bold text-base text-emerald-900 py-4'>
                    Total Site Completion Amount
                  </TableCell>
                  <TableCell className='text-right font-bold text-lg text-emerald-700'>
                    {formatCurrency(totalSiteCompletions)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </section>
      </div>
    </DialogWindow>
  );
};

export default ScheduleOfRatesTable;
