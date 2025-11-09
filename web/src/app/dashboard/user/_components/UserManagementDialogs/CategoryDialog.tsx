import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserTable from "../UserTable";

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
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  users: User[];
  onEdit: (user: User) => void;
  // onDelete: (user: User) => void;
  // onAssignOffice: (user: User) => void;
  // onAssignSite: (user: User) => void;
  // onViewWorkLocations: (user: User) => void;
}

const CategoryDialog = ({
  open,
  setOpen,
  title,
  description,
  users,
  onEdit,
}: // onDelete,
// onAssignOffice,
// onAssignSite,
// onViewWorkLocations,
Props) => {
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogContent className='max-w-6xl max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className='mt-4'>
          <UserTable
            users={users}
            onEdit={onEdit}

            // onDelete={onDelete}
            // onAssignOffice={onAssignOffice}
            // onAssignSite={onAssignSite}
            // onViewWorkLocations={onViewWorkLocations}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
