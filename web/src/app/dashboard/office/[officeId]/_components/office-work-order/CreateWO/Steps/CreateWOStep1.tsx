import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Hash,
  FileText,
  Calendar as CalendarIcon,
  IndianRupee,
  MapPin,
  Building2,
  Plus,
  Users,
  FileCheck,
  Link as LinkIcon,
  Weight,
  Mail,
  Phone,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  form: any;
  clientsData: any;
  clientsPagination?: any;
  isGetClientsLoading: boolean;
  clientMode: "existing" | "new";
  onLoadMoreClients?: () => void;
  onSearchClients?: (query: string) => void;
  clientSearchQuery?: string;
}
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const CreateWOStep1 = ({
  form,
  clientsData,
  clientsPagination,
  isGetClientsLoading,
  clientMode,
  onLoadMoreClients,
  onSearchClients,
  clientSearchQuery,
}: Props) => {
  return (
    <Card className='border-0 drop-shadow shadow-0 bg-gray-50'>
      <CardHeader className='pb-4'>
        <div className='flex items-center gap-3'>
          <div>
            <h3 className='text-lg font-semibold'>Work Order Details</h3>
            <p className='text-sm text-muted-foreground'>
              Provide basic information about the work order
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {/* Basic Information Section */}
          <div className='space-y-8'>
            <div className='flex items-center gap-2 mb-8'>
              <div className='p-2 rounded-lg bg-emerald-100'>
                <FileText className='h-4 w-4 text-emerald-600 ' />
              </div>
              <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                Basic Information
              </h4>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-start'>
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <Hash className='h-4 w-4' />
                      Work Order Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        className='bg-white'
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
                    <FormLabel className='flex items-center gap-2'>
                      <FileText className='h-4 w-4' />
                      Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Brief work order title'
                        className='bg-white'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Client Selection Section */}
          <div className='space-y-8'>
            <div className='flex items-center gap-2 mb-8'>
              <div className='p-2 rounded-lg bg-blue-100'>
                <Users className='h-4 w-4 text-blue-600' />
              </div>
              <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                Client Information
              </h4>
            </div>

            <FormField
              control={form.control}
              name='clientMode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose Client Mode</FormLabel>
                  <FormDescription>
                    Select an existing client or create a new one
                  </FormDescription>
                  <FormControl>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                      <Card
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          field.value === "existing"
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => field.onChange("existing")}>
                        <CardContent className='px-4'>
                          <div className='flex items-start gap-3'>
                            <div
                              className={`p-2 rounded-lg ${
                                field.value === "existing"
                                  ? "bg-blue-100 dark:bg-blue-900/30"
                                  : "bg-gray-100 dark:bg-gray-800"
                              }`}>
                              <Users
                                className={`h-5 w-5 ${
                                  field.value === "existing"
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-500"
                                }`}
                              />
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h4 className='font-semibold'>
                                  Existing Client
                                </h4>
                                {field.value === "existing" && (
                                  <Badge
                                    variant='secondary'
                                    className='bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                                    Selected
                                  </Badge>
                                )}
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                Select from existing clients in the system
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          field.value === "new"
                            ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/20"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => field.onChange("new")}>
                        <CardContent className='px-4'>
                          <div className='flex items-start gap-3'>
                            <div
                              className={`p-2 rounded-lg ${
                                field.value === "new"
                                  ? "bg-purple-100 dark:bg-purple-900/30"
                                  : "bg-gray-100 dark:bg-gray-800"
                              }`}>
                              <Plus
                                className={`h-5 w-5 ${
                                  field.value === "new"
                                    ? "text-purple-600 dark:text-purple-400"
                                    : "text-gray-500"
                                }`}
                              />
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h4 className='font-semibold'>
                                  Create New Client
                                </h4>
                                {field.value === "new" && (
                                  <Badge
                                    variant='secondary'
                                    className='bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'>
                                    Selected
                                  </Badge>
                                )}
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                Add a new client while creating work order
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {clientMode === "existing" && (
              <div className='space-y-4'>
                {/* Search Input */}
                {onSearchClients && (
                  <div className='relative'>
                    <Input
                      placeholder='Search clients by name, email, GST...'
                      value={clientSearchQuery || ""}
                      onChange={(e) => onSearchClients(e.target.value)}
                      className='pl-10'
                    />
                    <Users className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name='client_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Client</FormLabel>
                      <Select
                        disabled={isGetClientsLoading}
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger className='h-auto min-h-10'>
                            <SelectValue
                              placeholder={
                                isGetClientsLoading
                                  ? "Loading clients..."
                                  : "Select a client"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='max-h-[400px]'>
                          {isGetClientsLoading ? (
                            <div className='p-4 text-center text-sm text-muted-foreground'>
                              Loading clients...
                            </div>
                          ) : clientsData && clientsData.length > 0 ? (
                            clientsData.map((client: any) => (
                              <SelectItem
                                key={client.id}
                                value={client.id.toString()}
                                className='cursor-pointer'>
                                <div className='flex flex-col gap-1 py-2'>
                                  <div className='flex items-center gap-2'>
                                    <span className='font-semibold text-base'>
                                      {client.name}
                                    </span>
                                    {client.status === "active" && (
                                      <Badge
                                        variant='secondary'
                                        className='bg-emerald-100 text-emerald-700 text-xs'>
                                        Active
                                      </Badge>
                                    )}
                                  </div>
                                  <div className='flex flex-col gap-1 text-xs text-muted-foreground'>
                                    {client.email && (
                                      <div className='flex items-center gap-1'>
                                        <Mail className='h-3 w-3' />
                                        <span>{client.email}</span>
                                      </div>
                                    )}
                                    {client.contact_number && (
                                      <div className='flex items-center gap-1'>
                                        <Phone className='h-3 w-3' />
                                        <span>{client.contact_number}</span>
                                      </div>
                                    )}
                                    {(client.city || client.state) && (
                                      <div className='flex items-center gap-1'>
                                        <MapPin className='h-3 w-3' />
                                        <span>
                                          {[client.city, client.state]
                                            .filter(Boolean)
                                            .join(", ")}
                                        </span>
                                      </div>
                                    )}
                                    {client.gst_number && (
                                      <div className='text-xs'>
                                        <span className='font-medium'>
                                          GST:
                                        </span>{" "}
                                        {client.gst_number}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className='p-4 text-center text-sm text-muted-foreground'>
                              No clients found. Create a new client instead.
                            </div>
                          )}
                          {/* Load More Button */}
                          {clientsPagination &&
                            clientsPagination.hasMore &&
                            onLoadMoreClients && (
                              <div className='p-2 border-t'>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  className='w-full text-sm'
                                  onClick={onLoadMoreClients}
                                  disabled={isGetClientsLoading}>
                                  {isGetClientsLoading
                                    ? "Loading..."
                                    : `Load More (${clientsPagination.page}/${clientsPagination.totalPages})`}
                                </Button>
                              </div>
                            )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {field.value && clientsData && clientsData.length > 0 && (
                        <div className='mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                          {(() => {
                            const selectedClient = clientsData.find(
                              (c: any) => c.id.toString() === field.value
                            );
                            if (!selectedClient) return null;
                            return (
                              <div className='space-y-2'>
                                <div className='flex items-center justify-between'>
                                  <h4 className='font-semibold text-sm text-blue-900 dark:text-blue-100'>
                                    Selected Client
                                  </h4>
                                  <Badge
                                    variant='secondary'
                                    className='bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                                    {selectedClient.status}
                                  </Badge>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground'>
                                  {selectedClient.email && (
                                    <div className='flex items-center gap-1.5'>
                                      <Mail className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                                      <span className='truncate'>
                                        {selectedClient.email}
                                      </span>
                                    </div>
                                  )}
                                  {selectedClient.contact_number && (
                                    <div className='flex items-center gap-1.5'>
                                      <Phone className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                                      <span>
                                        {selectedClient.contact_number}
                                      </span>
                                    </div>
                                  )}
                                  {(selectedClient.city ||
                                    selectedClient.state) && (
                                    <div className='flex items-center gap-1.5 col-span-2'>
                                      <MapPin className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                                      <span>
                                        {[
                                          selectedClient.address,
                                          selectedClient.city,
                                          selectedClient.state,
                                          selectedClient.pincode,
                                        ]
                                          .filter(Boolean)
                                          .join(", ")}
                                      </span>
                                    </div>
                                  )}
                                  {selectedClient.gst_number && (
                                    <div className='col-span-2'>
                                      <span className='font-medium text-blue-900 dark:text-blue-100'>
                                        GST:
                                      </span>{" "}
                                      <span className='font-mono'>
                                        {selectedClient.gst_number}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            )}

            {clientMode === "new" && (
              <div className='space-y-4 p-4 border rounded-lg bg-purple-50/50 dark:bg-purple-950/10'>
                <h4 className='font-semibold text-sm'>New Client Details</h4>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='newClient.name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Client name'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='newClient.gst_number'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GST Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='GST number'
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
                  name='newClient.address'
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

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <FormField
                    control={form.control}
                    name='newClient.city'
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
                    name='newClient.state'
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
                    name='newClient.pincode'
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
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='newClient.contact_number'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Contact number'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='newClient.email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='Email'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Agreement & Dates Section */}
          <div className='space-y-8'>
            <div className='flex items-center gap-2 mb-8'>
              <div className='p-2 rounded-lg bg-orange-100'>
                <FileCheck className='h-4 w-4 text-orange-600' />
              </div>
              <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                Agreement & Timeline
              </h4>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='agreement_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <FileCheck className='h-4 w-4' />
                      Agreement Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='AG-2024-001'
                        className='bg-white'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='agreement_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <LinkIcon className='h-4 w-4' />
                      Agreement URL (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://...'
                        className='bg-white'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='start_date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <CalendarIcon className='h-4 w-4' />
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='outline'
                            className='w-full justify-start text-left font-normal'>
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {field.value ? field.value : "Pick a date"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='p-0'>
                          <div className='p-2'>
                            <Calendar
                              mode='single'
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                if (!date) return field.onChange("");
                                const yyyy = date.getFullYear();
                                const mm = String(date.getMonth() + 1).padStart(
                                  2,
                                  "0"
                                );
                                const dd = String(date.getDate()).padStart(
                                  2,
                                  "0"
                                );
                                field.onChange(`${yyyy}-${mm}-${dd}`);
                              }}
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='end_date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <CalendarIcon className='h-4 w-4' />
                      End Date
                    </FormLabel>
                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='outline'
                            className='w-full justify-start text-left font-normal'>
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {field.value ? field.value : "Pick a date"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='p-0'>
                          <div className='p-2'>
                            <Calendar
                              mode='single'
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                if (!date) return field.onChange("");
                                const yyyy = date.getFullYear();
                                const mm = String(date.getMonth() + 1).padStart(
                                  2,
                                  "0"
                                );
                                const dd = String(date.getDate()).padStart(
                                  2,
                                  "0"
                                );
                                field.onChange(`${yyyy}-${mm}-${dd}`);
                              }}
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='handing_over_date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <CalendarIcon className='h-4 w-4' />
                      Handing Over Date
                    </FormLabel>
                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='outline'
                            className='w-full justify-start text-left font-normal'>
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {field.value ? field.value : "Pick a date"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='p-0'>
                          <div className='p-2'>
                            <Calendar
                              mode='single'
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                if (!date) return field.onChange("");
                                const yyyy = date.getFullYear();
                                const mm = String(date.getMonth() + 1).padStart(
                                  2,
                                  "0"
                                );
                                const dd = String(date.getDate()).padStart(
                                  2,
                                  "0"
                                );
                                field.onChange(`${yyyy}-${mm}-${dd}`);
                              }}
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Budget & Metrics Section */}
          <div className='space-y-8'>
            <div className='flex items-center gap-2 mb-8'>
              <div className='p-2 rounded-lg bg-emerald-100'>
                <IndianRupee className='h-4 w-4 text-emerald-600' />
              </div>
              <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                Budget & Metrics
              </h4>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='budget_amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <IndianRupee className='h-4 w-4' />
                      Budget Amount
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        className='bg-white'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='metric_ton'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <Weight className='h-4 w-4' />
                      Metric Ton (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        className='bg-white'
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
                name='metric_ton_rate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <IndianRupee className='h-4 w-4' />
                      Metric Ton Rate (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        className='bg-white'
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
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2'>
                    <FileText className='h-4 w-4' />
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder='Describe the work order in detail...'
                      className='bg-white'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Site Mode Selection - Moved from earlier position */}
          <div className='space-y-8'>
            <div className='flex items-center gap-2 mb-8'>
              <div className='p-2 rounded-lg bg-green-100'>
                <MapPin className='h-4 w-4 text-green-600' />
              </div>
              <h4 className='text-sm font-semibold text-gray-700'>
                Site Assignment Mode
              </h4>
            </div>

            <FormField
              control={form.control}
              name='siteMode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose Site Mode</FormLabel>
                  <FormDescription>
                    This determines how you'll add sites in the next step
                  </FormDescription>
                  <FormControl>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                      <Card
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          field.value === "existing"
                            ? "ring-2 ring-emerald-500 bg-emerald-50"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => field.onChange("existing")}>
                        <CardContent className='px-4'>
                          <div className='flex items-start gap-3'>
                            <div
                              className={`p-2 rounded-lg ${
                                field.value === "existing"
                                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                                  : "bg-gray-100 dark:bg-gray-800"
                              }`}>
                              <Building2
                                className={`h-5 w-5 ${
                                  field.value === "existing"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-gray-500"
                                }`}
                              />
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h4 className='font-semibold'>
                                  Existing Sites
                                </h4>
                                {field.value === "existing" && (
                                  <Badge
                                    variant='secondary'
                                    className='bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'>
                                    Selected
                                  </Badge>
                                )}
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                Link this work order to sites that already exist
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          field.value === "new"
                            ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => field.onChange("new")}>
                        <CardContent className='px-4'>
                          <div className='flex items-start gap-3'>
                            <div
                              className={`p-2 rounded-lg ${
                                field.value === "new"
                                  ? "bg-green-100 dark:bg-green-900/30"
                                  : "bg-gray-100 dark:bg-gray-800"
                              }`}>
                              <Plus
                                className={`h-5 w-5 ${
                                  field.value === "new"
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-gray-500"
                                }`}
                              />
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h4 className='font-semibold'>
                                  Create New Sites
                                </h4>
                                {field.value === "new" && (
                                  <Badge
                                    variant='secondary'
                                    className='bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                                    Selected
                                  </Badge>
                                )}
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                Create new sites while creating work order
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateWOStep1;
