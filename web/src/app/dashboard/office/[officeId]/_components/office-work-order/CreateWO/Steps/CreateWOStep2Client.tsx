import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Mail, Phone, MapPin, Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

const CreateWOStep2Client = ({
  form,
  clientsData,
  clientsPagination,
  isGetClientsLoading,
  clientMode,
  onLoadMoreClients,
  onSearchClients,
  clientSearchQuery,
}: Props) => {
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Debug: Log client data
  React.useEffect(() => {
    console.log("CreateWOStep2Client - clientsData:", clientsData);
    console.log("CreateWOStep2Client - clientsPagination:", clientsPagination);
    console.log(
      "CreateWOStep2Client - isGetClientsLoading:",
      isGetClientsLoading
    );
  }, [clientsData, clientsPagination, isGetClientsLoading]);

  // Filter clients based on status
  const filteredClients = React.useMemo(() => {
    if (!clientsData) return [];
    if (statusFilter === "all") return clientsData;
    return clientsData.filter((client: any) => client.status === statusFilter);
  }, [clientsData, statusFilter]);

  return (
    <Card className='border-0 drop-shadow shadow-0 bg-gray-50'>
      <CardHeader className='pb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-3 rounded-lg bg-blue-100'>
            <Users className='h-6 w-6 text-blue-600' />
          </div>
          <div>
            <h3 className='text-lg font-semibold'>Client Selection</h3>
            <p className='text-sm text-muted-foreground'>
              Choose an existing client or create a new one for this work order
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {/* Client Mode Selection */}
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
                              <h4 className='font-semibold'>Existing Client</h4>
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

          {/* Existing Client Selection */}
          {clientMode === "existing" && (
            <div className='space-y-4'>
              {/* Search & Filter Bar */}
              <div className='space-y-2'>
                <FormLabel>Search & Filter Clients</FormLabel>
                <div className='flex gap-2'>
                  <div className='relative flex-1'>
                    <Input
                      placeholder='Search clients by name, email, GST, city...'
                      value={clientSearchQuery || ""}
                      onChange={(e) => {
                        if (onSearchClients) {
                          onSearchClients(e.target.value);
                        }
                      }}
                      className='pl-10 bg-white'
                    />
                    <Users className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}>
                    <SelectTrigger className='w-[140px] bg-white'>
                      <SelectValue placeholder='Filter' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Status</SelectItem>
                      <SelectItem value='active'>Active Only</SelectItem>
                      <SelectItem value='inactive'>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center justify-between'>
                  {clientsPagination && (
                    <p className='text-xs text-muted-foreground'>
                      Showing {filteredClients.length} of{" "}
                      {clientsPagination.total} client
                      {clientsPagination.total !== 1 ? "s" : ""}
                      {statusFilter !== "all" &&
                        ` (${statusFilter} filter applied)`}
                    </p>
                  )}
                  {filteredClients.length > 0 && (
                    <p className='text-xs text-blue-600 font-medium'>
                      {form.watch("client_id")
                        ? "✓ Client selected"
                        : "Select a client"}
                    </p>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name='client_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Client</FormLabel>
                    <FormControl>
                      <div className='space-y-3'>
                        {isGetClientsLoading ? (
                          <div className='p-8 text-center text-sm text-muted-foreground bg-white rounded-lg border'>
                            <Users className='h-8 w-8 mx-auto mb-2 text-muted-foreground/50 animate-pulse' />
                            Loading clients...
                          </div>
                        ) : filteredClients && filteredClients.length > 0 ? (
                          <div className='space-y-2 max-h-[500px] overflow-y-auto pr-2'>
                            {filteredClients.map((client: any) => (
                              <Card
                                key={client.id}
                                className={`cursor-pointer transition-all duration-200 ${
                                  field.value === client.id.toString()
                                    ? "ring- ring-blue-500 bg-blue-50/50"
                                    : "hover:bg-gray-50 bg-white hover:shadow-sm"
                                }`}
                                onClick={() =>
                                  field.onChange(client.id.toString())
                                }>
                                <CardContent className='p-3'>
                                  <div className='flex items-center gap-3'>
                                    {/* Icon */}
                                    <div
                                      className={`p-1.5 rounded ${
                                        field.value === client.id.toString()
                                          ? "bg-blue-100"
                                          : "bg-gray-100"
                                      }`}>
                                      <Building2
                                        className={`h-3.5 w-3.5 ${
                                          field.value === client.id.toString()
                                            ? "text-blue-600"
                                            : "text-gray-600"
                                        }`}
                                      />
                                    </div>

                                    {/* Client Info */}
                                    <div className='flex-1 min-w-0'>
                                      <div className='flex items-center gap-2 mb-1'>
                                        <h4 className='font-semibold text-sm truncate'>
                                          {client.name}
                                        </h4>
                                        {client.status === "active" && (
                                          <Badge
                                            variant='secondary'
                                            className='bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0'>
                                            Active
                                          </Badge>
                                        )}
                                      </div>

                                      {/* Compact Details */}
                                      <div className='flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground'>
                                        {client.email && (
                                          <div className='flex items-center gap-1'>
                                            <Mail className='h-3 w-3 flex-shrink-0' />
                                            <span className='truncate max-w-[180px]'>
                                              {client.email}
                                            </span>
                                          </div>
                                        )}
                                        {client.contact_number && (
                                          <div className='flex items-center gap-1'>
                                            <Phone className='h-3 w-3 flex-shrink-0' />
                                            <span>{client.contact_number}</span>
                                          </div>
                                        )}
                                        {(client.city || client.state) && (
                                          <div className='flex items-center gap-1'>
                                            <MapPin className='h-3 w-3 flex-shrink-0' />
                                            <span className='truncate'>
                                              {[client.city, client.state]
                                                .filter(Boolean)
                                                .join(", ")}
                                            </span>
                                          </div>
                                        )}
                                        {client.gst_number && (
                                          <div className='flex items-center gap-1'>
                                            <span className='font-medium'>
                                              GST:
                                            </span>
                                            <span className='font-mono'>
                                              {client.gst_number}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Selection Indicator */}
                                    {field.value === client.id.toString() && (
                                      <div className='flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 flex-shrink-0'>
                                        <svg
                                          className='w-3 h-3 text-white'
                                          fill='none'
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          strokeWidth='2.5'
                                          viewBox='0 0 24 24'
                                          stroke='currentColor'>
                                          <path d='M5 13l4 4L19 7'></path>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className='p-8 text-center text-sm text-muted-foreground bg-white rounded-lg border'>
                            <Users className='h-8 w-8 mx-auto mb-2 text-muted-foreground/50' />
                            <p>No clients found.</p>
                            <p className='text-xs mt-1'>
                              {statusFilter !== "all"
                                ? "Try changing the filter or search term"
                                : "Try a different search or create a new client"}
                            </p>
                          </div>
                        )}

                        {/* Load More Button */}
                        {clientsPagination &&
                          clientsPagination.hasMore &&
                          onLoadMoreClients &&
                          !isGetClientsLoading && (
                            <Button
                              type='button'
                              variant='outline'
                              className='w-full'
                              onClick={onLoadMoreClients}>
                              Load More Clients (Page {clientsPagination.page}/
                              {clientsPagination.totalPages})
                            </Button>
                          )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* New Client Form */}
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
                  name='newClient.gst_number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='GST number'
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
                name='newClient.address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Address'
                        className='bg-white'
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
                  name='newClient.state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='State'
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
                  name='newClient.pincode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Pincode'
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
                  name='newClient.contact_number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Contact number'
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
                  name='newClient.email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='Email'
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateWOStep2Client;
