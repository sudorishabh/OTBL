/**
 * @deprecated This file is kept for backward compatibility.
 * Import from './SiteDetails' instead.
 *
 * New folder structure:
 * - SiteDetails/
 *   ├── index.ts                    # Main exports
 *   ├── SiteDetailsDialog.tsx       # Main dialog component
 *   ├── SiteInfoCard.tsx            # Site info display
 *   ├── types.ts                    # Shared types and constants
 *   ├── states/                     # Loading and empty states
 *   │   ├── index.ts
 *   │   ├── LoadingState.tsx
 *   │   └── EmptyActivitiesState.tsx
 *   ├── ActivityDetails/            # Activity-related components
 *   │   ├── index.ts
 *   │   ├── ActivityDetailsDialog.tsx
 *   │   ├── ActivityListItem.tsx
 *   │   └── ItemTypeCard.tsx
 *   └── ItemDisplay/                # Item display components
 *       ├── index.ts
 *       └── ImprovedItemCard.tsx
 */

export { SiteDetailsDialog as default } from "./SiteDetails";
export * from "./SiteDetails";
