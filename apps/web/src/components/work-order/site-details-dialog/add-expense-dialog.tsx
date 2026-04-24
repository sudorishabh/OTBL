"use client";
import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import CustomButton from "@/components/shared/btn";
import { Plus, Save } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export const EXPENSE_TYPE_LABELS: Record<string, string> = {
  contractor_payment: "Contractor Payment",
  labour: "Labour",
  material: "Material",
  equipment: "Equipment",
  miscellaneous: "Miscellaneous",
};

type ExpenseType =
  | "contractor_payment"
  | "labour"
  | "material"
  | "equipment"
  | "miscellaneous";

interface Expense {
  id: number;
  expense_type: string;
  contractor_id: number | null;
  contractor_name: string | null;
  description: string;
  amount: string;
  expense_date: string | Date;
  invoice_number: string | null;
  notes: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  workOrderSiteId: number;
  officeId: number;
  editingExpense?: Expense | null;
}

const AddExpenseDialog = ({
  open,
  onClose,
  workOrderSiteId,
  officeId,
  editingExpense,
}: Props) => {
  const utils = trpc.useUtils();

  const [expenseType, setExpenseType] = useState<ExpenseType>("miscellaneous");
  const [contractorId, setContractorId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [showAddContractor, setShowAddContractor] = useState(false);
  const [newContractorName, setNewContractorName] = useState("");
  const [newContractorContact, setNewContractorContact] = useState("");
  const [newContractorGst, setNewContractorGst] = useState("");

  const isEditing = !!editingExpense;

  useEffect(() => {
    if (editingExpense) {
      setExpenseType(editingExpense.expense_type as ExpenseType);
      setContractorId(
        editingExpense.contractor_id
          ? String(editingExpense.contractor_id)
          : "",
      );
      setDescription(editingExpense.description);
      setAmount(editingExpense.amount);
      setExpenseDate(
        format(new Date(editingExpense.expense_date), "yyyy-MM-dd"),
      );
      setInvoiceNumber(editingExpense.invoice_number ?? "");
      setNotes(editingExpense.notes ?? "");
    } else {
      setExpenseType("miscellaneous");
      setContractorId("");
      setDescription("");
      setAmount("");
      setExpenseDate(format(new Date(), "yyyy-MM-dd"));
      setInvoiceNumber("");
      setNotes("");
    }
    setShowAddContractor(false);
    setNewContractorName("");
    setNewContractorContact("");
    setNewContractorGst("");
  }, [editingExpense, open]);

  const contractorsQuery = trpc.contractorQuery.getContractors.useQuery(
    { office_id: officeId },
    { enabled: open && !!officeId },
  );

  const contractors = contractorsQuery.data?.contractors ?? [];

  const createContractorMutation =
    trpc.contractorMutation.createContractor.useMutation({
      onSuccess: (data: any) => {
        utils.contractorQuery.getContractors.invalidate({
          office_id: officeId,
        });
        setContractorId(String(data.id));
        setShowAddContractor(false);
        setNewContractorName("");
        setNewContractorContact("");
        setNewContractorGst("");
        toast.success("Contractor added");
      },
      onError: (e: any) => toast.error(e.message || "Failed to add contractor"),
    });

  const createExpenseMutation = trpc.expenseMutation.createExpense.useMutation({
    onSuccess: () => {
      utils.expenseQuery.getExpenses.invalidate({
        work_order_site_id: workOrderSiteId,
      });
      utils.expenseQuery.getExpenseSummary.invalidate({
        work_order_site_id: workOrderSiteId,
      });
      toast.success("Expense recorded");
      onClose();
    },
    onError: (e: any) => toast.error(e.message || "Failed to save expense"),
  });

  const updateExpenseMutation = trpc.expenseMutation.updateExpense.useMutation({
    onSuccess: () => {
      utils.expenseQuery.getExpenses.invalidate({
        work_order_site_id: workOrderSiteId,
      });
      utils.expenseQuery.getExpenseSummary.invalidate({
        work_order_site_id: workOrderSiteId,
      });
      toast.success("Expense updated");
      onClose();
    },
    onError: (e: any) => toast.error(e.message || "Failed to update expense"),
  });

  const handleAddContractor = () => {
    if (!newContractorName.trim()) {
      toast.error("Contractor name is required");
      return;
    }
    createContractorMutation.mutate({
      office_id: officeId,
      name: newContractorName.trim(),
      contact_number: newContractorContact.trim() || undefined,
      gst_number: newContractorGst.trim() || undefined,
    });
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("A valid positive amount is required");
      return;
    }
    if (!expenseDate) {
      toast.error("Date is required");
      return;
    }

    const payload = {
      expense_type: expenseType,
      contractor_id:
        expenseType === "contractor_payment" && contractorId
          ? Number(contractorId)
          : null,
      description: description.trim(),
      amount,
      expense_date: new Date(expenseDate).toISOString(),
      invoice_number: invoiceNumber.trim() || null,
      notes: notes.trim() || null,
    };

    if (isEditing && editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, ...payload });
    } else {
      createExpenseMutation.mutate({
        work_order_site_id: workOrderSiteId,
        ...payload,
      });
    }
  };

  const isSaving =
    createExpenseMutation.isPending || updateExpenseMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-base'>
            {isEditing ? "Edit Expense" : "Record Expense"}
          </DialogTitle>
          <DialogDescription className='text-xs text-gray-500'>
            {isEditing
              ? "Update the expense details below."
              : "Add a new expense entry for this site."}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-1'>
          {/* Expense Type */}
          <div className='space-y-1.5'>
            <Label className='text-xs font-medium text-gray-700'>
              Expense Type <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={expenseType}
              onValueChange={(v) => {
                setExpenseType(v as ExpenseType);
                if (v !== "contractor_payment") {
                  setContractorId("");
                  setShowAddContractor(false);
                }
              }}>
              <SelectTrigger className='h-9 text-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EXPENSE_TYPE_LABELS).map(([val, label]) => (
                  <SelectItem
                    key={val}
                    value={val}
                    className='text-sm'>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contractor (only for contractor_payment) */}
          {expenseType === "contractor_payment" && (
            <div className='space-y-2 border border-gray-100 rounded-lg p-3 bg-gray-50/50'>
              <Label className='text-xs font-medium text-gray-700'>
                Contractor
              </Label>
              {!showAddContractor ? (
                <div className='flex gap-2'>
                  <Select
                    value={contractorId}
                    onValueChange={setContractorId}>
                    <SelectTrigger className='h-9 text-sm flex-1'>
                      <SelectValue placeholder='Select contractor...' />
                    </SelectTrigger>
                    <SelectContent>
                      {contractors.length === 0 && (
                        <div className='px-3 py-2 text-xs text-gray-400'>
                          No contractors yet
                        </div>
                      )}
                      {contractors.map((c: any) => (
                        <SelectItem
                          key={c.id}
                          value={String(c.id)}
                          className='text-sm'>
                          {c.name}
                          {c.gst_number ? (
                            <span className='text-gray-400 ml-1'>
                              · {c.gst_number}
                            </span>
                          ) : null}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type='button'
                    onClick={() => setShowAddContractor(true)}
                    className='flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 whitespace-nowrap px-2 py-1.5 border border-blue-200 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors'>
                    <Plus className='w-3 h-3' />
                    New
                  </button>
                </div>
              ) : (
                <div className='space-y-2'>
                  <Input
                    placeholder='Contractor name *'
                    value={newContractorName}
                    onChange={(e) => setNewContractorName(e.target.value)}
                    className='h-9 text-sm'
                  />
                  <div className='grid grid-cols-2 gap-2'>
                    <Input
                      placeholder='Contact number'
                      value={newContractorContact}
                      onChange={(e) => setNewContractorContact(e.target.value)}
                      className='h-9 text-sm'
                    />
                    <Input
                      placeholder='GST number'
                      value={newContractorGst}
                      onChange={(e) => setNewContractorGst(e.target.value)}
                      className='h-9 text-sm'
                    />
                  </div>
                  <div className='flex gap-2'>
                    <CustomButton
                      text='Add Contractor'
                      variant='primary'
                      onClick={handleAddContractor}
                      loading={createContractorMutation.isPending}
                      disabled={createContractorMutation.isPending}
                      className='h-8 text-xs flex-1'
                    />
                    <button
                      type='button'
                      onClick={() => setShowAddContractor(false)}
                      className='text-xs text-gray-500 hover:text-gray-700 px-3 border rounded-md'>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className='space-y-1.5'>
            <Label className='text-xs font-medium text-gray-700'>
              Description <span className='text-red-500'>*</span>
            </Label>
            <Input
              placeholder='e.g. Excavation work, Labour charges...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='h-9 text-sm'
            />
          </div>

          {/* Amount + Date */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium text-gray-700'>
                Amount (₹) <span className='text-red-500'>*</span>
              </Label>
              <Input
                type='number'
                min='0'
                step='0.01'
                placeholder='0.00'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className='h-9 text-sm'
              />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium text-gray-700'>
                Date <span className='text-red-500'>*</span>
              </Label>
              <Input
                type='date'
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className='h-9 text-sm'
              />
            </div>
          </div>

          {/* Invoice Number */}
          <div className='space-y-1.5'>
            <Label className='text-xs font-medium text-gray-700'>
              Invoice / Bill Number{" "}
              <span className='text-gray-400'>(optional)</span>
            </Label>
            <Input
              placeholder='e.g. INV-2025-001'
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className='h-9 text-sm'
            />
          </div>

          {/* Notes */}
          <div className='space-y-1.5'>
            <Label className='text-xs font-medium text-gray-700'>
              Notes <span className='text-gray-400'>(optional)</span>
            </Label>
            <Textarea
              placeholder='Any additional notes...'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className='text-sm resize-none h-20'
            />
          </div>

          {/* Actions */}
          <div className='flex gap-2 pt-1'>
            <CustomButton
              text={isEditing ? "Save Changes" : "Record Expense"}
              variant='primary'
              Icon={Save}
              onClick={handleSubmit}
              loading={isSaving}
              disabled={isSaving}
              className='flex-1 h-9 text-sm'
            />
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-50 transition-colors'>
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;
