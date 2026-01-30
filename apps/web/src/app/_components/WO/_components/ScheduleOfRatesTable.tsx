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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  unit_rate_inclusive_gst: string;
  total_cost: string;
  transportation_km?: string | null;
}

interface Props {
  scheduleOfRates: ScheduleOfRate[];
}

const formatCurrency = (amount: string | number) => {
  const val = Number(amount);
  if (isNaN(val)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(val);
};

const ScheduleOfRatesTable = ({ scheduleOfRates }: Props) => {
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

  return (
    <DialogWindow
      size='xl'
      heightMode='fixed'
      title='View Schedule of Rates'
      open={isDialogOpen}
      setOpen={handleClose}>
      <Table>
        <TableHeader>
          <TableRow className='bg-gray-50/50 hover:bg-gray-50/50'>
            <TableHead className='font-semibold text-gray-700'>
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
              className='hover:bg-blue-50/30 transition-colors'>
              <TableCell className='font-medium text-gray-800 p-4'>
                {item.activity
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
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
                {formatCurrency(item.unit_rate_inclusive_gst)}
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
              className='text-right font-bold text-base text-gray-700'>
              Grand Total Amount
            </TableCell>
            <TableCell className='text-right font-bold text-lg text-emerald-700'>
              {formatCurrency(grandTotal)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </DialogWindow>
  );
};

export default ScheduleOfRatesTable;
