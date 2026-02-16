import React, { useState } from "react";
import DialogWindow from "@/components/DialogWindow";
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
import { capitalizeEachWord } from "@pkg/utils";
import StatusIndicator from "@/components/StatusIndicator";

const ITEMS_PER_PAGE = 10;

const OfficeDetailsDialog = () => {
  const { getParam, deleteParams } = useHandleParams();
  const isOpenDialog = getParam("dialog") === "view-office";
  const officeId = getParam("officeId");
  const officeName = getParam("officeName");

  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } =
    trpc.siteQuery.getSitesByOfficeId.useQuery(
      {
        office_id: Number(officeId),
        searchQuery: "",
        status: "all",
        page,
        limit: ITEMS_PER_PAGE,
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
  React.useEffect(() => {
    if (responseData?.sites) {
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
  }, [responseData?.sites, page]);

  // Reset page when dialog closes
  React.useEffect(() => {
    if (!isOpenDialog) {
      setPage(1);
      setAllSites([]);
    }
  }, [isOpenDialog]);

  const handleDialogClose = () => {
    deleteParams(["dialog", "officeId", "officeName"]);
    setPage(1);
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
        {/* Summary Card */}
        {/* <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg'>Summary</CardTitle>
            <CardDescription>Total sites: {totalCount}</CardDescription>
          </CardHeader>
        </Card> */}

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
                  className='hover:shadow-md transition-shadow'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <CardTitle className='text-base flex items-center gap-2'>
                          <StatusIndicator
                            status={
                              site.status === "active" ? "active" : "inactive"
                            }
                            size='sm'
                          />
                          {capitalizeEachWord(site.name)}
                        </CardTitle>
                        <CardDescription className='text-xs mt-1'>
                          {site.address}, {site.city}, {site.state} -{" "}
                          {site.pincode}
                        </CardDescription>
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {new Date(site.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>

                  {site.users && site.users.length > 0 && (
                    <CardContent>
                      <div className='border rounded-lg bg-white'>
                        <Table>
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
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {site.users.map((user: any, idx: number) => (
                              <TableRow key={`${site.id}-${user.email}-${idx}`}>
                                <TableCell className='text-xs py-2 flex items-center gap-2'>
                                  <StatusIndicator
                                    status={user.status ? "active" : "inactive"}
                                    size='sm'
                                  />
                                  {capitalizeEachWord(user.name || "N/A")}
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
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  )}
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
