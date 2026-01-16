import PageLoading from "@/components/PageLoading";
import { useClientManagementContext } from "@/contexts/ClientManagementContext";
import { trpc } from "@/lib/trpc";
import React from "react";
import ClientCard from "./ClientCard";
import { useSearchParams } from "next/navigation";
import NoFetchData from "@/components/NoFetchData";
import { Webhook } from "lucide-react";
interface ClientContact {
  id: number;
  client_id: number;
  name: string;
  designation?: string;
  contact_number: string;
  email: string;
  contact_type?: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  contact_number: string;
}

interface ClientContactsTableProps {
  contacts: ClientContact[];
  clients: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  } | null;
  handleLoadMore: () => void;
  isLoadingData: boolean;
}

interface Props {
  tab: string;
}
const ClientsTab = ({ tab }: Props) => {
  const isClientTab = tab === "clients";

  const { clientSearchQuery, clientFilters } = useClientManagementContext();

  const {
    data: clients,
    isLoading,
    error,
  } = trpc.clientQuery.getClients.useQuery(
    {
      searchQuery: clientSearchQuery || undefined,
      status: clientFilters.status,
    },
    {
      enabled: isClientTab,
    }
  );

  const hasClients = clients?.length > 0;

  if (isLoading) {
    return <PageLoading />;
  }

  if (!hasClients) {
    return (
      <NoFetchData
        Icon={Webhook}
        title='No Clients Found'
        description='Add a client to get started'
      />
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4'>
      {clients?.map((client: Client) => (
        <ClientCard
          key={client.id}
          client={client}
          contacts={clients?.filter(
            (c: ClientContact) => c.client_id === client.id
          )}
        />
      ))}
    </div>
  );
};

export default ClientsTab;
