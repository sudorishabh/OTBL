"use client";
import React, { useState } from "react";
import Wrapper from "@/components/Wrapper";
import { trpc } from "@/lib/trpc";
import PageFetchingData from "@/components/PageFetchingData";
import { PencilLine } from "lucide-react";
import { capitalFirstLetter } from "@/utils/capitalFirstLetter";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/CustomButton";
import OfficeDetailsCard from "./_components/OfficeDetailsCard";
import OfficeStats from "./_components/office-stats/OfficeStats";
import OfficeWOComp from "./_components/office-work-order/OfficeWOComp";
import EditOfficeDetailsDialog from "./_components/EditOfficeDetailsDialog";

type PageProps = {
  params: Promise<{ officeId: string }>;
};

const Office = ({ params }: PageProps) => {
  const [isEditOffieDialog, setIsEditOfficeDialog] = useState<boolean>(false);

  const { officeId } = React.use(params);

  const router = useRouter();

  const officeQuery = trpc.officeQuery.getOffice.useQuery(
    { id: Number(officeId) },
    { enabled: !!officeId }
  );

  const workOrdersQuery = trpc.officeQuery.getOfficeWorkOrders.useQuery(
    { id: Number(officeId) },
    { enabled: !!officeId }
  );

  const statsQuery = trpc.officeQuery.getOfficeStats.useQuery(
    { id: Number(officeId) },
    { enabled: !!officeId }
  );

  if (
    officeQuery.isLoading ||
    workOrdersQuery.isLoading ||
    statsQuery.isLoading
  ) {
    return <PageFetchingData title='Loading office data' />;
  }

  if (officeQuery.isError) {
    return (
      <Wrapper
        title='Office Info'
        description='Manage Office Info and Work Orders'>
        <div className='text-sm text-red-600'>Failed to load office.</div>
      </Wrapper>
    );
  }

  const office = officeQuery.data;
  const workOrders = workOrdersQuery.data;
  const stats = statsQuery.data;

  return (
    <Wrapper
      title={capitalFirstLetter(office?.name ?? "Office Info")}
      description='Manage Office Info and Work Orders'
      backClick={() => router.push("/office")}
      button={
        <CustomButton
          text='Edit details'
          variant='primary'
          Icon={PencilLine}
          onClick={() => setIsEditOfficeDialog(!isEditOffieDialog)}
        />
      }>
      {office ? (
        <div className='mt-4 space-y-6'>
          <OfficeDetailsCard office={office} />
          <OfficeStats
            stats={stats}
            officeId={officeId}
          />
          <OfficeWOComp />
        </div>
      ) : (
        <div></div>
      )}

      <EditOfficeDetailsDialog
        open={isEditOffieDialog}
        setOpen={setIsEditOfficeDialog}
        office={office}
      />
    </Wrapper>
  );
};

export default Office;
