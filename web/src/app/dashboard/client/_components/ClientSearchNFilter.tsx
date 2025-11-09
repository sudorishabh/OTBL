import CustomButton from "@/components/CustomButton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClientManagementContext } from "@/contexts/ClientManagementContext";
import { Search, X, UserPlus } from "lucide-react";
import React from "react";

interface Props {
  type: "clients" | "contacts";
  clients?: Array<{ id: number; name: string }>;
  onAddContact?: () => void;
}

const ClientSearchNFilter = ({ type, clients = [], onAddContact }: Props) => {
  const {
    clientSearchQuery,
    setClientSearchQuery,
    clientFilters,
    setClientFilters,
    resetClientFilters,
    contactSearchQuery,
    setContactSearchQuery,
    contactFilters,
    setContactFilters,
    resetContactFilters,
  } = useClientManagementContext();

  const isClientsTab = type === "clients";
  const searchQuery = isClientsTab ? clientSearchQuery : contactSearchQuery;
  const setSearchQuery = isClientsTab
    ? setClientSearchQuery
    : setContactSearchQuery;

  const hasActiveFilters = isClientsTab
    ? clientSearchQuery !== "" || clientFilters.status !== "all"
    : contactSearchQuery !== "" || contactFilters.clientId !== "all";

  const resetFilters = isClientsTab ? resetClientFilters : resetContactFilters;

  return (
    <div className='flex items-center gap-4'>
      <div className='relative w-80'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          type='text'
          placeholder={
            isClientsTab
              ? "Search clients by name, email, GST, city..."
              : "Search contacts by name, email, phone..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='pl-10 h-8 bg-white'
        />
      </div>
      <div className='flex items-center gap-3 text-xs'>
        {/* Filter - Status for Clients, Client for Contacts */}
        {isClientsTab ? (
          <Select
            value={clientFilters.status}
            onValueChange={(value) =>
              setClientFilters({ ...clientFilters, status: value })
            }>
            <SelectTrigger className='!h-8 w-[140px] bg-white text-xs cursor-pointer'>
              <SelectValue placeholder='All Status' />
            </SelectTrigger>
            <SelectContent className='text-xs'>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Select
            value={contactFilters.clientId}
            onValueChange={(value) =>
              setContactFilters({ ...contactFilters, clientId: value })
            }>
            <SelectTrigger className='!h-8 w-[180px] bg-white text-xs cursor-pointer'>
              <SelectValue placeholder='All Clients' />
            </SelectTrigger>
            <SelectContent className='text-xs max-h-[300px]'>
              <SelectItem value='all'>All Clients</SelectItem>
              {clients.map((client) => (
                <SelectItem
                  key={client.id}
                  value={client.id.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Reset Button */}
        {hasActiveFilters && (
          <CustomButton
            text='Reset'
            onClick={resetFilters}
            variant='outline'
            Icon={X}
            className='h-8 text-xs'
          />
        )}

        {/* Add Contact Button - Only for Contacts Tab */}
        {!isClientsTab && onAddContact && (
          <CustomButton
            text='Add Contact'
            onClick={onAddContact}
            variant='primary'
            Icon={UserPlus}
            className='h-8 text-xs'
          />
        )}
      </div>
    </div>
  );
};

export default ClientSearchNFilter;
