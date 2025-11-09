import { SiteManagementProvider } from "@/contexts/SiteManagementContext";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteManagementProvider>{children}</SiteManagementProvider>;
}
