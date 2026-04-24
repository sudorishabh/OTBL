import React, { useState, useEffect } from "react";
import DialogWindow from "@/components/shared/dialog-window";
import useHandleParams from "@/hooks/useHandleParams";
import { trpc } from "@/lib/trpc";
import Loading from "@/components/loading/Loading";
import LoadMoreBtn from "@/components/loading/LoadMoreBtn";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { capitalFirstLetter, capitalizeEachWord } from "@pkg/utils";
import StatusIndicator from "@/components/shared/status-indicator";
import { Search, UserMinus } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import SiteOperatorsSection from "./site-operators-section";
import toast from "react-hot-toast";
import { useApiError } from "@/hooks/useApiError";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 50;

const OfficeDetailsDialog = () => {
  const { getParam, deleteParams } = useHandleParams();
  const isOpenDialog = getParam("dialog") === "view-office";
  const officeId = getParam("officeId");
  const officeName = getParam("officeName");

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [page, setPage] = useState(1);

  const utils = trpc.useUtils();
  const { handleError } = useApiError();

  const removeFromSite = trpc.siteMutation.removeUserFromSite.useMutation({
    onSuccess: async () => {
      toast.success("Operator removed from site");
      await utils.siteQuery.getSitesByOfficeId.invalidate();
      await utils.siteQuery.get6SitesByOfficeId.invalidate();
    },
    onError: (e: unknown) => handleError(e, { showToast: true }),
  });

  const { data, isLoading, isFetching } =
    trpc.siteQuery.getSitesByOfficeId.useQuery(
      {
        office_id: Number(officeId),
        searchQuery: debouncedSearchTerm,
        status: "all",
        page,
        limit: ITEMS_PER_PAGE,
        siteUsersLimit: 80,
      },
      {
        enabled: isOpenDialog && !!officeId,
      },
    );

  // Accumulate sites across pages
  const [allSites, setAllSites] = useState<any[]>([]);

  // Type assertion for the new response structure
  const responseData = data as any;

  // Update accumulated sites when new data arrives
  useEffect(() => {
    if (responseData?.sites && !isFetching) {
      setAllSites((prev) => {
        // If it's page 1, replace all sites
        if (page === 1) {
          return responseData.sites;
        }
        // Otherwise, append new sites
        const existingIds = new Set(prev.map((s: any) => s.id));
        const newSites = responseData.sites.filter(
          (s: any) => !existingIds.has(s.id),
        );
        return [...prev, ...newSites];
      });
    }
  }, [responseData?.sites, page, isFetching]);

  useEffect(() => {
    setPage(1);
    setAllSites([]);
  }, [debouncedSearchTerm]);

  // Reset page when dialog closes
  useEffect(() => {
    if (!isOpenDialog) {
      setPage(1);
      setAllSites([]);
    }
  }, [isOpenDialog]);

  const handleDialogClose = () => {
    deleteParams(["dialog", "officeId", "officeName"]);
    setPage(1);
    setSearchTerm("");
    setAllSites([]);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const hasMore = responseData?.hasMore ?? false;
  const totalCount = responseData?.totalCount ?? 0;

  return (
    <DialogWindow
      open={isOpenDialog}
      setOpen={handleDialogClose}
      isLoading={false}
      title='Office Sites'
      description={`All sites for ${officeName || "this office"}`}
      size='xl'
      heightMode='full'>
      <div className='space-y-4'>
        {/* Search Bar */}
        <div className='relative pt-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
          <input
            type='text'
            placeholder='Search sites by name, city or address...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50/50 focus:bg-white'
          />
        </div>

        {/* Summary Card */}
        <div className='flex items-center justify-between px-1'>
          <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>
            Site Locations
          </p>
          <p className='text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full'>
            {totalCount} total
          </p>
        </div>

        {/* Sites List */}
        {isLoading && page === 1 ? (
          <Loading />
        ) : allSites.length === 0 ? (
          <div className='text-center py-12 text-muted-foreground'>
            No sites found for this office
          </div>
        ) : (
          <>
            <div className='grid gap-4'>
              {allSites.map((site) => (
                <Card
                  key={site.id}
                  className=' py-4 gap-4 rounded-sm'>
                  <CardHeader className='px-4 gap-0'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <CardTitle className='text-base flex items-center gap-2'>
                          {capitalizeEachWord(site.name)}{" "}
                          {site.status === "active" ? (
                            <span className='bg-green-100 text-green-800 px-2 rounded-full text-xs'>
                              Active
                            </span>
                          ) : (
                            <span className='bg-red-100 text-red-800 px-2 rounded-full text-xs'>
                              Inactive
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className='text-xs'>
                          {capitalFirstLetter(site.address)},{" "}
                          {capitalizeEachWord(site.city)},{" "}
                          {capitalizeEachWord(site.state)} - {site.pincode}
                        </CardDescription>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='text-xs text-muted-foreground'>
                          {format(new Date(site.created_at), "dd MMM yyyy")}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className='px-4'>
                    {site.users && site.users.length > 0 ? (
                      <div className='border rounded-lg bg-white overflow-x-auto'>
                        <Table className='bg-gray-100/50'>
                          <TableHeader>
                            <TableRow>
                              <TableHead className='text-xs h-8'>
                                Name
                              </TableHead>
                              <TableHead className='text-xs h-8'>
                                Role
                              </TableHead>
                              <TableHead className='text-xs h-8'>
                                Email
                              </TableHead>
                              <TableHead className='text-xs h-8'>
                                Contact
                              </TableHead>
                              <TableHead className='text-xs h-8 text-right w-[72px]'>
                                Remove
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {site.users.map((user: any, idx: number) => (
                              <TableRow
                                key={`${site.id}-${user.user_id ?? user.email}-${idx}`}>
                                <TableCell className='text-xs py-2'>
                                  <div className='flex items-center gap-2'>
                                    <StatusIndicator
                                      status={
                                        user.status ? "active" : "inactive"
                                      }
                                      size='sm'
                                    />
                                    {capitalizeEachWord(user.name || "N/A")}
                                  </div>
                                </TableCell>
                                <TableCell className='text-xs py-2'>
                                  {capitalizeEachWord(user.role || "N/A")}
                                </TableCell>
                                <TableCell className='text-xs py-2'>
                                  {user.email || "N/A"}
                                </TableCell>
                                <TableCell className='text-xs py-2'>
                                  {user.contact_number || "N/A"}
                                </TableCell>
                                <TableCell className='text-xs py-2 text-right'>
                                  {typeof user.user_id === "number" ? (
                                    <button
                                      type='button'
                                      disabled={removeFromSite.isPending}
                                      onClick={() =>
                                        removeFromSite.mutate({
                                          site_id: site.id,
                                          user_id: user.user_id,
                                        })
                                      }
                                      className='inline-flex rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50'
                                      aria-label={`Remove ${user.name || "operator"} from site`}>
                                      <UserMinus className='h-4 w-4' />
                                    </button>
                                  ) : null}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <span className='text-xs text-gray-500 py-1 bg-red-50 rounded px-2'>
                        No operators assigned to this site yet.
                      </span>
                    )}
                    <SiteOperatorsSection
                      siteId={site.id}
                      siteUsers={site.users ?? []}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <LoadMoreBtn
                onClick={handleLoadMore}
                loading={isFetching && page > 1}
              />
            )}

            {/* Showing count */}
            <div className='text-center text-sm text-muted-foreground pb-4'>
              Showing {allSites.length} of {totalCount} sites
            </div>
          </>
        )}
      </div>
    </DialogWindow>
  );
};

export default OfficeDetailsDialog;
