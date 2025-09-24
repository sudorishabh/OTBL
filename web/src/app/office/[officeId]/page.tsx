"use client";
import React, { useState } from "react";
import Wrapper from "@/components/Wrapper";
import { trpc } from "@/lib/trpc";
import PageFetchingData from "@/components/PageFetchingData";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Phone,
  User,
  Mail,
  ArrowUpRight,
  ArrowLeft,
  PencilLine,
  Plus,
  Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { capitalFirstLetter } from "@/utils/capitalFirstLetter";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/custom/CustomButton";
import CompletedWOCard from "./_components/CompletedWOCard";
import ActiveWOCard from "./_components/ActiveWOCard";
import OfficeDetailsCard from "./_components/OfficeDetailsCard";
import OfficeStats from "./_components/OfficeStats";
import OfficeWOComp from "./_components/OfficeWOComp";
import CreateWODialog from "./_components/CreateWODialog";
import EditOfficeDetailsDialog from "./_components/EditOfficeDetailsDialog";

type PageProps = {
  params: Promise<{ officeId: string }>;
};

const Office = ({ params }: PageProps) => {
  const [isCreateWODialog, setIsCreateWODialog] = useState(false);

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
          className='bg-emerald-600 text-white'
          onClick={() => router.push(`/office/${officeId}/edit`)}
        />
      }>
      {/* Office details */}
      {office ? (
        <div className='mt-4 space-y-6'>
          <OfficeDetailsCard office={office} />
          <OfficeStats stats={stats} />
          <OfficeWOComp
            isCreateWODialog={isCreateWODialog}
            setIsCreateWODialog={setIsCreateWODialog}
          />
        </div>
      ) : (
        <div></div>
      )}

      <EditOfficeDetailsDialog />

      <CreateWODialog
        open={isCreateWODialog}
        setOpen={setIsCreateWODialog}
      />
    </Wrapper>
  );
};

export default Office;
