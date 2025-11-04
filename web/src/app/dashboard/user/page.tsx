"use client";
import Wrapper from "@/components/Wrapper";
import React, { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import AddUserDialog from "./_components/AddUserDialog";
import AssignOfficeDialog from "./_components/AssignOfficeDialog";
import AssignSiteDialog from "./_components/AssignSiteDialog";
import DeleteUserDialog from "./_components/DeleteUserDialog";
import UserWorkLocationsDialog from "./_components/UserWorkLocationsDialog";
import UserTable from "./_components/UserTable";
import UserFilters from "./_components/UserFilters";
import { Input } from "@/components/ui/input";

// Mock data - replace with actual tRPC queries
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    contact_number: "+91 9876543210",
    role: "manager",
    status: "active",
    created_at: "2024-01-15",
    offices: [
      {
        id: 1,
        office_id: 1,
        role: "manager",
        office: {
          id: 1,
          name: "Delhi Office",
          city: "Delhi",
          state: "Delhi",
        },
      },
      {
        id: 5,
        office_id: 3,
        role: "manager",
        office: {
          id: 3,
          name: "Bangalore Office",
          city: "Bangalore",
          state: "Karnataka",
        },
      },
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    contact_number: "+91 9876543211",
    role: "operator",
    status: "active",
    created_at: "2024-02-20",
    offices: [
      {
        id: 2,
        office_id: 2,
        role: "operator",
        office: {
          id: 2,
          name: "Mumbai Office",
          city: "Mumbai",
          state: "Maharashtra",
        },
      },
    ],
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert.j@example.com",
    contact_number: "+91 9876543212",
    role: "staff",
    status: "inactive",
    created_at: "2024-03-10",
    offices: [],
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    contact_number: "+91 9876543213",
    role: "admin",
    status: "active",
    created_at: "2024-01-05",
    offices: [
      {
        id: 6,
        office_id: 1,
        role: "manager",
        office: {
          id: 1,
          name: "Delhi Office",
          city: "Delhi",
          state: "Delhi",
        },
      },
      {
        id: 7,
        office_id: 2,
        role: "manager",
        office: {
          id: 2,
          name: "Mumbai Office",
          city: "Mumbai",
          state: "Maharashtra",
        },
      },
    ],
  },
  {
    id: 5,
    name: "Michael Brown",
    email: "michael.b@example.com",
    contact_number: "+91 9876543214",
    role: "operator",
    status: "active",
    created_at: "2024-03-15",
    offices: [
      {
        id: 8,
        office_id: 3,
        role: "operator",
        office: {
          id: 3,
          name: "Bangalore Office",
          city: "Bangalore",
          state: "Karnataka",
        },
      },
    ],
  },
  {
    id: 6,
    name: "Emily Davis",
    email: "emily.d@example.com",
    contact_number: "+91 9876543215",
    role: "viewer",
    status: "active",
    created_at: "2024-04-01",
    offices: [],
  },
  {
    id: 7,
    name: "David Martinez",
    email: "david.m@example.com",
    contact_number: "+91 9876543216",
    role: "staff",
    status: "active",
    created_at: "2024-04-10",
    offices: [
      {
        id: 9,
        office_id: 1,
        role: "operator",
        office: {
          id: 1,
          name: "Delhi Office",
          city: "Delhi",
          state: "Delhi",
        },
      },
    ],
  },
];

const mockOffices = [
  { id: 1, name: "Delhi Office" },
  { id: 2, name: "Mumbai Office" },
  { id: 3, name: "Bangalore Office" },
];

const mockWorkLocations = [
  {
    workOrderId: 1,
    workOrderCode: "WO-2024-001",
    workOrderTitle: "Construction Project Alpha",
    siteName: "Site A",
    siteCity: "Delhi",
    siteState: "Delhi",
    role: "manager",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "pending",
  },
  {
    workOrderId: 2,
    workOrderCode: "WO-2024-002",
    workOrderTitle: "Infrastructure Development",
    siteName: "Site B",
    siteCity: "Noida",
    siteState: "Uttar Pradesh",
    role: "operator",
    startDate: "2024-02-01",
    endDate: "2024-11-30",
    status: "pending",
  },
];

