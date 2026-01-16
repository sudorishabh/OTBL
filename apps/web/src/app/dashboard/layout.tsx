import AppSidebar from "../_components/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppSidebar />
      <SidebarInset className='md:pl-56'>{children}</SidebarInset>
    </>
  );
}
