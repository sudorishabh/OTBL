import DialogWindow from "@/components/DialogWindow";
import React from "react";
import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

// Form schema aligned with WorkOrderTable + site choice
const workOrderFormSchema = z.object({
  code: z.string().min(1, { message: "Code is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  budget_amount: z.string().min(1, { message: "Budget is required" }),
  expense_amount: z.string().min(1, { message: "Expense is required" }),
  status: z.enum(["pending", "completed", "cancelled"]),
  // Site selection
  siteMode: z.enum(["existing", "new"]),
  site_id: z.string().optional(),
  newSite: z
    .object({
      name: z.string().min(1, { message: "Site name is required" }),
      address: z.string().min(1, { message: "Address is required" }),
      state: z.string().min(1, { message: "State is required" }),
      city: z.string().min(1, { message: "City is required" }),
      pincode: z.string().min(1).max(10),
      contact_person: z.string().min(1),
      contact_number: z.string().min(1).max(15),
      email: z.string().email(),
    })
    .partial()
    .optional(),
});

type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>;

const CreateWODialog = ({ open, setOpen }: Props) => {
  const sitesQuery = trpc.siteQuery.getSites.useQuery();

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      code: "",
      title: "",
      date: "",
      description: "",
      budget_amount: "",
      expense_amount: "0",
      status: "pending",
      siteMode: "existing",
      site_id: undefined,
      newSite: undefined,
    },
  });

  const onSubmit: SubmitHandler<WorkOrderFormValues> = (values) => {
    // Submit will be wired when backend mutation exists
    setOpen(false);
  };

  const siteMode = form.watch("siteMode");

  return (
    <DialogWindow
      title='Create Work order'
      description='Create a new Work Order for this office'
      open={open}
      setOpen={setOpen}
      size='lg'>
      <div className=''>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='WO-1001'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Brief work order title'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type='date'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='budget_amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      placeholder='0.00'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='col-span-2'>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder='Describe the work order'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='col-span-2 grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='siteMode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Mode</FormLabel>
                    <FormControl>
                      <div className='flex gap-3'>
                        <label className='flex items-center gap-2 text-sm'>
                          <input
                            type='radio'
                            value='existing'
                            checked={field.value === "existing"}
                            onChange={() => field.onChange("existing")}
                          />
                          Choose existing site
                        </label>
                        <label className='flex items-center gap-2 text-sm'>
                          <input
                            type='radio'
                            value='new'
                            checked={field.value === "new"}
                            onChange={() => field.onChange("new")}
                          />
                          Create new site
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {siteMode === "existing" ? (
              <div className='col-span-2'>
                <FormField
                  control={form.control}
                  name='site_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Existing Site</FormLabel>
                      <FormControl>
                        <select
                          className='border-input dark:bg-input/30 h-9 w-full rounded-md border px-3 text-sm outline-none'
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}>
                          <option
                            value=''
                            disabled>
                            {sitesQuery.isLoading
                              ? "Loading sites..."
                              : "Select a site"}
                          </option>
                          {(sitesQuery.data ?? []).map((s) => (
                            <option
                              key={s.id}
                              value={String(s.id)}>
                              {s.name} - {s.city}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name='newSite.name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Site name'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='newSite.address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Address'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='newSite.state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='State'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='newSite.city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='City'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='newSite.pincode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Pincode'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='newSite.contact_person'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Contact Person'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='newSite.contact_number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Contact Number'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='newSite.email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='email@example.com'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className='col-span-2 flex items-center justify-end gap-3 pt-2'>
              <Button
                type='button'
                variant={"secondary"}
                onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type='submit'>Create Work Order</Button>
            </div>
          </form>
        </Form>
      </div>
    </DialogWindow>
  );
};

export default CreateWODialog;
