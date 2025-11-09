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
}

const UserCardTable = ({ users, onEdit }: Props) => {
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
            <TableHead>Password</TableHead>
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
                <TableCell className='text-xs font-medium'>
                  {user.name}
                </TableCell>
                <TableCell className='text-xs'>{user.email}</TableCell>

                <TableCell className='text-xs'>••••••••</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserCardTable;
