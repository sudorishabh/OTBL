# URL Search Params Pattern for Dialog Control

## Overview

This document explains how to use URL search parameters to control dialog open/close state in Next.js applications. This pattern provides better UX with shareable URLs, browser back button support, and state persistence.

## Benefits

✅ **Shareable URLs** - Users can share links that open specific dialogs  
✅ **Browser History** - Back button closes dialogs naturally  
✅ **Deep Linking** - Can link directly to specific application states  
✅ **State Persistence** - Refreshing the page maintains dialog state  
✅ **No Prop Drilling** - URL is the single source of truth

## Implementation Pattern

### 1. Parent Component (`page.tsx`)

```tsx
import { useSearchParams, useRouter } from "next/navigation";

const User = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read the mode from URL params
  const mode = searchParams.get("mode"); // "add", "edit", or null

  // Handler to update URL params
  const handleAddUserDialogOpen = (mode?: "add" | "edit") => {
    const params = new URLSearchParams(searchParams.toString());

    if (mode) {
      params.set("mode", mode); // Add/update param
    } else {
      params.delete("mode"); // Remove param to close
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <>
      {/* Button to open dialog */}
      <CustomButton
        onClick={() => handleAddUserDialogOpen("add")}
        text='Add User'
      />

      {/* Pass props to child component */}
      <UserTable
        isAddUserOpen={mode === "add" || mode === "edit"}
        openAddUser={() => handleAddUserDialogOpen("add")}
        closeAddUser={() => handleAddUserDialogOpen(undefined)}
      />
    </>
  );
};
```

### 2. Child Component (`UserTable.tsx`)

```tsx
interface Props {
  isAddUserOpen?: boolean;
  openAddUser?: () => void;
  closeAddUser?: () => void;
}

const UserTable = ({
  isAddUserOpen = false,
  openAddUser,
  closeAddUser,
}: Props) => {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  // Sync prop changes with local state
  useEffect(() => {
    if (isAddUserOpen !== isAddUserDialogOpen) {
      setIsAddUserDialogOpen(isAddUserOpen);
    }
  }, [isAddUserOpen]);

  return (
    <>
      {/* Table content */}
      <DropdownMenuItem
        onClick={() => {
          setSelectedUser(user);
          setIsAddUserDialogOpen(true);
        }}>
        Edit User
      </DropdownMenuItem>

      {/* Dialog */}
      <AddUserDialog
        open={isAddUserDialogOpen}
        setOpen={() => {
          setIsAddUserDialogOpen(false);
          if (closeAddUser) {
            closeAddUser(); // This updates the URL
          }
        }}
        isEditInfo={selectedUser}
        setIsEditInfo={setSelectedUser}
      />
    </>
  );
};
```

### 3. Dialog Component (`AddUserDialog.tsx`)

```tsx
interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  isEditInfo: IUser | null;
  setIsEditInfo: (isEditInfo: IUser | null) => void;
}

const AddUserDialog = ({ open, setOpen, isEditInfo, setIsEditInfo }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle dialog close - clean up state and URL
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Clear local state
      form.reset();
      setIsEditInfo(null);
      setCreatedCredentials(null);

      // Remove mode param from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("mode");
      router.push(`?${params.toString()}`);
    }
  };

  return (
    <DialogWindow
      open={open}
      setOpen={handleOpenChange}
      title={isEditInfo ? "Edit User" : "Add User"}>
      {/* Dialog content */}
    </DialogWindow>
  );
};
```

## Data Flow

### Opening Dialog:

1. User clicks "Add User" button
2. `handleAddUserDialogOpen("add")` is called
3. URL is updated to `?mode=add`
4. `mode` variable changes from `null` to `"add"`
5. `isAddUserOpen` prop becomes `true`
6. `UserTable` useEffect updates local state
7. Dialog receives `open={true}` and renders

### Closing Dialog:

1. User clicks close/cancel or presses ESC
2. `setOpen(false)` is called in AddUserDialog
3. `handleOpenChange(false)` clears state and updates URL
4. URL param `mode` is removed
5. Parent re-renders with `mode = null`
6. `isAddUserOpen` becomes `false`
7. Dialog closes

## URL Examples

- **Default state**: `/dashboard/user`
- **Adding user**: `/dashboard/user?mode=add`
- **Editing user**: `/dashboard/user?mode=edit`
- **With tab**: `/dashboard/user?tab=categorized&mode=add`

## Best Practices

1. **Use URL as single source of truth**: Each component reads URL params directly via `useSearchParams()`
2. **Eliminate prop drilling**: No need to pass `isOpen`, `onOpen`, `onClose` props through multiple levels
3. **Clean up state**: Always reset form/dialog state when closing via `handleOpenChange`
4. **Preserve other params**: Use `new URLSearchParams(searchParams.toString())` to maintain existing params
5. **Type safety**: Use string literal types for param values (`"add" | "edit"`)
6. **Consistent handlers**: Use the same pattern for opening and closing across all dialogs

## Common Issues

### Issue: Dialog doesn't open

- **Cause**: Not passing `isAddUserOpen` prop correctly
- **Fix**: Ensure `mode === "add" || mode === "edit"` logic is correct

### Issue: URL doesn't update

- **Cause**: Not calling `router.push()` with updated params
- **Fix**: Always update URL in the handler function

### Issue: State persists after closing

- **Cause**: Not resetting state in `handleOpenChange`
- **Fix**: Clear all relevant state before removing URL param

## TypeScript Types

```tsx
// Filter types should match backend API
type RoleFilter = "all" | "manager" | "staff" | "viewer" | "operator";
type StatusFilter = "all" | "active" | "inactive";

// Context type
type UserManagementContextType = {
  filters: {
    role: RoleFilter;
    status: StatusFilter;
  };
  setFilters: (filters: { role: RoleFilter; status: StatusFilter }) => void;
};
```

## Key Takeaways

- URL params provide a clean way to manage modal/dialog state
- This pattern works great with Next.js App Router
- Always maintain sync between URL, props, and local state
- Type safety prevents runtime errors with invalid param values
