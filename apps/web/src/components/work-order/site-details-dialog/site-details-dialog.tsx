"use client";
import React from "react";
import DialogWindow from "@/components/shared/dialog-window";
import { trpc } from "@/lib/trpc";
import { capitalFirstLetter } from "@pkg/utils";
import useHandleParams from "@/hooks/useHandleParams";
import SiteDetailsCard from "./site-details-card";
import SiteActivities from "./site-activities";
import SiteExpensesSection from "./site-expenses-section";
import CustomButton from "@/components/shared/btn";
import { FolderOpen } from "lucide-react";
import { SiteOperatorUploadsDialog } from "./site-operator-uploads-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SiteDetailDialogProps {
  siteData: {
    id: number;
    wo_site_id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    start_date: string;
    end_date: string;
    status: "pending" | "completed" | "cancelled";
    client_id?: number;
    work_order_id?: number;
    [key: string]: any;
  } | null;
}

const SiteDetailDialog = () => {
  const { getParam, deleteParams, setParam } = useHandleParams();
  const woSiteId = Number(getParam("wo-site-id"));
  const isOpenDialog = getParam("dialog") === "site-details";
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  const siteDetailsQuery =
    trpc.workOrderSiteQuery.getWorkOrderSiteDetails.useQuery(
      { work_order_site_id: woSiteId ?? 0 },
      { enabled: !!woSiteId && isOpenDialog },
    );

  const siteDetails = siteDetailsQuery.data;

  const dialogTitle = siteDetails?.site?.name
    ? capitalFirstLetter(siteDetails.site.name)
    : "Site Details";

  const dialogDescription = siteDetails?.work_order
    ? `${siteDetails.work_order.code} - ${siteDetails.work_order.title}`
    : undefined;

  const handleCloseDialog = (open: boolean) => {
    if (open) return;
    setIsFullScreen(false);
    deleteParams(["dialog", "wo-site-id", "site-dialog"]);
  };

  const operatorUploadsQuery =
    trpc.workOrderSiteQuery.getOperatorUploads.useQuery(
      { work_order_site_id: woSiteId ?? 0 },
      { enabled: !!woSiteId && isOpenDialog },
    );

  const operatorUploadsCount = operatorUploadsQuery.data?.length ?? 0;
  const showOperatorUploadsBtn = operatorUploadsCount > 0;

  return (
    <DialogWindow
      open={isOpenDialog}
      setOpen={handleCloseDialog}
      title={dialogTitle}
      description={dialogDescription}
      size='xl'
      isFullScreen={isFullScreen}
      onToggleFullScreen={() => setIsFullScreen((v) => !v)}
      isLoading={siteDetailsQuery.isLoading}>
      <div className='space-y-5 py-3'>
        {showOperatorUploadsBtn && (
          <div className='flex justify-end'>
            <CustomButton
              text={`Operator uploads (${operatorUploadsCount})`}
              variant='outline'
              Icon={FolderOpen}
              onClick={() => setParam("site-dialog", "operator-uploads")}
            />
          </div>
        )}
        <SiteDetailsCard siteDetails={siteDetails} />

        <Tabs defaultValue='activities'>
          <TabsList className='w-full grid grid-cols-2 h-9'>
            <TabsTrigger
              value='activities'
              className='text-xs'>
              Activities
            </TabsTrigger>
            <TabsTrigger
              value='expenses'
              className='text-xs'>
              Expenses &amp; P&amp;L
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value='activities'
            className='mt-4'>
            <SiteActivities
              woSiteId={woSiteId}
              processType={siteDetails?.process_type}
            />
          </TabsContent>

          <TabsContent
            value='expenses'
            className='mt-4'>
            {woSiteId > 0 && siteDetails?.work_order?.office_id ? (
              <SiteExpensesSection
                woSiteId={woSiteId}
                officeId={siteDetails.work_order.office_id}
              />
            ) : (
              <div className='text-center py-8 text-gray-400 text-sm'>
                Loading site details...
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {isOpenDialog && woSiteId > 0 && (
        <SiteOperatorUploadsDialog
          workOrderSiteId={woSiteId}
          siteName={siteDetails?.site?.name}
        />
      )}
    </DialogWindow>
  );
};

export default SiteDetailDialog;
