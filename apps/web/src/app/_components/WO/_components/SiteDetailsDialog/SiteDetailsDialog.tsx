"use client";
import React from "react";
import DialogWindow from "@/components/DialogWindow";
import { trpc } from "@/lib/trpc";
import { capitalFirstLetter } from "@pkg/utils";
import useHandleParams from "@/hooks/useHandleParams";
import SiteDetailsCard from "./SiteDetailsCard";
import SiteActivities from "./SiteActivities";

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
  const { getParam, deleteParams } = useHandleParams();
  const woSiteId = Number(getParam("wo-site-id"));
  const isOpenDialog = getParam("dialog") === "site-details";

  const siteDetailsQuery =
    trpc.workOrderSiteQuery.getWorkOrderSiteDetails.useQuery(
      { work_order_site_id: woSiteId ?? 0 },
      { enabled: !!woSiteId && isOpenDialog },
    );

  const siteDetails = siteDetailsQuery.data;

  console.log("siteDetails", siteDetails);
  const dialogTitle = siteDetails?.site?.name
    ? capitalFirstLetter(siteDetails.site.name)
    : "Site Details";

  const dialogDescription = siteDetails?.work_order
    ? `${siteDetails.work_order.code} - ${siteDetails.work_order.title}`
    : undefined;

  const handleCloseDialog = () => {
    deleteParams(["dialog", "wo-site-id"]);
  };

  return (
    <DialogWindow
      open={isOpenDialog}
      setOpen={handleCloseDialog}
      title={dialogTitle}
      description={dialogDescription}
      size='xl'
      isLoading={siteDetailsQuery.isLoading}>
      <div className='space-y-5 py-3'>
        <SiteDetailsCard siteDetails={siteDetails} />
        <SiteActivities
          woSiteId={woSiteId}
          processType={siteDetails?.process_type}
        />
      </div>
    </DialogWindow>
  );
};

export default SiteDetailDialog;
