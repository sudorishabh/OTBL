"use client";
import CustomButton from "@/components/custom/CustomButton";
import Wrapper from "@/components/Wrapper";
import { Plus, Tent } from "lucide-react";
import React, { useState } from "react";
import AddSiteDialog from "./_components/AddSiteDialog";
import SiteCard from "./_components/SiteCard";
import { trpc } from "@/lib/trpc";
import SiteInfoDialog from "./_components/SiteInfoDialog";
import NoFetchData from "@/components/NoFetchData";

const Site = () => {
  const [isSiteDialog, setIsSiteDialog] = useState(false);
  const [isSiteInfoDialog, setIsSiteInfoDialog] = useState(false);

  const getSites = trpc.siteQuery.getSites.useQuery();

  const isSites = getSites.data && getSites.data.length > 0;

  if (getSites.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Wrapper
      title='Sites'
      description='Manage and Add sites'
      button={
        <CustomButton
          text='Add Site'
          Icon={Plus}
          onClick={() => {
            setIsSiteDialog(!isSiteDialog);
          }}
        />
      }>
      {isSites ? (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {getSites.data?.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                isSiteInfoDialog={isSiteInfoDialog}
                setIsSiteInfoDialog={setIsSiteInfoDialog}
              />
            ))}
          </div>
        </div>
      ) : (
        <NoFetchData
          Icon={Tent}
          title='No sites found'
          description='Start by adding your first site information.'
        />
      )}

      <AddSiteDialog
        open={isSiteDialog}
        setOpen={setIsSiteDialog}
      />
      <SiteInfoDialog
        open={isSiteInfoDialog}
        setOpen={setIsSiteInfoDialog}
      />
    </Wrapper>
  );
};

export default Site;
