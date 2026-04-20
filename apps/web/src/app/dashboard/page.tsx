"use client";

import { useAuthContext, useIsAdmin } from "@/contexts/AuthContext";
import { PageWrapper } from "@/components/wrapper/page-wrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc, type RouterOutputs } from "@/lib/trpc";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  ContactRound,
  LogOut,
  MapPin,
  ReceiptIndianRupee,
  Shield,
  Tent,
  Users,
  Webhook,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, type ComponentType } from "react";
import { cn } from "@/lib/utils";
import { capitalFirstLetter } from "@pkg/utils";

type DashboardOfficeRow =
  RouterOutputs["officeQuery"]["getOffices"]["offices"][number];
type DashboardWorkOrderRow =
  RouterOutputs["workOrderQuery"]["getAll"]["workOrders"][number];

function formatShortDate(value: Date | string | null | undefined) {
  if (value == null) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function workOrderStatusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-600 hover:bg-green-700 text-white border-transparent";
    case "pending":
      return "bg-yellow-600 hover:bg-yellow-700 text-white border-transparent";
    case "cancelled":
      return "bg-red-600 hover:bg-red-700 text-white border-transparent";
    default:
      return "";
  }
}

export default function DashboardPage() {
  const { user, logout, isUserLoading } = useAuthContext();
  const isAdmin = useIsAdmin();

  const layoutQuery = trpc.authQuery.dashboardLayout.useQuery(undefined, {
    retry: false,
  });

  const clientsQuery = trpc.clientQuery.totalClientAndContact.useQuery(
    undefined,
    { enabled: !isUserLoading },
  );

  const officesQuery = trpc.officeQuery.getOffices.useQuery(
    {},
    { enabled: !isUserLoading },
  );

  const woTotalQuery = trpc.workOrderQuery.getAll.useQuery(
    { page: 1, limit: 1, workOrderOrder: "latest" },
    { enabled: !isUserLoading },
  );

  const woPendingQuery = trpc.workOrderQuery.getAll.useQuery(
    { page: 1, limit: 1, status: "pending", workOrderOrder: "latest" },
    { enabled: !isUserLoading },
  );

  const woCompletedQuery = trpc.workOrderQuery.getAll.useQuery(
    { page: 1, limit: 1, status: "completed", workOrderOrder: "latest" },
    { enabled: !isUserLoading },
  );

  const woCancelledQuery = trpc.workOrderQuery.getAll.useQuery(
    { page: 1, limit: 1, status: "cancelled", workOrderOrder: "latest" },
    { enabled: !isUserLoading },
  );

  const woRecentQuery = trpc.workOrderQuery.getAll.useQuery(
    { page: 1, limit: 8, workOrderOrder: "latest" },
    { enabled: !isUserLoading },
  );

  const officeStats = useMemo(() => {
    const offices: DashboardOfficeRow[] = officesQuery.data?.offices ?? [];
    const siteTotal = offices.reduce(
      (sum: number, o: DashboardOfficeRow) => sum + (Number(o.siteCount) || 0),
      0,
    );
    return { officeCount: offices.length, siteTotal };
  }, [officesQuery.data]);

  const scopeCopy = useMemo(() => {
    const mode = layoutQuery.data?.mode;
    switch (mode) {
      case "full":
        return {
          title: "Full access",
          description:
            "You can view and manage offices, clients, and work orders across the entire organization.",
        };
      case "office":
        return {
          title: "Office-scoped access",
          description:
            "Figures and lists below are limited to offices and work you are assigned to.",
        };
      case "site_only":
        return {
          title: "Site assignment",
          description:
            "You are being routed to your assigned sites. This overview may not apply to your role.",
        };
      case "wo_site_upload":
        return {
          title: "Field upload mode",
          description:
            "You are being routed to your work order site upload workspace.",
        };
      default:
        return {
          title: "Access",
          description: "Loading your access scope…",
        };
    }
  }, [layoutQuery.data?.mode]);

  const statsLoading =
    clientsQuery.isLoading ||
    officesQuery.isLoading ||
    woTotalQuery.isLoading ||
    woPendingQuery.isLoading ||
    woCompletedQuery.isLoading ||
    woCancelledQuery.isLoading;

  const recentWorkOrders: DashboardWorkOrderRow[] =
    woRecentQuery.data?.workOrders ?? [];

  if (isUserLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-200/80'>
        <p className='text-sm text-muted-foreground'>Loading your session…</p>
      </div>
    );
  }

  return (
    <PageWrapper
      title='Overview'
      description={
        user?.name
          ? `Signed in as ${user.name} · ${user.role}`
          : "OTBL management dashboard"
      }
      button={
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='gap-2 bg-white shadow-sm'
          onClick={() => logout()}>
          <LogOut className='size-4' />
          Log out
        </Button>
      }>
      <div className='mt-6 space-y-6'>
        <div className='grid gap-4 md:grid-cols-2'>
          <Card className='border-cyan-900/15 shadow-sm'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-base text-cyan-900'>
                <Shield className='size-4 shrink-0' />
                Access & scope
              </CardTitle>
              <CardDescription>{scopeCopy.description}</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-wrap items-center gap-2'>
              <Badge
                variant='secondary'
                className='font-normal'>
                {scopeCopy.title}
              </Badge>
              {user?.status && (
                <Badge
                  variant='outline'
                  className='font-normal capitalize'>
                  Account: {user.status}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className='shadow-sm'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base text-cyan-900'>
                Your profile
              </CardTitle>
              <CardDescription>Contact and identifier</CardDescription>
            </CardHeader>
            <CardContent className='space-y-1 text-sm'>
              <p>
                <span className='text-muted-foreground'>Email </span>
                <span className='font-medium'>{user?.email ?? "—"}</span>
              </p>
              <p>
                <span className='text-muted-foreground'>Role </span>
                <span className='font-medium capitalize'>{user?.role}</span>
              </p>
              <p>
                <span className='text-muted-foreground'>User ID </span>
                <span className='font-mono text-xs'>{user?.id ?? "—"}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className='mb-3 text-sm font-semibold uppercase tracking-wide text-cyan-900'>
            At a glance
          </h2>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <StatTile
              icon={Webhook}
              label='Clients'
              value={clientsQuery.data?.totalClients}
              loading={statsLoading}
            />
            <StatTile
              icon={ContactRound}
              label='Client contacts'
              value={clientsQuery.data?.totalContacts}
              loading={statsLoading}
            />
            <StatTile
              icon={Building2}
              label='Offices'
              value={officeStats.officeCount}
              loading={statsLoading}
            />
            <StatTile
              icon={MapPin}
              label='Sites (under offices)'
              value={officeStats.siteTotal}
              loading={statsLoading}
            />
            <StatTile
              icon={ReceiptIndianRupee}
              label='Work orders'
              value={woTotalQuery.data?.pagination.total}
              loading={statsLoading}
            />
            <StatTile
              icon={Clock3}
              label='Pending'
              value={woPendingQuery.data?.pagination.total}
              loading={statsLoading}
              hint='Active pipeline'
            />
            <StatTile
              icon={CheckCircle2}
              label='Completed'
              value={woCompletedQuery.data?.pagination.total}
              loading={statsLoading}
              hint='Closed successfully'
            />
            <StatTile
              icon={XCircle}
              label='Cancelled'
              value={woCancelledQuery.data?.pagination.total}
              loading={statsLoading}
              hint='Stopped / void'
            />
          </div>
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          <Card className='lg:col-span-2 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div>
                <CardTitle className='text-base text-cyan-900'>
                  Recent work orders
                </CardTitle>
                <CardDescription>
                  Latest activity in your visible scope
                </CardDescription>
              </div>
              <Button
                variant='ghost'
                size='sm'
                asChild
                className='text-cyan-800'>
                <Link href='/dashboard/work-order'>
                  View all
                  <ArrowRight className='ml-1 size-4' />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {woRecentQuery.isLoading ? (
                <div className='space-y-2'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className='h-10 w-full'
                    />
                  ))}
                </div>
              ) : woRecentQuery.isError ? (
                <p className='text-sm text-destructive'>
                  Could not load work orders. Refresh and try again.
                </p>
              ) : recentWorkOrders.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  No work orders yet. Create one from a client or work order
                  page when you are ready.
                </p>
              ) : (
                <div className='rounded-md border bg-white'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='text-xs'>Code</TableHead>
                        <TableHead className='text-xs'>Title</TableHead>
                        <TableHead className='text-xs'>Client</TableHead>
                        <TableHead className='text-xs'>Office</TableHead>
                        <TableHead className='text-xs'>Updated</TableHead>
                        <TableHead className='text-xs'>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentWorkOrders.map((wo) => (
                        <TableRow key={wo.id}>
                          <TableCell className='text-xs font-medium'>
                            <Link
                              href={`/dashboard/work-order/${wo.id}`}
                              className='text-cyan-800 underline-offset-2 hover:underline'>
                              {wo.code}
                            </Link>
                          </TableCell>
                          <TableCell className='max-w-[200px] truncate text-xs'>
                            {wo.title}
                          </TableCell>
                          <TableCell className='text-xs'>
                            {wo.client_name ?? "—"}
                          </TableCell>
                          <TableCell className='text-xs'>
                            {wo.office_name ?? "—"}
                          </TableCell>
                          <TableCell className='text-xs whitespace-nowrap'>
                            {formatShortDate(wo.updated_at ?? wo.created_at)}
                          </TableCell>
                          <TableCell className='text-xs'>
                            <Badge
                              variant='secondary'
                              className={cn(
                                workOrderStatusBadgeClass(wo.status),
                              )}>
                              {capitalFirstLetter(wo.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className='shadow-sm'>
            <CardHeader>
              <CardTitle className='text-base text-cyan-900'>
                Quick navigation
              </CardTitle>
              <CardDescription>Open common areas of the app</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-2'>
              <QuickLink
                href='/dashboard/client'
                icon={Webhook}
                label='Clients'
              />
              <QuickLink
                href='/dashboard/work-order'
                icon={ReceiptIndianRupee}
                label='Work orders'
              />
              <QuickLink
                href='/dashboard/office-site'
                icon={Tent}
                label='Offices & sites'
              />
              {isAdmin && (
                <QuickLink
                  href='/dashboard/user'
                  icon={Users}
                  label='User management'
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  loading,
  hint,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number | undefined;
  loading: boolean;
  hint?: string;
}) {
  return (
    <Card className='shadow-sm'>
      <CardContent>
        <div className='flex items-start justify-between gap-2'>
          <div>
            <p className='text-xs font-medium text-muted-foreground'>{label}</p>
            {loading ? (
              <Skeleton className='mt-2 h-8 w-16' />
            ) : (
              <p className='mt-1 text-2xl font-semibold tabular-nums text-cyan-900'>
                {value ?? 0}
              </p>
            )}
            {hint && !loading && (
              <p className='mt-1 text-[11px] text-muted-foreground'>{hint}</p>
            )}
          </div>
          <div className='rounded-md bg-cyan-900/10 p-2 text-cyan-900'>
            <Icon className='size-4' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className='flex items-center justify-between rounded-lg border border-transparent bg-white px-3 py-2 text-sm font-medium text-cyan-900 shadow-sm transition-colors hover:border-cyan-900/20 hover:bg-cyan-50/80'>
      <span className='flex items-center gap-2'>
        <Icon className='size-4' />
        {label}
      </span>
      <ArrowRight className='size-4 opacity-50' />
    </Link>
  );
}
