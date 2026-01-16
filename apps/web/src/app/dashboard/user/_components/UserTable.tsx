"use client";
import React, { useState, useEffect } from "react";
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
  UserIcon,
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
import { useUserManagementContext } from "@/contexts/UserManagementContext";
import { trpc } from "@/lib/trpc";
import Loading from "@/components/Loading";
import { capitalFirstLetter, capitalizeEachWord } from "@pkg/utils";
import type { User } from "@/types/user.types";
import useHandleParams from "@/hooks/useHandleParams";
import NoFetchData from "@/components/NoFetchData";

const UserTable = () => {
  const { setParams } = useHandleParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [allUsersList, setAllUsersList] = useState<User[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  const { userNamesOrder, setUserNamesOrder, searchQuery, filters } =
    useUserManagementContext();

  const allUsersQueryLimit = 100;

  const getAllUsersQuery = trpc.userQuery.getAllUser.useQuery({
    page: currentPage,
    limit: allUsersQueryLimit,
    searchQuery: searchQuery || undefined,
    role: filters.role,
    status: filters.status,
    userNamesOrder,
  });

  const isAllUserQueryLoading = getAllUsersQuery.isLoading;
  const { users, pagination: fetchedPagination } = getAllUsersQuery?.data || {
    users: [],
    pagination: null,
  };

  const isInitialLoading =
    isAllUserQueryLoading &&
    currentPage === 1 &&
    searchQuery === "" &&
    filters.role === "all" &&
    filters.status === "all" &&
    userNamesOrder === "latest";

  const isFetchingMore = getAllUsersQuery.isFetching && currentPage > 1;

  useEffect(() => {
    setCurrentPage(1);
    setAllUsersList([]);
  }, [searchQuery, filters.role, filters.status]);

  useEffect(() => {
    if (!users || isAllUserQueryLoading) return;
    if (fetchedPagination?.page !== currentPage) return;

    if (currentPage === 1) {
      setAllUsersList(users);
    } else {
      setAllUsersList((prev) => [...prev, ...users]);
    }
    setPagination(fetchedPagination);
  }, [users, currentPage, isAllUserQueryLoading, fetchedPagination]);

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "manager":
        return "default";
      default:
        return "outline";
    }
  };

  const handleNameSort = () => {
    if (userNamesOrder === "latest") {
      setUserNamesOrder("oldest");
    } else if (userNamesOrder === "oldest") {
      setUserNamesOrder("asc");
    } else if (userNamesOrder === "asc") {
      setUserNamesOrder("desc");
    } else {
      setUserNamesOrder("latest");
    }
  };

  const getSortIcon = () => {
    if (userNamesOrder === "asc") {
      return <ArrowUp className='h-4 w-4' />;
    } else if (userNamesOrder === "desc") {
      return <ArrowDown className='h-4 w-4' />;
    } else if (userNamesOrder === "latest") {
      return <ArrowDownWideNarrow className='h-4 w-4' />;
    } else {
      return <ArrowUpNarrowWide className='h-4 w-4' />;
    }
  };

  const getSortLabel = () => {
    if (userNamesOrder === "asc") {
      return "A-Z";
    } else if (userNamesOrder === "desc") {
      return "Z-A";
    } else if (userNamesOrder === "latest") {
      return "Latest";
    } else {
      return "Oldest";
    }
  };

  if (isInitialLoading) return <Loading />;

  if (allUsersList.length === 0)
    return (
      <NoFetchData
        Icon={UserIcon}
        title='No Users Found'
        description='Add users to manage them'
      />
    );

  console.log(allUsersList);

  return (
    <div className='border rounded-lg bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='text-xs'>Status</TableHead>
            <TableHead className='text-xs'>
              <button
                onClick={handleNameSort}
                className='flex items-center gap-2 hover:text-foreground transition-colors font-medium'>
                Name
                {getSortIcon()}
                <span className='text-xs font-normal text-muted-foreground'>
                  ({getSortLabel()})
                </span>
              </button>
            </TableHead>
            <TableHead className='text-xs'>Email</TableHead>
            <TableHead className='text-xs'>Contact</TableHead>
            <TableHead className='text-xs'>Role</TableHead>
            <TableHead className='text-xs flex gap-1.5 items-center'>
              <span className='text-xs font-medium bg-cyan-800/15 px-1.5 text-gray-800 py-0.5 rounded-sm'>
                Offices
              </span>
              <span>/</span>
              <span className='text-xs font-medium bg-orange-800/15 px-1.5 text-gray-800 py-0.5 rounded-sm'>
                Sites
              </span>
            </TableHead>
            <TableHead className='text-xs text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allUsersList?.map((user) => (
            <TableRow key={user.id}>
              <TableCell className='pl-6'>
                {user.status === "active" ? (
                  <div className='text-green-500 h-3 w-3 rounded-full bg-green-500'></div>
                ) : (
                  <div className='text-red-500 h-3 w-3 rounded-full bg-red-500'></div>
                )}
              </TableCell>
              <TableCell className='text-xs font-medium'>
                {capitalizeEachWord(user.name)}
              </TableCell>
              <TableCell className='text-xs'>{user.email}</TableCell>
              <TableCell className='text-xs'>
                {user.contact_number || "- - - - - - -"}
              </TableCell>
              <TableCell className='text-xs'>
                <Badge
                  variant={getRoleBadgeVariant(user.role)}
                  className={`${user.role === "manager" ? "bg-cyan-800" : ""}`}>
                  {capitalFirstLetter(user.role)}
                </Badge>
              </TableCell>
              <TableCell className='text-xs overflow-hidden max-w-[450px] flex flex-wrap gap-1.5'>
                {[...user.offices, ...user.sites].sort((a, b) =>
                  a.name.localeCompare(b.name)
                ).length > 0 ? (
                  <>
                    {[...user.offices, ...user.sites].map((uo) => (
                      <Badge
                        key={uo.id}
                        variant='outline'
                        className={`text-xs px-1.5 ${uo.type === "office" ? "bg-cyan-800/15" : "bg-orange-800/15"}`}>
                        {capitalFirstLetter(uo.name) || "Unknown Office"}
                      </Badge>
                    ))}
                  </>
                ) : (
                  <span className='text-xs text-muted-foreground'>
                    No offices & sites
                  </span>
                )}

                {/* {user.offices.length > 0 ? (
                  <div className='flex flex-col gap-1'>
                    {user.offices.map((uo) => (
                      <div
                        key={uo.id}
                        className='flex items-center gap-1 flex-wrap'>
                        <Badge
                          variant='outline'
                          className='text-xs'>
                          {uo.name || "Unknown Office"}
                        </Badge>
                        <Badge
                          variant='secondary'
                          className='text-xs px-1.5 py-0'>
                          Office
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className='text-xs text-muted-foreground'>
                    No offices
                  </span>
                )}

                {user.sites.length > 0 ? (
                  <div className='flex flex-col gap-1'>
                    {user.sites.map((us) => (
                      <div
                        key={us.id}
                        className='flex items-center gap-1 flex-wrap'>
                        <Badge
                          variant='outline'
                          className='text-xs'>
                          {us.name || "Unknown Site"}
                        </Badge>
                        <Badge
                          variant='secondary'
                          className='text-xs px-1.5 py-0'>
                          Site
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className='text-xs text-muted-foreground'>
                    No sites
                  </span>
                )} */}
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
                      onClick={() => {
                        setParams({
                          dialog: "update-user",
                          id: user.id.toString(),
                        });
                      }}>
                      <Edit className='mr-2 h-4 w-4' />
                      Edit User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}

          {pagination?.hasMore && (
            <TableRow>
              <TableCell
                colSpan={8}
                className='text-center'>
                <LoadMoreBtn
                  onClick={handleLoadMore}
                  loading={isFetchingMore}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
