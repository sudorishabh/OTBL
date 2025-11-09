import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  ArrowUp,
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  MapPin,
  Phone,
  Mail,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import LoadMoreBtn from "@/components/LoadMoreBtn";
import { useSiteManagementContext } from "@/contexts/SiteManagementContext";

interface Site {
  id: number;
  name: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  contact_person: string;
  contact_number: string;
  email: string;
  status: string;
  created_at: string;
}

interface Props {
  sites: Site[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
  handleLoadMore: () => void;
  isLoadingData: boolean;
  onEdit: (site: Site) => void;
  onView: (site: Site) => void;
}

const SiteTable = ({
  sites,
  pagination,
  onEdit,
  onView,
  handleLoadMore,
  isLoadingData,
}: Props) => {
  const { siteNamesOrder, setSiteNamesOrder } = useSiteManagementContext();

  const handleNameSort = () => {
    if (siteNamesOrder === "latest") {
      setSiteNamesOrder("oldest");
    } else if (siteNamesOrder === "oldest") {
      setSiteNamesOrder("asc");
    } else if (siteNamesOrder === "asc") {
      setSiteNamesOrder("desc");
    } else {
      setSiteNamesOrder("latest");
    }
  };

  const getSortIcon = () => {
    if (siteNamesOrder === "asc") {
      return <ArrowUp className='h-4 w-4' />;
    } else if (siteNamesOrder === "desc") {
      return <ArrowDown className='h-4 w-4' />;
    } else if (siteNamesOrder === "latest") {
      return <ArrowDownWideNarrow className='h-4 w-4' />;
    } else {
      return <ArrowUpNarrowWide className='h-4 w-4' />;
    }
  };

  const getSortLabel = () => {
    if (siteNamesOrder === "asc") {
      return "A-Z";
    } else if (siteNamesOrder === "desc") {
      return "Z-A";
    } else if (siteNamesOrder === "latest") {
      return "Latest";
    } else {
      return "Oldest";
    }
  };

  return (
    <div className='border rounded-lg bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='pl-8 text-xs'>
              <button
                onClick={handleNameSort}
                className='flex items-center gap-2 hover:text-foreground transition-colors font-medium'>
                Site Name
                {getSortIcon()}
                <span className='text-xs font-normal text-muted-foreground'>
                  ({getSortLabel()})
                </span>
              </button>
            </TableHead>
            <TableHead className='text-xs'>Location</TableHead>
            <TableHead className='text-xs'>Contact Person</TableHead>
            <TableHead className='text-xs'>Contact Info</TableHead>
            <TableHead className='text-xs'>Status</TableHead>
            <TableHead className='text-xs text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sites?.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className='text-center py-8 text-muted-foreground'>
                No sites found
              </TableCell>
            </TableRow>
          ) : (
            <>
              {sites?.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className='text-xs font-medium flex items-center gap-2'>
                    {site.status === "active" ? (
                      <div className='text-green-500 h-3 w-3 rounded-full bg-green-500'></div>
                    ) : (
                      <div className='text-red-500 h-3 w-3 rounded-full bg-red-500'></div>
                    )}
                    {site.name}
                  </TableCell>
                  <TableCell className='text-xs'>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-1'>
                        <MapPin className='h-3 w-3 text-muted-foreground' />
                        <span>
                          {site.city}, {site.state}
                        </span>
                      </div>
                      <span className='text-muted-foreground'>
                        PIN: {site.pincode}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='text-xs'>
                    <div className='flex items-center gap-1'>
                      <User className='h-3 w-3 text-muted-foreground' />
                      {site.contact_person}
                    </div>
                  </TableCell>
                  <TableCell className='text-xs'>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-1'>
                        <Phone className='h-3 w-3 text-muted-foreground' />
                        <span>{site.contact_number}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Mail className='h-3 w-3 text-muted-foreground' />
                        <span className='text-muted-foreground'>
                          {site.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-xs'>
                    <Badge
                      variant={
                        site.status === "active" ? "default" : "secondary"
                      }
                      className={`${
                        site.status === "active"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-500"
                      }`}>
                      {site.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          className='h-8 w-8 p-0'>
                          <span className='sr-only'>Open menu</span>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => onView(site)}
                          className='cursor-pointer'>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit(site)}
                          className='cursor-pointer'>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit Site
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {pagination?.hasMore && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='text-center'>
                    <LoadMoreBtn
                      onClick={handleLoadMore}
                      loading={isLoadingData}
                    />
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SiteTable;
