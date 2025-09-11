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
import { Building2, LayoutDashboard, User, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

const sidebarLinks = [
  {
    title: "Overview",
    link: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Offices",
    link: "/offices",
    icon: Building2,
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
      className='border-r'>
      <SidebarHeader className='p-6'>
        <div className='flex items-center gap-3'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary'>
            <Image
              src='/otbl-logo.png'
              alt='OTBL Logo'
              width={24}
              height={24}
              className='h-6 w-6'
            />
          </div>
          {state !== "collapsed" && (
            <div className='flex flex-col'>
              <span className='text-sm font-semibold text-foreground'>
                OTBL
              </span>
              <span className='text-xs text-muted-foreground'>
                Management System
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className='px-3'>
        <SidebarGroup>
          <SidebarGroupLabel className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu className='mt-2'>
            {sidebarLinks.map((item) => {
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
                    className='h-10 px-3'>
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

        <Separator className='my-4' />

        <SidebarGroup>
          <SidebarGroupLabel className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
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
                    className='h-10 px-3'>
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