const User = () => {
  const [isAddUserDialog, setIsAddUserDialog] = useState(false);
  const [isAssignOfficeDialog, setIsAssignOfficeDialog] = useState(false);
  const [isAssignSiteDialog, setIsAssignSiteDialog] = useState(false);
  const [isDeleteUserDialog, setIsDeleteUserDialog] = useState(false);
  const [isWorkLocationsDialog, setIsWorkLocationsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    officeId: "all",
    hasOffices: "all",
  });
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    name: string;
    email: string;
    contact_number?: string | null;
    role: string;
    status: string;
    offices?: any[];
  } | null>(null);

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsAddUserDialog(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setIsDeleteUserDialog(true);
  };

  const handleAssignOffice = (user: any) => {
    setSelectedUser(user);
    setIsAssignOfficeDialog(true);
  };

  const handleAssignSite = (user: any) => {
    setSelectedUser(user);
    setIsAssignSiteDialog(true);
  };

  const handleViewWorkLocations = (user: any) => {
    setSelectedUser(user);
    setIsWorkLocationsDialog(true);
  };

  const handleConfirmDelete = () => {
    console.log("Delete user:", selectedUser?.id);
    // TODO: Implement actual delete mutation
    // await deleteUser.mutateAsync({ id: selectedUser.id });
  };

  // Advanced filtering with search and multiple criteria
  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      // Search filter
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.contact_number &&
          user.contact_number
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      // Role filter
      const matchesRole = filters.role === "all" || user.role === filters.role;

      // Status filter
      const matchesStatus =
        filters.status === "all" || user.status === filters.status;

      // Office filter - check if user is assigned to the selected office
      const matchesOffice =
        filters.officeId === "all" ||
        user.offices.some((uo) => uo.office_id.toString() === filters.officeId);

      // Has offices filter
      const matchesHasOffices =
        filters.hasOffices === "all" ||
        (filters.hasOffices === "assigned" && user.offices.length > 0) ||
        (filters.hasOffices === "unassigned" && user.offices.length === 0);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesOffice &&
        matchesHasOffices
      );
    });
  }, [mockUsers, searchQuery, filters]);

  return (
    <Wrapper
      title='User Management'
      description='Manage users, assign them to offices, and track their work locations'
      button={
        <CustomButton
          text='Add User'
          Icon={Plus}
          onClick={() => {
            setSelectedUser(null);
            setIsAddUserDialog(true);
          }}
          variant='primary'
        />
      }>
      {/* Search Bar */}
      <div className='my-5'>
        <div className='relative max-w-md bg-white'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            type='text'
            placeholder='Search users by name, email, role, or contact...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      {/* Filters */}
      <div className='mb-5'>
        <UserFilters
          filters={filters}
          setFilters={setFilters}
          availableOffices={mockOffices}
        />
      </div>

      {/* Results count */}
      <div className='mb-3 flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          Showing <span className='font-medium'>{filteredUsers.length}</span>{" "}
          {filteredUsers.length === 1 ? "user" : "users"}
          {(searchQuery ||
            filters.role !== "all" ||
            filters.status !== "all" ||
            filters.officeId !== "all" ||
            filters.hasOffices !== "all") && (
            <span> (filtered from {mockUsers.length} total)</span>
          )}
        </p>
      </div>

      {/* Users Table */}
      <UserTable
        users={filteredUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onAssignOffice={handleAssignOffice}
        onAssignSite={handleAssignSite}
        onViewWorkLocations={handleViewWorkLocations}
      />

      {/* Dialogs */}
      <AddUserDialog
        open={isAddUserDialog}
        setOpen={setIsAddUserDialog}
        isEditInfo={selectedUser}
        setIsEditInfo={setSelectedUser}
      />

      <AssignOfficeDialog
        open={isAssignOfficeDialog}
        setOpen={setIsAssignOfficeDialog}
        userId={selectedUser?.id ?? null}
        userName={selectedUser?.name ?? ""}
        currentOffices={selectedUser?.offices ?? []}
      />

      <AssignSiteDialog
        open={isAssignSiteDialog}
        setOpen={setIsAssignSiteDialog}
        userId={selectedUser?.id ?? null}
        userName={selectedUser?.name ?? ""}
      />

      <DeleteUserDialog
        open={isDeleteUserDialog}
        setOpen={setIsDeleteUserDialog}
        userId={selectedUser?.id ?? null}
        userName={selectedUser?.name ?? ""}
        onConfirm={handleConfirmDelete}
      />

      <UserWorkLocationsDialog
        open={isWorkLocationsDialog}
        setOpen={setIsWorkLocationsDialog}
        userName={selectedUser?.name ?? ""}
        workLocations={mockWorkLocations}
      />
    </Wrapper>
  );
};

export default User;
