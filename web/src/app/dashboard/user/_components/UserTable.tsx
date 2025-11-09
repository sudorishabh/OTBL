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
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
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

interface UserOffice {
  id: number;
  office_id: number;
  name: string;
  role: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  contact_number?: string | null;
  role: string;
  status: string;
  created_at: string;
  offices: UserOffice[];
  password?: string;
}

interface Props {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
  handleLoadMore: () => void;
  isLoadingData: boolean;
  onEdit: (user: User) => void;
}

const UserTable = ({
  users,
  pagination,
  onEdit,
  handleLoadMore,
  isLoadingData,
}: Props) => {
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(
    new Set()
  );
  const [copiedPasswordId, setCopiedPasswordId] = useState<number | null>(null);

  const { userNamesOrder, setUserNamesOrder } = useUserManagementContext();

  const togglePasswordVisibility = (userId: number) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const copyPassword = async (userId: number, password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedPasswordId(userId);
      setTimeout(() => setCopiedPasswordId(null), 1000);
    } catch (err) {
      console.error("Failed to copy password:", err);
    }
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

  return (
    <div className='border rounded-lg bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='pl-8 text-xs'>
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
            {/* <TableHead>Status</TableHead> */}
            <TableHead className='text-xs'>Offices</TableHead>
            <TableHead className='text-xs'>Password</TableHead>
            <TableHead className='text-xs text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className='text-center py-8 text-muted-foreground'>
                No users found
              </TableCell>
            </TableRow>
          ) : (
            <>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className='text-xs font-medium flex items-center gap-2'>
                    {user.status === "active" ? (
                      <div className='text-green-500 h-3 w-3 rounded-full bg-green-500'></div>
                    ) : (
                      <div className='text-red-500 h-3 w-3 rounded-full bg-red-500'></div>
                    )}
                    {user.name}
                  </TableCell>
                  <TableCell className='text-xs'>{user.email}</TableCell>
                  <TableCell className='text-xs'>
                    {user.contact_number || "-"}
                  </TableCell>
                  <TableCell className='text-xs'>
                    <Badge
                      variant={getRoleBadgeVariant(user.role)}
                      className={`${
                        user.role === "manager" ? "bg-cyan-800" : ""
                      }`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-xs'>
                    {user.offices.length > 0 ? (
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
                              {uo.role}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className='text-sm text-muted-foreground'>
                        No offices
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='text-xs w-40 '>
                    <div className='group relative flex items-center gap-2'>
                      <span className='font-mono line-clamp-1'>
                        {visiblePasswords.has(user.id)
                          ? user.password || "N/A"
                          : "••••••••"}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(user.id)}
                        className='opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded'
                        title={
                          visiblePasswords.has(user.id)
                            ? "Hide password"
                            : "Show password"
                        }>
                        {visiblePasswords.has(user.id) ? (
                          <EyeOff className='h-4 w-4 text-gray-600' />
                        ) : (
                          <Eye className='h-4 w-4 text-gray-600' />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          copyPassword(user.id, user.password || "")
                        }
                        className='opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded'
                        title='Copy password'>
                        {copiedPasswordId === user.id ? (
                          <Check className='h-4 w-4 text-green-600' />
                        ) : (
                          <Copy className='h-4 w-4 text-gray-600' />
                        )}
                      </button>
                    </div>
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
                        <DropdownMenuItem onClick={() => onEdit(user)}>
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
                    colSpan={7}
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

export default UserTable;
