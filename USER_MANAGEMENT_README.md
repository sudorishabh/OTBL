# User Management Page - Installation Notes

## Created Components

The following components were successfully created for the User Management page:

### Main Page

- `web/src/app/user/page.tsx` - Main user management page with search functionality

### Dialog Components

1. `web/src/app/user/_components/AddUserDialog.tsx` - Create/Edit user dialog
2. `web/src/app/user/_components/AssignOfficeDialog.tsx` - Assign users to offices
3. `web/src/app/user/_components/DeleteUserDialog.tsx` - Delete user confirmation
4. `web/src/app/user/_components/UserWorkLocationsDialog.tsx` - View user work locations
5. `web/src/app/user/_components/UserTable.tsx` - Users table with actions

### UI Components

- `web/src/components/ui/table.tsx` - Table components (created)
- `web/src/components/ui/select.tsx` - Select components (created, but using native select in forms)

## Features Implemented

### 1. User CRUD Operations

- ✅ **Create User**: Add new users with name, email, password, contact, role, and status
- ✅ **Edit User**: Update existing user information (password field hidden in edit mode)
- ✅ **Delete User**: Remove users with confirmation dialog
- ✅ **Search Users**: Search by name, email, or role

### 2. Office Assignment

- ✅ **Assign to Office**: Assign users to one or multiple offices
- ✅ **Set Office Role**: Define user role per office (manager/operator)
- ✅ **Remove Assignment**: Remove user from offices
- ✅ **View Current Offices**: See all offices assigned to a user

### 3. Work Location Tracking

- ✅ **View Work Locations**: See all sites where user is currently working
- ✅ **Work Order Details**: View work order code, title, and status
- ✅ **Site Information**: See site name, city, and state
- ✅ **Timeline**: View start and end dates for each assignment

### 4. User Table

- ✅ **Display All Users**: Show comprehensive user information
- ✅ **Role Badges**: Color-coded role indicators
- ✅ **Status Badges**: Active/Inactive status display
- ✅ **Office Chips**: Show assigned offices
- ✅ **Actions Menu**: Dropdown with Edit, Manage Offices, View Locations, and Delete

## Mock Data Structure

The page currently uses mock data for demonstration. Here's the structure:

\`\`\`typescript
// User
{
id: number;
name: string;
email: string;
contact_number?: string;
role: "admin" | "manager" | "staff" | "viewer" | "operator";
status: "active" | "inactive";
created_at: string;
offices: UserOffice[];
}

// Work Location
{
workOrderId: number;
workOrderCode: string;
workOrderTitle: string;
siteName: string;
siteCity: string;
siteState: string;
role: string;
startDate: string;
endDate: string;
status: "pending" | "completed" | "cancelled";
}
\`\`\`

## Next Steps (Backend Integration)

To connect this UI to your backend, you'll need to:

### 1. Create tRPC Queries

\`\`\`typescript
// server/src/modules/user/user.query.routes.ts

- getUsers() - Fetch all users with their office assignments
- getUserById(id) - Fetch specific user details
- getUserWorkLocations(userId) - Fetch user's work locations
  \`\`\`

### 2. Create tRPC Mutations

\`\`\`typescript
// server/src/modules/user/user.mutation.routes.ts

- createUser(data) - Create new user
- updateUser(id, data) - Update user information
- deleteUser(id) - Delete user
- assignUserToOffice(userId, officeId, role) - Assign user to office
- removeUserFromOffice(userOfficeId) - Remove office assignment
  \`\`\`

### 3. Update Mock Data References

Replace all instances of:

- \`mockUsers\` with \`trpc.userQuery.getUsers.useQuery()\`
- \`mockWorkLocations\` with \`trpc.userQuery.getUserWorkLocations.useQuery()\`
- \`mockOffices\` in AssignOfficeDialog with \`trpc.officeQuery.getOffices.useQuery()\`

### 4. Uncomment Mutation Calls

In each dialog component, uncomment the mutation calls and remove console.log statements:

- AddUserDialog: \`addUser.mutateAsync()\` and \`editUser.mutateAsync()\`
- AssignOfficeDialog: \`assignOffice.mutateAsync()\` and \`removeOfficeAssignment.mutateAsync()\`
- DeleteUserDialog: \`deleteUser.mutateAsync()\`

## Optional Package Installation

If you want to use the Radix UI Select component instead of native select:

\`\`\`bash
cd web
pnpm add @radix-ui/react-select
\`\`\`

Then replace the native select elements in the forms with the Select component from \`@/components/ui/select\`.

## Database Schema Reference

The UI is designed to work with your existing schema:

- \`users\` table - Main user information
- \`user_offices\` table - Office assignments with roles
- \`work_orders\` and \`work_order_sites\` - For work location tracking

## UI Features

- Responsive design
- Search functionality
- Action dropdown menus
- Color-coded badges for roles and status
- Confirmation dialogs for destructive actions
- Form validation with Zod schemas
- Clean, modern interface matching your existing design system
