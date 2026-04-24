import { Suspense } from "react";
import ClientContent from "@/components/client/client-page";
import ClientPageSkeleton from "@/components/skeleton/client/client-page-skeleton";

type PageProps = {
  params: { clientId: string } | Promise<{ clientId: string }>;
};

export default async function ClientPage({ params }: PageProps) {
  const { clientId } = await Promise.resolve(params);

  return (
    <Suspense fallback={<ClientPageSkeleton />}>
      <ClientContent clientId={clientId} />
    </Suspense>
  );
}
