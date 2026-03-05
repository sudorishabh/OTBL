# OTBL Mobile App — Implementation Plan

> **ONGC TERI Biotech Limited — Management System Mobile Application**
> Replicating the full web application as a production-ready iOS & Android app.

---

## Table of Contents

1. [Technical Architecture Overview](#1-technical-architecture-overview)
2. [Technology Stack Recommendation](#2-technology-stack-recommendation)
3. [Feature Inventory (Web → Mobile Mapping)](#3-feature-inventory-web--mobile-mapping)
4. [Step-by-Step Implementation Plan](#4-step-by-step-implementation-plan)
5. [Folder / Project Structure](#5-folder--project-structure)
6. [Estimated Timeline Breakdown](#6-estimated-timeline-breakdown)
7. [Deployment Strategy (App Store & Play Store)](#7-deployment-strategy-app-store--play-store)
8. [Backend Considerations](#8-backend-considerations)

---

## 1. Technical Architecture Overview

### Current Web Architecture (as-is)

```
┌─────────────────────────────────────────────────────────────┐
│                     MONOREPO (pnpm workspaces)              │
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌────────────┐              │
│  │ apps/web │   │apps/server│   │apps/mobile │              │
│  │ (Next.js)│   │ (Express) │   │  (Expo)    │              │
│  └────┬─────┘   └────┬─────┘   └────────────┘              │
│       │               │                                      │
│  ┌────┴───────────────┴─────────────────────┐               │
│  │              packages/                    │               │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌─────────┐  │               │
│  │  │ trpc │ │  db  │ │ auth │ │ schema  │  │               │
│  │  │      │ │      │ │      │ │         │  │               │
│  │  └──────┘ └──────┘ └──────┘ └─────────┘  │               │
│  │  ┌──────┐ ┌──────────────┐                │               │
│  │  │utils │ │    ui        │                │               │
│  │  └──────┘ └──────────────┘                │               │
│  └───────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Target Mobile Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       apps/mobile-app                        │
│                    (Expo / React Native)                      │
│                                                              │
│  ┌────────────────────┐     ┌─────────────────────┐          │
│  │  Expo Router        │     │  tRPC Client         │          │
│  │  (File-based nav)   │────▶│  (Vanilla @trpc/     │          │
│  │                     │     │   client + TanStack   │          │
│  └────────────────────┘     │   React Query)        │          │
│                              └──────────┬──────────┘          │
│                                         │ HTTP(S)             │
│  ┌────────────────────┐                 │                     │
│  │  expo-secure-store  │     ┌──────────▼──────────┐          │
│  │  (Token Storage)    │     │  apps/server         │          │
│  └────────────────────┘     │  (Express + tRPC)    │          │
│                              │  Port 7200           │          │
│  ┌────────────────────┐     └──────────┬──────────┘          │
│  │  React Native       │               │                     │
│  │  Components         │     ┌──────────▼──────────┐          │
│  │  (NativeWind /      │     │  packages/db         │          │
│  │   StyleSheet)       │     │  (Drizzle + MySQL)   │          │
│  └────────────────────┘     └─────────────────────┘          │
└──────────────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

| Decision                             | Rationale                                                                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Reuse `@pkg/trpc` AppRouter type** | Full end-to-end type safety; same API contracts as web                                                                             |
| **Token-based auth (not cookies)**   | Mobile doesn't support httpOnly cookies well; use `expo-secure-store` for JWT storage with `Authorization: Bearer` header          |
| **Expo Router (file-based)**         | Already scaffolded; mirrors Next.js App Router mental model                                                                        |
| **Shared packages**                  | Reuse `@pkg/schema` validators, `@pkg/utils` constants directly                                                                    |
| **No backend changes**               | Server already supports tRPC over HTTP; only need a minor auth middleware tweak to accept `Authorization` header alongside cookies |

---

## 2. Technology Stack Recommendation

### ✅ Recommended: **React Native + Expo** (Already in place)

| Layer                | Technology                                   | Why                                                    |
| -------------------- | -------------------------------------------- | ------------------------------------------------------ |
| **Framework**        | Expo SDK 54 + React Native 0.81              | Already scaffolded, managed workflow, OTA updates      |
| **Navigation**       | Expo Router v6 (file-based)                  | Mirrors Next.js App Router, typed routes enabled       |
| **API Client**       | `@trpc/client` + `@tanstack/react-query`     | Exact same type-safe API layer as web, full code reuse |
| **State Management** | React Context + TanStack Query cache         | Same pattern as web app                                |
| **Auth Storage**     | `expo-secure-store`                          | OS-level encrypted storage for JWT tokens              |
| **Styling**          | NativeWind v4 (TailwindCSS for RN)           | Allows reusing Tailwind class patterns from web        |
| **Forms**            | `react-hook-form` + `zod`                    | Same form library and validators as web                |
| **Notifications**    | `expo-notifications`                         | Push notification support for both platforms           |
| **File Upload**      | `expo-document-picker` + `expo-image-picker` | Document and image upload (replaces web file picker)   |
| **Icons**            | `lucide-react-native`                        | Same icon set as web (`lucide-react`)                  |

### Why Not Flutter or Native?

| Alternative          | Reason Against                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Flutter (Dart)**   | Zero code reuse with existing TypeScript codebase; separate tRPC client needed; team would need to learn Dart |
| **Swift / Kotlin**   | Two separate codebases; no TypeScript type sharing; significantly higher development & maintenance cost       |
| **React Native CLI** | More complex setup; Expo provides OTA updates, simpler builds, and pre-configured native modules              |

---

## 3. Feature Inventory (Web → Mobile Mapping)

### Authentication

| Web Feature                                                 | Mobile Equivalent                         | Notes                                               |
| ----------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------- |
| Login page (`/login`)                                       | Login screen with email/password          | Use `expo-secure-store` instead of cookies          |
| Session refresh (cookie-based)                              | Token refresh via `Authorization` header  | Automatic retry with refresh token                  |
| Middleware route protection                                 | Expo Router `_layout.tsx` redirects       | Check auth state before rendering protected screens |
| Logout                                                      | Clear tokens from secure store + API call | Same `authMutation.logout` endpoint                 |
| Role-based access (admin, manager, staff, operator, viewer) | Same role hierarchy in mobile context     | Reuse `useHasRole`, `useIsAdmin`, etc.              |

### Dashboard

| Web Feature                        | Mobile Equivalent                   |
| ---------------------------------- | ----------------------------------- |
| Dashboard overview (`/dashboard`)  | Home tab screen with welcome card   |
| User info card (name, email, role) | Profile section in home/profile tab |

### User Management

| Web Feature                    | Mobile Equivalent                        |
| ------------------------------ | ---------------------------------------- |
| User list with search & filter | Searchable FlatList with pull-to-refresh |
| Create/Update user dialog      | Full-screen modal with form              |
| Role-based user categorization | Segmented control or tab filter          |
| User table with pagination     | Infinite scroll FlatList                 |

### Offices & Sites

| Web Feature               | Mobile Equivalent                         |
| ------------------------- | ----------------------------------------- |
| Office list page          | Office list screen with cards             |
| Office details dialog     | Drill-down detail screen                  |
| Site list (within office) | Nested site list with search & pagination |
| Create/Edit site dialog   | Modal or push screen with form            |
| Site pagination & search  | Infinite scroll + search bar              |

### Clients

| Web Feature                           | Mobile Equivalent                      |
| ------------------------------------- | -------------------------------------- |
| Client list (`/client`)               | Client list screen                     |
| Client details (`/client/[clientId]`) | Client detail screen (push navigation) |
| Client stats                          | Stats cards at top of detail screen    |
| Contact management dialog             | Bottom sheet or modal                  |
| Client proposals & WO section         | Tabs within client detail              |

### Work Orders

| Web Feature                           | Mobile Equivalent                    |
| ------------------------------------- | ------------------------------------ |
| Work Order list (`/work-order`)       | WO list screen with filters          |
| Work Order details page               | WO detail screen with sections       |
| Create Work Order (multi-step dialog) | Multi-step form (stepper component)  |
| Step 1: Basic Details                 | Form screen                          |
| Step 2: Schedule of Rates table       | Editable list/table component        |
| Site assignment to WO                 | Site selection screen                |
| Work Order Site details dialog        | Detail screen with activities        |
| Site activities tracking              | Activity list with status indicators |

### Proposals

| Web Feature                   | Mobile Equivalent      |
| ----------------------------- | ---------------------- |
| Create proposal dialog        | Full-screen form modal |
| Proposal list (within client) | FlatList section       |

### Document Management

| Web Feature                      | Mobile Equivalent                            |
| -------------------------------- | -------------------------------------------- |
| File upload (DeferredFilePicker) | `expo-document-picker` / `expo-image-picker` |
| SharePoint integration           | Same API calls via tRPC                      |
| Document upload progress bar     | React Native progress indicator              |

### Notifications & Feedback

| Web Feature                         | Mobile Equivalent                                                         |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `react-hot-toast` / `sonner` toasts | `expo-notifications` local + toast library (`react-native-toast-message`) |
| Error handling (`useApiError`)      | Same hook adapted for mobile                                              |

---

## 4. Step-by-Step Implementation Plan

### Phase 0: Foundation & Project Setup (Week 1)

- [ ] **0.1** Clean up default Expo template files (remove explore.tsx, hello-wave, etc.)
- [ ] **0.2** Install core dependencies:
  ```bash
  npx expo install @tanstack/react-query @trpc/client @trpc/react-query
  npx expo install expo-secure-store expo-notifications
  npx expo install react-hook-form @hookform/resolvers zod
  npx expo install nativewind tailwindcss react-native-css-interop
  npx expo install expo-document-picker expo-image-picker
  npx expo install react-native-toast-message
  npx expo install lucide-react-native react-native-svg
  ```
- [ ] **0.3** Configure NativeWind (TailwindCSS for RN)
- [ ] **0.4** Add `@pkg/trpc` (AppRouter type) and `@pkg/utils` as workspace dependencies
- [ ] **0.5** Set up `tsconfig.json` path aliases matching the web app (`@/` prefix)
- [ ] **0.6** Create tRPC client configuration (with `Authorization` header support)
- [ ] **0.7** Create global providers file (QueryClient, tRPC, Auth)
- [ ] **0.8** Configure environment variables for API URL (`EXPO_PUBLIC_API_URL`)

### Phase 1: Authentication System (Week 1-2)

- [ ] **1.1** Create `lib/secure-store.ts` — Token storage helpers (get/set/delete access & refresh tokens)
- [ ] **1.2** Create `lib/trpc.ts` — tRPC client with:
  - `httpBatchLink` with dynamic `Authorization: Bearer <token>` header
  - `splitLink` for mutations (httpLink) vs queries (httpBatchLink)
  - Custom fetch wrapper with automatic token refresh + retry
- [ ] **1.3** Create `contexts/AuthContext.tsx` — Mirrors web version but uses secure store
- [ ] **1.4** Create `hooks/use-auth.ts` — Same logic as web, adapted:
  - Instead of cookies, read token from `expo-secure-store`
  - On login success, store tokens in secure store
  - On logout, clear secure store
- [ ] **1.5** Create role-based hooks (`useHasRole`, `useIsAdmin`, etc.) — Direct port
- [ ] **1.6** Build Login screen (`app/(auth)/login.tsx`):
  - Email + password form (react-hook-form + zod validation)
  - OTBL branding (logo, "ONGC TERI Biotech Limited", "Management System")
  - Error handling (invalid credentials, network errors)
  - Loading states
- [ ] **1.7** Create auth guard in root `_layout.tsx`:
  - Check token existence → redirect to login or main app
  - Splash screen while checking auth state
- [ ] **1.8** **Backend change (minimal):** Update server `context.ts` to extract JWT from `Authorization` header in addition to cookies

### Phase 2: Core Navigation & Layout (Week 2)

- [ ] **2.1** Set up navigation structure:
  ```
  app/
  ├── (auth)/          # Unauthenticated screens
  │   └── login.tsx
  ├── (app)/           # Authenticated screens
  │   ├── _layout.tsx  # Bottom tab navigator
  │   ├── (tabs)/
  │   │   ├── index.tsx          # Dashboard/Home
  │   │   ├── work-orders.tsx    # Work Orders list
  │   │   ├── clients.tsx        # Clients list
  │   │   └── more.tsx           # Settings, Profile, etc.
  │   ├── office-site/           # Office & Site screens
  │   ├── user/                  # User management
  │   ├── client/[clientId]/     # Client details + sub-screens
  │   └── work-order/[workOrderId]/ # WO details
  └── _layout.tsx      # Root layout (auth check)
  ```
- [ ] **2.2** Build bottom tab navigator with icons (matching sidebar links):
  - Home (LayoutDashboard icon)
  - Work Orders (ReceiptIndianRupee icon)
  - Clients (Webhook icon)
  - More (Settings icon) → Profile, User Mgmt, Offices & Sites, Logout
- [ ] **2.3** Create reusable UI components:
  - `Card` component
  - `Button` component (primary, outline, destructive variants)
  - `Input` component (mirrors web custom-form-input)
  - `Select` / Dropdown component
  - `StatusIndicator` component
  - `LoadingSpinner` / Skeleton component
  - `EmptyState` component (mirrors NoFetchData)
  - `ErrorDisplay` component
  - `SearchBar` component
  - `DatePicker` component (using `@react-native-community/datetimepicker`)
- [ ] **2.4** Design system setup:
  - Color palette matching web (cyan-900 sidebar, emerald-600 active states, etc.)
  - Typography scale (matching web font sizes)
  - Spacing system

### Phase 3: Dashboard / Home Screen (Week 2-3)

- [ ] **3.1** Dashboard home screen with welcome card (mirrors `/dashboard`)
- [ ] **3.2** User info display (name, email, role)
- [ ] **3.3** Quick action cards (navigate to Work Orders, Clients, etc.)
- [ ] **3.4** Pull-to-refresh for data refetch

### Phase 4: User Management (Week 3)

- [ ] **4.1** User list screen with:
  - Search & filter (by role, status)
  - FlatList with user cards
  - Pull-to-refresh
- [ ] **4.2** Create/Update user modal:
  - Form with name, email, contact, role, status fields
  - Validation (reuse `@pkg/schema` validators)
  - Submit via `userMutation.create` / `userMutation.update`
- [ ] **4.3** Role-based access control (only admin/manager can manage users)
- [ ] **4.4** User categorization view

### Phase 5: Offices & Sites Management (Week 3-4)

- [ ] **5.1** Office list screen:
  - Office cards with name, city, state, status
  - Search functionality
- [ ] **5.2** Office details screen:
  - Office info card
  - Sites section with search + pagination (infinite scroll)
  - Office users section
- [ ] **5.3** Site detail screen:
  - Site info (name, address, city, pincode)
  - Associated work orders
- [ ] **5.4** Create/Edit office & site forms

### Phase 6: Client Management (Week 4-5)

- [ ] **6.1** Client list screen:
  - Client cards with name, city, status
  - Search & filter
- [ ] **6.2** Client details screen (mirrors `/client/[clientId]`):
  - Client details card
  - Contact management (add/view contacts via bottom sheet)
  - Client stats section
- [ ] **6.3** Client proposals section:
  - Proposal list
  - Create proposal form
  - Document upload for proposals
- [ ] **6.4** Client work orders section

### Phase 7: Work Order Management (Week 5-7)

- [ ] **7.1** Work Order list screen:
  - WO cards with code, title, status, dates
  - Filter by status (pending, completed, cancelled)
  - Search
- [ ] **7.2** Create Work Order — Multi-step form:
  - **Step 1 — Basic Details:**
    - Title, code, agreement number, rate contract number
    - Client & Office selection (picker/search)
    - Proposal selection
    - Process type, dates (start, end, handing over)
    - Document upload
  - **Step 2 — Schedule of Rates:**
    - Dynamic list of activity rows
    - Activity, unit, est qty, RC rate, GST, total cost
    - Add/remove activities
    - Validation (no zero/empty values)
- [ ] **7.3** Work Order details screen:
  - WO info card (process type, dates, status, etc.)
  - Schedule of rates table (horizontal scroll)
  - Work Order Sites section
- [ ] **7.4** Work Order Site management:
  - Add existing site or create new site for WO
  - Site process type selection
  - Site search & pagination
  - Site detail with activities
- [ ] **7.5** Site Activities tracking:
  - Activity list per WO site
  - Activity items (zero-day, TPH, oil zapper, etc.)
  - Status tracking

### Phase 8: Document Management (Week 7-8)

- [ ] **8.1** Document picker integration:
  - `expo-document-picker` for file selection
  - Upload progress indicator
  - File type validation
- [ ] **8.2** SharePoint integration:
  - Create folders via `sharePointMutation.createFolder`
  - Upload files to SharePoint
  - Query folders via `sharePointQuery.getFolders`
- [ ] **8.3** Document viewer (PDF, images)

### Phase 9: Notifications (Week 8)

- [ ] **9.1** Set up `expo-notifications`:
  - Push notification registration
  - Local notification support
  - Notification permission handling
- [ ] **9.2** In-app toast notifications (using `react-native-toast-message`)
- [ ] **9.3** Error notifications matching web pattern (`useApiError` hook)

### Phase 10: Polish & Optimization (Week 8-9)

- [ ] **10.1** Loading skeletons for all list screens
- [ ] **10.2** Pull-to-refresh on all data screens
- [ ] **10.3** Optimistic updates for mutations
- [ ] **10.4** Offline handling (network status indicator)
- [ ] **10.5** Deep linking configuration
- [ ] **10.6** App icon & splash screen customization (OTBL branding)
- [ ] **10.7** Performance profiling:
  - FlashList for large lists (replace FlatList if needed)
  - Image optimization
  - Bundle size analysis
- [ ] **10.8** Dark mode support (already partial - `useColorScheme` hook exists)
- [ ] **10.9** Accessibility (screen reader labels, touch targets)

### Phase 11: Testing (Week 9-10)

- [ ] **11.1** Unit tests for hooks and utilities (Jest)
- [ ] **11.2** Component tests (React Native Testing Library)
- [ ] **11.3** Integration tests for auth flow
- [ ] **11.4** End-to-end tests (Detox or Maestro)
- [ ] **11.5** Manual testing on physical iOS and Android devices

---

## 5. Folder / Project Structure

```
apps/mobile-app/
├── app/                          # Expo Router screens (file-based routing)
│   ├── _layout.tsx               # Root layout — auth check + providers
│   ├── (auth)/                   # Auth group (unauthenticated)
│   │   ├── _layout.tsx           # Auth stack layout
│   │   └── login.tsx             # Login screen
│   │
│   ├── (app)/                    # Main app group (authenticated)
│   │   ├── _layout.tsx           # Bottom tab navigator
│   │   ├── (tabs)/               # Tab screens
│   │   │   ├── _layout.tsx       # Tab bar config
│   │   │   ├── index.tsx         # Dashboard / Home
│   │   │   ├── work-orders.tsx   # Work Orders list
│   │   │   ├── clients.tsx       # Clients list
│   │   │   └── more.tsx          # More menu (profile, settings, etc.)
│   │   │
│   │   ├── user/                 # User Management
│   │   │   ├── index.tsx         # User list
│   │   │   └── [userId].tsx      # User details / edit
│   │   │
│   │   ├── office-site/          # Office & Site Management
│   │   │   ├── index.tsx         # Office list
│   │   │   ├── [officeId]/
│   │   │   │   ├── index.tsx     # Office details + sites
│   │   │   │   └── site/[siteId].tsx  # Site details
│   │   │   └── create-office.tsx # Create office form
│   │   │
│   │   ├── client/               # Client Management
│   │   │   └── [clientId]/
│   │   │       ├── index.tsx     # Client details
│   │   │       ├── proposals.tsx # Client proposals
│   │   │       └── contacts.tsx  # Client contacts
│   │   │
│   │   ├── work-order/           # Work Order Management
│   │   │   ├── create/
│   │   │   │   ├── index.tsx     # Create WO — Step 1
│   │   │   │   └── schedule.tsx  # Create WO — Step 2
│   │   │   └── [workOrderId]/
│   │   │       ├── index.tsx     # WO details
│   │   │       ├── sites.tsx     # WO sites
│   │   │       └── site/[siteId].tsx  # WO site details + activities
│   │   │
│   │   └── profile/              # User Profile & Settings
│   │       └── index.tsx
│   │
│   └── modal.tsx                 # Generic modal route
│
├── components/                   # Reusable components
│   ├── ui/                       # Base UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Separator.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Modal.tsx
│   │
│   ├── forms/                    # Form-specific components
│   │   ├── FormInput.tsx         # Mirrors web custom-form-input
│   │   ├── FormSelect.tsx
│   │   ├── FormDatePicker.tsx
│   │   └── FormTextArea.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── ScreenWrapper.tsx     # Safe area + scroll wrapper
│   │   ├── Header.tsx            # Custom header bar
│   │   └── TabBar.tsx            # Custom bottom tab bar
│   │
│   ├── data-display/             # Data display components
│   │   ├── StatusIndicator.tsx
│   │   ├── DataCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorDisplay.tsx
│   │   └── TitleDescRow.tsx
│   │
│   ├── loading/                  # Loading states
│   │   ├── ScreenSkeleton.tsx
│   │   ├── ListSkeleton.tsx
│   │   └── CardSkeleton.tsx
│   │
│   └── domain/                   # Domain-specific components
│       ├── work-order/
│       │   ├── WorkOrderCard.tsx
│       │   ├── WorkOrderDetailsCard.tsx
│       │   ├── ScheduleOfRatesTable.tsx
│       │   └── CreateWOForm.tsx
│       ├── client/
│       │   ├── ClientCard.tsx
│       │   ├── ClientDetailsCard.tsx
│       │   └── ProposalCard.tsx
│       ├── office/
│       │   ├── OfficeCard.tsx
│       │   └── SiteCard.tsx
│       └── user/
│           ├── UserCard.tsx
│           └── UserForm.tsx
│
├── contexts/                     # React Contexts
│   ├── AuthContext.tsx
│   ├── ClientManagementContext.tsx
│   ├── OfficeManagementContext.tsx
│   ├── UserManagementContext.tsx
│   └── WorkOrderManagementContext.tsx
│
├── hooks/                        # Custom hooks
│   ├── use-auth.ts
│   ├── use-api-error.ts
│   ├── use-debounce.ts
│   ├── use-color-scheme.ts
│   ├── use-refresh.ts            # Pull-to-refresh helper
│   └── use-document-upload.ts    # File upload hook
│
├── lib/                          # Utilities & configuration
│   ├── trpc.ts                   # tRPC client setup
│   ├── secure-store.ts           # Token storage helpers
│   ├── constants.ts              # App-wide constants (colors, API URL)
│   └── utils.ts                  # Utility functions
│
├── providers/                    # Global providers
│   └── AppProvider.tsx           # tRPC + QueryClient + Auth + Theme
│
├── assets/                       # Static assets
│   ├── images/
│   │   ├── icon.png
│   │   ├── splash-icon.png
│   │   ├── otbl-logo.png         # OTBL branding
│   │   └── adaptive-icon.png
│   └── fonts/                    # Custom fonts (if needed)
│
├── constants/                    # Theme & design tokens
│   └── Colors.ts                 # Color palette matching web
│
├── scripts/
│   └── reset-project.js
│
├── app.json                      # Expo configuration
├── package.json
├── tsconfig.json
└── tailwind.config.js            # NativeWind config (if using NativeWind)
```

---

## 6. Estimated Timeline Breakdown

| Phase          | Description                       | Duration  | Cumulative |
| -------------- | --------------------------------- | --------- | ---------- |
| **Phase 0**    | Foundation & Project Setup        | 3–4 days  | Week 1     |
| **Phase 1**    | Authentication System             | 4–5 days  | Week 1–2   |
| **Phase 2**    | Navigation & UI Components        | 4–5 days  | Week 2–3   |
| **Phase 3**    | Dashboard / Home Screen           | 2 days    | Week 3     |
| **Phase 4**    | User Management                   | 3–4 days  | Week 3–4   |
| **Phase 5**    | Offices & Sites                   | 4–5 days  | Week 4–5   |
| **Phase 6**    | Client Management                 | 5–6 days  | Week 5–6   |
| **Phase 7**    | Work Order Management             | 8–10 days | Week 6–8   |
| **Phase 8**    | Document Management               | 3–4 days  | Week 8     |
| **Phase 9**    | Notifications                     | 2–3 days  | Week 9     |
| **Phase 10**   | Polish & Optimization             | 4–5 days  | Week 9–10  |
| **Phase 11**   | Testing & QA                      | 5–7 days  | Week 10–11 |
| **Deployment** | App Store & Play Store submission | 3–5 days  | Week 11–12 |

### **Total Estimated Timeline: 10–12 weeks (single developer)**

> With 2 developers working in parallel (one on core features, one on UI/UX), this can be reduced to **6–8 weeks**.

---

## 7. Deployment Strategy (App Store & Play Store)

### Build Pipeline

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Development  │────▶│  EAS Build       │────▶│  App Store /     │
│  (Expo Dev)   │     │  (Cloud Builds)  │     │  Play Store      │
└──────────────┘     └─────────────────┘     └──────────────────┘
                            │
                     ┌──────▼──────┐
                     │  EAS Update  │  (OTA updates for
                     │  (Optional)  │   JS-only changes)
                     └─────────────┘
```

### Step-by-Step Deployment

#### 1. Expo Application Services (EAS) Setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS Build
eas build:configure
```

#### 2. App Configuration (`app.json` updates needed)

```json
{
  "expo": {
    "name": "OTBL Management",
    "slug": "otbl-management",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "otbl",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.otbl.management",
      "infoPlist": {
        "NSCameraUsageDescription": "Allow OTBL to access camera for document scanning",
        "NSPhotoLibraryUsageDescription": "Allow OTBL to access photos for document upload"
      }
    },
    "android": {
      "package": "com.otbl.management",
      "adaptiveIcon": {
        "backgroundColor": "#0E7490",
        "foregroundImage": "./assets/images/android-icon-foreground.png"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

#### 3. Build Commands

```bash
# Development build (for testing on device)
eas build --profile development --platform all

# Preview build (internal testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform ios
eas build --profile production --platform android
```

#### 4. Store Submission

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

### Pre-Submission Checklist

**iOS (App Store):**

- [ ] Apple Developer Account ($99/year)
- [ ] App Store Connect listing created
- [ ] App icon (1024x1024)
- [ ] Screenshots for required device sizes (iPhone 6.7", 6.5", 5.5"; iPad if supported)
- [ ] Privacy policy URL
- [ ] App description, keywords, support URL
- [ ] Age rating questionnaire completed
- [ ] IDFA declaration

**Android (Play Store):**

- [ ] Google Play Developer Account ($25 one-time)
- [ ] Play Console listing created
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (minimum 2 per device type)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] Target API level compliance
- [ ] Data safety section completed

### OTA Updates Strategy

- Use **EAS Update** for over-the-air JavaScript bundle updates
- No new store submission needed for bug fixes or UI changes
- Only native code changes require new builds + store submission

---

## 8. Backend Considerations

### Required Server Change (Minimal)

The web app uses **httpOnly cookies** for JWT auth. Mobile apps can't reliably use cookies. One small change is needed in the server:

**File:** `apps/server/src/context.ts`

Add `Authorization: Bearer <token>` header support alongside existing cookie-based auth:

```typescript
// In createContext function, extract token from EITHER cookies OR Authorization header
const accessToken =
  req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");

const refreshToken =
  req.cookies?.refreshToken || req.headers["x-refresh-token"];
```

**Why this is safe:**

- Doesn't break existing web functionality (cookies still work)
- Adds parallel auth path for mobile
- Same JWT validation logic applies
- Refresh token flow works the same way

### API URL Configuration

- **Development:** `http://<local-ip>:7200` (not `localhost` — mobile devices need the LAN IP)
- **Staging:** `https://staging-api.otbl.com` (or your staging URL)
- **Production:** `https://api.otbl.com` (or your production URL)

Use `EXPO_PUBLIC_API_URL` environment variable for configuration.

---

## Summary

This plan transforms the OTBL web application into a **fully functional** cross-platform mobile app while:

✅ **Reusing** the existing Express + tRPC backend (only 1 minor auth change)
✅ **Sharing** TypeScript types via `@pkg/trpc` AppRouter
✅ **Reusing** validators via `@pkg/schema` and `zod`
✅ **Maintaining** feature parity with the web app
✅ **Following** the same design language (OTBL branding, cyan/emerald color scheme)
✅ **Leveraging** Expo for simplified builds and OTA updates

The mobile app will be **production-ready**, with clean architecture, type-safe API calls, and a native-feeling UX adapted from the web's design system.
