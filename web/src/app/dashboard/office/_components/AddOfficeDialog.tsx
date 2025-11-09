import DialogWindow from "@/components/DialogWindow";
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import CustomButton from "@/components/CustomButton";
import CustomForm from "@/components/CustomForm";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Mail, Phone } from "lucide-react";

const addOfficeSchema = z.object({
  name: z.string().min(1, { message: "Office name is required." }),
  address: z.string().min(1, { message: "Office Address is required." }),
  state: z.string().min(1, { message: "Office State is required." }),
  city: z.string().min(1, { message: "Office City is required." }),
  gst_number: z.string().min(1, { message: "GST number is required." }).max(15),
  pincode: z
    .string()
    .min(1, { message: "Office Pincode is required." })
    .max(10),
  contact_person: z
    .string()
    .min(1, { message: "Office Contact person is required." }),
  contact_number: z
    .string()
    .min(1, { message: "Contact number is required." })
    .max(15),
  email: z.string().email({ message: "Invalid email address." }),
  manager_id: z.string().optional(),
});

export const workOrderFormSchema = z
  .object({
    code: z.string().min(1, { message: "Code is required" }),
    title: z.string().min(1, { message: "Title is required" }),

    // Client selection
    clientMode: z.enum(["existing", "new"]),
    client_id: z.string().optional(),
    newClient: z
      .object({
        name: z.string().min(1, { message: "Client name is required" }),
        address: z.string().min(1, { message: "Address is required" }),
        state: z.string().min(1, { message: "State is required" }),
        city: z.string().min(1, { message: "City is required" }),
        pincode: z.string().min(1, { message: "Pincode is required" }).max(10),
        gst_number: z
          .string()
          .min(1, { message: "GST number is required" })
          .max(15),
        contact_number: z
          .string()
          .min(1, { message: "Contact number is required" })
          .max(15),
        email: z.string().email({ message: "Valid email is required" }),
      })
      .optional(),

    // Dates
    start_date: z.string().min(1, { message: "Start date is required" }),
    end_date: z.string().min(1, { message: "End date is required" }),
    handing_over_date: z
      .string()
      .min(1, { message: "Handing over date is required" }),

    // Agreement details
    agreement_number: z
      .string()
      .min(1, { message: "Agreement number is required" }),
    agreement_url: z.string().optional(),

    // Metrics (optional)
    metric_ton: z.string().optional(),
    metric_ton_rate: z.string().optional(),

    description: z.string().min(1, { message: "Description is required" }),
    budget_amount: z.string().min(1, { message: "Budget is required" }),
    expense_amount: z.string().default("0"),
    status: z.enum(["pending", "completed", "cancelled"]).default("pending"),

    // Site selection
    siteMode: z.enum(["existing", "new"]),
    site_ids: z.array(z.string()).optional(),
    newSites: z
      .array(
        z.object({
          name: z.string().min(1, { message: "Site name is required" }),
          address: z.string().min(1, { message: "Address is required" }),
          state: z.string().min(1, { message: "State is required" }),
          city: z.string().min(1, { message: "City is required" }),
          pincode: z
            .string()
            .min(1, { message: "Pincode is required" })
            .max(10),
          contact_person: z
            .string()
            .min(1, { message: "Contact person is required" }),
          contact_number: z
            .string()
            .min(1, { message: "Contact number is required" })
            .max(15),
          email: z.email({ message: "Valid email is required" }),
        })
      )
      .optional(),

    // Activity type for sites
    activity_type: z.enum(["insitu", "exsitu"]).optional(),
  })
  .superRefine((val, ctx) => {
    // Validate client selection
    if (val.clientMode === "existing") {
      if (!val.client_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["client_id"],
          message: "Select a client",
        });
      }
    } else if (val.clientMode === "new") {
      if (!val.newClient) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newClient"],
          message: "Client details are required",
        });
      }
    }

    // Validate dates
    if (val.start_date && val.end_date) {
      const start = new Date(val.start_date);
      const end = new Date(val.end_date);
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: "End date must be after start date",
        });
      }
    }

    if (val.start_date && val.handing_over_date) {
      const start = new Date(val.start_date);
      const handingOver = new Date(val.handing_over_date);
      if (handingOver < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["handing_over_date"],
          message: "Handing over date must be after start date",
        });
      }
    }

    // Validate site selection
    if (val.siteMode === "existing") {
      const ids = val.site_ids ?? [];
      if (ids.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["site_ids"],
          message: "Select at least one site",
        });
      }
    } else if (val.siteMode === "new") {
      const list = val.newSites ?? [];
      if (list.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newSites"],
          message: "Add at least one site",
        });
      }
      list.forEach((site, index) => {
        const requiredFields: Array<keyof typeof site> = [
          "name",
          "address",
          "state",
          "city",
          "pincode",
          "contact_person",
          "contact_number",
          "email",
        ];
        requiredFields.forEach((key) => {
          const value = (site as Record<string, unknown>)[key];
          const isEmpty =
            value === undefined ||
            value === null ||
            String(value).trim() === "";
          if (isEmpty) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["newSites", index, key as string],
              message: "This field is required",
            });
          }
        });
      });
    }
  });

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AddOfficeDialog = ({ open, setOpen }: Props) => {
  const [step, setStep] = useState(1);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(
    null
  );
  const [selectedOperators, setSelectedOperators] = useState<number[]>([]);
  const utils = trpc.useUtils();

  const form = useForm<z.infer<typeof addOfficeSchema>>({
    resolver: zodResolver(addOfficeSchema),
    defaultValues: {
      name: "",
      address: "",
      state: "",
      city: "",
      gst_number: "",
      pincode: "",
      contact_person: "",
      contact_number: "",
      email: "",
      manager_id: "",
    },
  });

  // Get managers and operators for office assignment
  const { data: staffData } = trpc.userQuery.getManagersAndOperators.useQuery();

  console.log("Staff data fetched for office assignment:", staffData);

  const managers = staffData?.managers;
  const operators = staffData?.operators;

  const addOffice = trpc.officeMutation.addOffice.useMutation({
    onSuccess: () => {
      utils.officeQuery.getOfficesPaginated.invalidate();
    },
  });

  async function onSubmit(values: z.infer<typeof addOfficeSchema>) {
    await addOffice.mutateAsync({
      ...values,
      manager_id: selectedManagerId || undefined,
      operator_ids:
        selectedOperators.length > 0 ? selectedOperators : undefined,
    });
    setOpen(false);
    form.reset();
    setSelectedManagerId(null);
    setSelectedOperators([]);
    setStep(1);
  }

  const handleNext = async () => {
    // Validate step 1 fields
    const step1Fields = [
      "name",
      "address",
      "state",
      "city",
      "gst_number",
      "pincode",
      "contact_person",
      "contact_number",
      "email",
    ] as const;

    const isValid = await form.trigger(step1Fields);
    if (isValid) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleClose = () => {
    setOpen(false);
    form.reset();
    setSelectedManagerId(null);
    setSelectedOperators([]);
    setStep(1);
  };

  const toggleOperator = (userId: number) => {
    if (selectedOperators.includes(userId)) {
      setSelectedOperators(selectedOperators.filter((id) => id !== userId));
    } else {
      setSelectedOperators([...selectedOperators, userId]);
    }
  };

  return (
    <DialogWindow
      open={open}
      setOpen={handleClose}
      title={
        step === 1 ? "Add Office - Basic Details" : "Add Office - Assign Staff"
      }
      description={
        step === 1
          ? "Enter the office details."
          : "Assign manager and operators to the office (optional)."
      }
      size='sm'>
      <Form {...form}>
        <CustomForm onSubmit={form.handleSubmit(onSubmit)}>
          {step === 1 && (
            <>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Office Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter office name'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter address'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter state'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter city'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='pincode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter pincode'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='gst_number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter GST number'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='contact_person'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter contact person'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='contact_number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter contact number'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter email'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CustomButton
                className='w-full'
                type='button'
                text='Next'
                variant='primary'
                onClick={handleNext}
              />
            </>
          )}

          {step === 2 && (
            <>
              {/* Manager Selection */}
              <div className='space-y-3'>
                <div>
                  <h3 className='text-sm font-semibold text-gray-700 mb-2'>
                    Select Office Manager (Optional)
                  </h3>
                  <p className='text-xs text-gray-500 mb-3'>
                    Choose one manager for this office
                  </p>
                </div>

                <div className='space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2'>
                  {managers && managers.length > 0 ? (
                    managers.map((user: any) => (
                      <div
                        key={user.id}
                        onClick={() =>
                          setSelectedManagerId(
                            user.id === selectedManagerId ? null : user.id
                          )
                        }
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedManagerId === user.id
                            ? "border-[#035864] bg-[#035864]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <div className='mt-0.5'>
                          {selectedManagerId === user.id ? (
                            <CheckCircle2 className='h-5 w-5 text-[#035864]' />
                          ) : (
                            <Circle className='h-5 w-5 text-gray-400' />
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <p className='text-sm font-medium text-gray-900'>
                              {user.name}
                            </p>
                            <Badge
                              variant='outline'
                              className='text-xs'>
                              {user.role}
                            </Badge>
                          </div>
                          <div className='flex items-center gap-1 text-xs text-gray-600 mt-1'>
                            <Mail className='h-3 w-3' />
                            <span>{user.email}</span>
                          </div>
                          {user.contact_number && (
                            <div className='flex items-center gap-1 text-xs text-gray-600 mt-0.5'>
                              <Phone className='h-3 w-3' />
                              <span>{user.contact_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-sm text-gray-500 text-center py-4'>
                      No managers available
                    </p>
                  )}
                </div>
              </div>

              {/* Operators Selection */}
              <div className='space-y-3'>
                <div>
                  <h3 className='text-sm font-semibold text-gray-700 mb-2'>
                    Select Office Operators (Optional)
                  </h3>
                  <p className='text-xs text-gray-500 mb-3'>
                    Choose multiple operators for this office
                  </p>
                </div>

                <div className='space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2'>
                  {operators && operators.length > 0 ? (
                    operators.map((user: any) => (
                      <div
                        key={user.id}
                        onClick={() => toggleOperator(user.id)}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedOperators.includes(user.id)
                            ? "border-[#00d57f] bg-[#00d57f]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <div className='mt-0.5'>
                          {selectedOperators.includes(user.id) ? (
                            <CheckCircle2 className='h-5 w-5 text-[#00d57f]' />
                          ) : (
                            <Circle className='h-5 w-5 text-gray-400' />
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <p className='text-sm font-medium text-gray-900'>
                              {user.name}
                            </p>
                            <Badge
                              variant='outline'
                              className='text-xs'>
                              {user.role}
                            </Badge>
                          </div>
                          <div className='flex items-center gap-1 text-xs text-gray-600 mt-1'>
                            <Mail className='h-3 w-3' />
                            <span>{user.email}</span>
                          </div>
                          {user.contact_number && (
                            <div className='flex items-center gap-1 text-xs text-gray-600 mt-0.5'>
                              <Phone className='h-3 w-3' />
                              <span>{user.contact_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-sm text-gray-500 text-center py-4'>
                      No operators available
                    </p>
                  )}
                </div>

                {/* Summary */}
                {selectedOperators.length > 0 && (
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                    <p className='text-xs font-medium text-blue-900'>
                      {selectedOperators.length} operator
                      {selectedOperators.length > 1 ? "s" : ""} selected
                    </p>
                  </div>
                )}
              </div>

              <div className='flex gap-3'>
                <CustomButton
                  className='flex-1'
                  type='button'
                  text='Back'
                  variant='outline'
                  onClick={handleBack}
                />
                <CustomButton
                  className='flex-1'
                  type='submit'
                  text='Submit'
                  variant='primary'
                  loading={form.formState.isSubmitting}
                  disabled={form.formState.isSubmitting}
                />
              </div>
            </>
          )}
        </CustomForm>
      </Form>
    </DialogWindow>
  );
};

export default AddOfficeDialog;
