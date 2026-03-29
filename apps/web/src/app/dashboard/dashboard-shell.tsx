"use client";

import AppSidebar from "@/app/_components/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { trpc } from "@/lib/trpc";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: layout, isSuccess } = trpc.authQuery.dashboardLayout.useQuery(
    undefined,
    { retry: false },
  );

  const hideSidebar =
    isSuccess &&
    layout?.success &&
    (layout.mode === "site_only" || layout.mode === "wo_site_upload");

  useEffect(() => {
    if (!isSuccess || !layout?.success) return;

    if (layout.mode === "wo_site_upload" && layout.defaultWorkOrderSiteId) {
      const target = `/dashboard/wo-site/${layout.defaultWorkOrderSiteId}`;
      if (!pathname.startsWith("/dashboard/wo-site")) {
        router.replace(target);
      }
      return;
    }

    if (layout.mode === "site_only") {
      if (!pathname.startsWith("/dashboard/site-assigned")) {
        router.replace("/dashboard/site-assigned");
      }
    }
  }, [isSuccess, layout, pathname, router]);

  const insetClass = hideSidebar ? "md:pl-0" : "md:pl-56";

  return (
    <>
      {!hideSidebar && <AppSidebar />}
      <SidebarInset className={insetClass}>{children}</SidebarInset>
    </>
  );
}
