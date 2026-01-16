# useHandleParams Hook

A reusable React hook for managing URL search parameters in Next.js applications following best practices.

## Features

- ✅ **Type-safe**: Written in TypeScript
- ✅ **Optimized**: Uses `useCallback` to prevent unnecessary re-renders
- ✅ **Flexible**: Set, delete, or update single or multiple params
- ✅ **Clean API**: Intuitive method names and usage patterns

## Installation

The hook is already available at `@/hooks/useHandleParams`.

## Usage

### Import the hook

```tsx
import { useHandleParams } from "@/hooks/useHandleParams";
```

### Basic Usage

```tsx
const MyComponent = () => {
  const { setParam, deleteParam, getParam } = useHandleParams();

  // Set a single parameter
  const openDialog = () => {
    setParam("mode", "add");
  };

  // Delete a single parameter
  const closeDialog = () => {
    deleteParam("mode");
  };

  // Get a parameter value
  const mode = getParam("mode"); // or use useSearchParams().get("mode")

  return <button onClick={openDialog}>Open Dialog</button>;
};
```

### Advanced Usage

#### Set Multiple Parameters

```tsx
const { setParams } = useHandleParams();

// Set multiple parameters at once
setParams({
  mode: "edit",
  id: "123",
  tab: "details",
});
```

#### Delete Multiple Parameters

```tsx
const { deleteParams } = useHandleParams();

// Delete multiple parameters at once
deleteParams(["mode", "id"]);
```

#### Update Parameters (Set + Delete)

```tsx
const { updateParams } = useHandleParams();

// Update by setting some params and deleting others
updateParams(
  { tab: "settings" }, // Set these
  ["mode", "id"] // Delete these
);
```

#### Clear All Parameters

```tsx
const { clearAllParams } = useHandleParams();

// Remove all search parameters from URL
clearAllParams();
```

## API Reference

### `setParam(key: string, value: string)`

Set a single URL search parameter.

### `deleteParam(key: string)`

Delete a single URL search parameter.

### `setParams(paramsObject: Record<string, string>)`

Set multiple URL search parameters at once.

### `deleteParams(keys: string[])`

Delete multiple URL search parameters at once.

### `updateParams(set?: Record<string, string>, del?: string[])`

Update URL search parameters by setting some and deleting others in a single operation.

### `getParam(key: string)`

Get the current value of a search parameter. Returns `null` if not found.

### `clearAllParams()`

Clear all URL search parameters.

## Examples in the Codebase

### User Management (`page.tsx`)

```tsx
const { setParam } = useHandleParams();

const handleTabChange = (value: string) => {
  setParam("tab", value);
};

const handleAddUserDialogOpen = () => {
  setParam("mode", "add");
};
```

### Add User Dialog (`AddUserDialog.tsx`)

```tsx
const { deleteParams } = useHandleParams();

const handleCloseDialog = useCallback(() => {
  deleteParams(["mode", "id"]);
  // ... other cleanup
}, [deleteParams]);
```

## Best Practices

1. **Use destructuring**: Only import the methods you need to keep components clean.
2. **Memoization**: The hook methods are already memoized with `useCallback`, so they're safe to use in dependency arrays.
3. **Combine operations**: Use `updateParams` when you need to both set and delete params to avoid multiple navigation calls.

## Benefits Over Manual URLSearchParams

- **Less boilerplate**: No need to repeat `new URLSearchParams(searchParams.toString())` everywhere
- **Consistency**: All URL param manipulations follow the same pattern
- **Maintainability**: Centralized logic makes updates easier
- **Type safety**: TypeScript ensures correct usage
- **Optimized**: Automatic memoization prevents performance issues
