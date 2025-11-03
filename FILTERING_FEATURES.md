# User Management - Filtering & Multi-Office Support

## New Features Added

### 1. Advanced Filtering System

A comprehensive filtering component (`UserFilters.tsx`) has been added with the following capabilities:

#### Filter Options:

- **Role Filter**: Filter by admin, manager, operator, staff, or viewer
- **Status Filter**: Filter by active or inactive users
- **Office Filter**: Show users assigned to a specific office
- **Assignment Filter**: View users with or without office assignments

#### Filter Features:

- ✅ Combined filters work together
- ✅ Active filter count badge
- ✅ Quick reset button
- ✅ Results counter showing filtered vs total users
- ✅ Responsive grid layout

### 2. Multi-Office Support

Users can now be assigned to **multiple offices** with **different roles** in each:

#### Example:

```typescript
{
  id: 1,
  name: "John Doe",
  offices: [
    {
      office: { name: "Delhi Office" },
      role: "manager"  // Manager in Delhi
    },
    {
      office: { name: "Bangalore Office" },
      role: "operator"  // Operator in Bangalore
    }
  ]
}
```

#### Visual Improvements:

- Each office assignment shows both office name and role as badges
- Office role badges display next to office name in the table
- Clear visual distinction between different roles at different offices

### 3. Enhanced Search

Search now includes:

- Name
- Email
- Role
- Contact number

### 4. Updated Components

#### New Files:

- `UserFilters.tsx` - Advanced filtering component

#### Modified Files:

- `page.tsx` - Added filtering state and logic
- `UserTable.tsx` - Updated to show office roles as separate badges
- Mock data expanded to demonstrate multi-office scenarios

## Usage Examples

### Filtering Users

```typescript
// Show only active managers
filters = {
  role: "manager",
  status: "active",
  officeId: "all",
  hasOffices: "all",
};

// Show users in Delhi Office who are managers
filters = {
  role: "all",
  status: "all",
  officeId: "1", // Delhi Office ID
  hasOffices: "all",
};

// Show users without office assignments
filters = {
  role: "all",
  status: "all",
  officeId: "all",
  hasOffices: "unassigned",
};
```

### Multi-Office Assignment

Users can be:

- Manager in one office, operator in another
- Assigned to multiple offices simultaneously
- Removed from specific offices while maintaining others

## Database Schema Support

The filtering and multi-office features align with your existing schema:

```sql
user_offices table:
- user_id (references users)
- office_id (references offices)
- role (manager/operator) -- Role specific to THIS office
- assigned_by
```

This allows:

- One user → Many offices (one-to-many)
- Different roles per office assignment
- Independent management of each office assignment

## UI/UX Improvements

1. **Filter Section**: Clean, organized filter controls with responsive layout
2. **Active Filters Badge**: Shows how many filters are currently applied
3. **Results Counter**: "Showing 3 users (filtered from 7 total)"
4. **Office Badges**: Each office shows its name + role in separate badges
5. **Reset Functionality**: One-click filter reset

## Mock Data

The mock data now includes:

- 7 users with varying roles and statuses
- Multiple office assignments per user
- Different roles at different offices
- Users without office assignments

This demonstrates all filtering scenarios and multi-office capabilities.
