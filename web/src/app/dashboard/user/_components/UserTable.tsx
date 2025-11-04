import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Building2, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface Office {
  id: number;
  name: string;
  city: string;
  state: string;
}

interface UserOffice {
  id: number;
  office_id: number;
  role: string;
  office: Office;
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
}

interface Props {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onAssignOffice: (user: User) => void;
  onAssignSite: (user: User) => void;
  onViewWorkLocations: (user: User) => void;
}

const UserTable = ({
  users,
  onEdit,
  onDelete,
  onAssignOffice,
  onAssignSite,
  onViewWorkLocations,
}: Props) => {
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

  const getStatusBadgeVariant = (status: string) => {
    return status === "active" ? "default" : "outline";
  };

  return (
    <div className='border rounded-lg bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Offices</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className='text-center py-8 text-muted-foreground'>
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className='font-medium'>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.contact_number || "-"}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.offices.length > 0 ? (
                    <div className='flex flex-col gap-1'>
                      {user.offices.map((uo) => (
                        <div
                          key={uo.id}
                          className='flex items-center gap-1 flex-wrap'>
                          <Badge
                            variant='outline'
                            className='text-xs'>
                            {uo.office.name}
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
                      <DropdownMenuItem onClick={() => onAssignOffice(user)}>
                        <Building2 className='mr-2 h-4 w-4' />
                        Manage Offices
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAssignSite(user)}>
                        <MapPin className='mr-2 h-4 w-4' />
                        Assign to Site
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onViewWorkLocations(user)}>
                        <MapPin className='mr-2 h-4 w-4' />
                        View Work Locations
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(user)}
                        className='text-destructive focus:text-destructive'>
                        <Trash2 className='mr-2 h-4 w-4' />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
