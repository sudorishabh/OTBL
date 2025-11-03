"use client";
import {
  Sidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  User,
  Settings,
  ReceiptIndianRupee,
  ChartNoAxesGantt,
  Tent,
  Users,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  {
    title: "Overview",
    link: "/",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    link: "/user",
    icon: Users,
  },
  {
    title: "Offices",
    link: "/office",
    icon: Building2,
  },
  {
    title: "Sites",
    link: "/site",
    icon: Tent,
  },
  {
    title: "Activities",
    link: "/activity",
    icon: ChartNoAxesGantt,
  },
  {
    title: "Budget Categories",
    link: "/budget-category",
    icon: ReceiptIndianRupee,
  },
];

const footerLinks = [
  {
    title: "Profile",
    link: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    link: "/settings",
    icon: Settings,
  },
];

function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <Sidebar
      collapsible='icon'
      className='border-0'>
      <SidebarHeader className='p-6 bg-cyan-900'>
        <div className='flex justify-center items-center gap-3'>
          <Image
            src='/otbl-logo.png'
            alt='OTBL Logo'
            width={200}
            height={200}
            className='h-7 w-13'
          />
          {state !== "collapsed" && (
            <div className='flex flex-col'>
              <span className='text-sm  font-semibold text-gray-100'>OTBL</span>
              <span className='text-xs text-gray-100'>Management System</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className='px-3 bg-cyan-900'>
        <Separator className='bg-gray-400' />
        <SidebarGroup>
          <SidebarGroupLabel className='text-[11px] font-medium text-gray-300 uppercase tracking-wider'>
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu className='mt-2'>
            {sidebarLinks.map((item) => {
              console.log(item.link);
              const isActive =
                item.link === "/"
                  ? pathname === item.link
                  : pathname.startsWith(item.link);

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      "h-8 px-3 ",
                      isActive
                        ? "!bg-emerald-600 !text-gray-100 shadow"
                        : "!text-gray-300 hover:bg-emerald-600/65 focus:!bg-transparent"
                    )}>
                    <Link
                      href={item.link}
                      className='flex items-center gap-3'>
                      <item.icon className={cn("h-4 w-4")} />
                      <span
                        className={cn(
                          "text-sm",
                          isActive ? "font-semibold" : ""
                        )}>
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <Separator className='my-4 bg-gray-400' />

        <SidebarGroup>
          <SidebarGroupLabel className='text-[11px] font-medium text-gray-300 uppercase tracking-wider'>
            Account
          </SidebarGroupLabel>
          <SidebarMenu className='mt-2'>
            {footerLinks.map((item) => {
              const isActive = pathname === item.link;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      "h-8 px-3 ",
                      isActive
                        ? "!bg-emerald-600 !text-gray-100 shadow"
                        : "!text-gray-300 hover:bg-emerald-600/65 focus:!bg-transparent"
                    )}>
                    <Link
                      href={item.link}
                      className='flex items-center gap-3'>
                      <item.icon className={cn("h-4 w-4")} />
                      <span
                        className={cn(
                          "text-sm",
                          isActive ? "font-semibold" : ""
                        )}>
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
