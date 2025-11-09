"use client";
import CustomButton from "@/components/CustomButton";
import Wrapper from "@/components/Wrapper";
import { Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import AddSiteDialog from "./_components/AddSiteDialog";
import { trpc } from "@/lib/trpc";
import SiteInfoDialog from "./_components/SiteInfoDialog";
import PageLoading from "@/components/PageLoading";
import SiteTable from "./_components/SiteTable";
import SiteSearchNFilter from "./_components/SiteSearchNFilter";
import { useSiteManagementContext } from "@/contexts/SiteManagementContext";

const Site = () => {
  const [isSiteDialog, setIsSiteDialog] = useState(false);
  const [isSiteInfoDialog, setIsSiteInfoDialog] = useState(false);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allSitesList, setAllSitesList] = useState<any[]>([]);

  const { searchQuery, filters, siteNamesOrder } = useSiteManagementContext();

  const allSitesQueryLimit = 40;
  const getAllSitesQuery = trpc.siteQuery.getAll.useQuery({
    page: currentPage,
    limit: allSitesQueryLimit,
    searchQuery: searchQuery || undefined,
    status: filters.status,
    siteNamesOrder,
  });

  const isAllSiteQueryLoading = getAllSitesQuery.isLoading;
  const { sites, pagination } = getAllSitesQuery?.data || {
    sites: [],
    pagination: null,
  };

  const isInitialLoading =
    isAllSiteQueryLoading &&
    currentPage === 1 &&
    searchQuery === "" &&
    filters.status === "all" &&
    siteNamesOrder === "latest";

  const isFetchingMore = getAllSitesQuery.isFetching && currentPage > 1;

  useEffect(() => {
    setCurrentPage(1);
    setAllSitesList([]);
  }, [searchQuery, filters.status]);

  useEffect(() => {
    if (!sites || isAllSiteQueryLoading) return;
    if (pagination?.page !== currentPage) return;

    if (currentPage === 1) {
      setAllSitesList(sites);
    } else {
      setAllSitesList((prev) => [...prev, ...sites]);
    }
  }, [sites, currentPage, isAllSiteQueryLoading]);

  const handleEditSite = (site: any) => {
    setSelectedSite(site);
    setIsSiteDialog(true);
  };

  const handleViewSite = (site: any) => {
    setSelectedSite(site);
    setIsSiteInfoDialog(true);
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  if (isInitialLoading) {
    return <PageLoading />;
  }

  return (
    <Wrapper
      title='Sites'
      description='Manage and add sites with location details'
      button={
        <CustomButton
          text='Add Site'
          Icon={Plus}
          onClick={() => {
            setSelectedSite(null);
            setIsSiteDialog(true);
          }}
          variant='primary'
        />
      }>
      <div className='w-full mt-8'>
        <div className='flex justify-between items-center mb-6'>
          <SiteSearchNFilter />
        </div>

        <SiteTable
          sites={allSitesList}
          pagination={pagination}
          onEdit={handleEditSite}
          onView={handleViewSite}
          handleLoadMore={handleLoadMore}
          isLoadingData={isFetchingMore}
        />
      </div>

      {/* Dialogs */}
      <AddSiteDialog
        open={isSiteDialog}
        setOpen={setIsSiteDialog}
        isEditInfo={selectedSite}
        setIsEditInfo={setSelectedSite}
      />
      <SiteInfoDialog
        open={isSiteInfoDialog}
        setOpen={setIsSiteInfoDialog}
        site={selectedSite}
      />
    </Wrapper>
  );
};

export default Site;
