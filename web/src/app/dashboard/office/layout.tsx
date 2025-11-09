import { OfficeManagementProvider } from "@/contexts/OfficeManagementContext";

export default function OfficeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <OfficeManagementProvider>{children}</OfficeManagementProvider>;
}
