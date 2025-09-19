"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
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
    title: "Offices",
    link: "/office",
    icon: Building2,
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
      <SidebarHeader className='p-6 bg-[#035864]'>
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
              <span className='text-sm  font-semibold text-[#f4f6f9]'>
                OTBL
              </span>
              <span className='text-xs text-[#f4f6f9]'>Management System</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className='px-3 bg-[#035864]'>
        <Separator />
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
                    // Use !important to force background color for active tab
                    className={cn(
                      "h-8 px-3",
                      isActive
                        ? "!bg-[#00d58091] !text-[#f4f6f9] shadow"
                        : "text-[#f4f6f9]"
                    )}>
                    <Link
                      href={item.link}
                      className='flex items-center gap-3'>
                      <item.icon className={cn("h-4 w-4")} />
                      <span className={cn("text-sm font-medium")}>
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <Separator className='my-4' />

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
                      "h-10 px-3 ",
                      isActive ? "bg-white" : "text-[#f4f6f9]"
                    )}>
                    <Link
                      href={item.link}
                      className='flex items-center gap-3'>
                      <item.icon className='h-4 w-4' />
                      <span className='text-sm font-medium'>{item.title}</span>
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
