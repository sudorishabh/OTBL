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
  Webhook,
  LogOutIcon,
  LogOut,
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
    title: "Sites",
    link: "/site",
    icon: Tent,
  },
  // {
  //   title: "Activities",
  //   link: "/activity",
  //   icon: ChartNoAxesGantt,
  // },
  // {
  //   title: "Budget Categories",
  //   link: "/budget-category",
  //   icon: ReceiptIndianRupee,
  // },
  {
    title: "Clients",
    link: "/client",
    icon: Webhook,
  },
  {
    title: "Work Orders",
    link: "/work-order",
    icon: ReceiptIndianRupee,
  },
  {
    title: "Offices",
    link: "/office",
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
  {
    title: "Logout",
    icon: LogOut,
  },
];

interface SidebarMenuListProps {
  item: {
    title: string;
    link: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };
  isActive: boolean;
}

const SidebarMenuList = ({ item, isActive }: SidebarMenuListProps) => {
  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={cn(
          "h-7 pl-3 ",
          isActive
            ? "!bg-emerald-600 !text-gray-100 shadow"
            : "!text-gray-300 hover:bg-emerald-600/65 focus:!bg-transparent"
        )}>
        <Link
          href={`/dashboard${item.link}`}
          className='flex items-center gap-3'>
          <item.icon className={cn("h-4 w-4")} />
          <span className={cn("text-xs", isActive ? "font-semibold" : "")}>
            {item.title}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

function AppSidebar() {
  let pathname = usePathname();
  const { state } = useSidebar();

  if (!pathname.startsWith("/dashboard")) {
    return null;
  } else {
    pathname = pathname.replace("/dashboard", "") || "/";
  }

  return (
    <Sidebar
      collapsible='icon'
      className='border-0 w-[14rem]'>
      <SidebarHeader className='p-6 bg-cyan-900'>
        <div className='flex flex-col justify-center items-center gap-2'>
          <Image
            src='/otbl-logo.png'
            alt='OTBL Logo'
            width={500}
            height={500}
            className='h-16 w-28'
          />
          {state !== "collapsed" && (
            <span className='text-xs text-gray-100'>Management System</span>
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
              const isActive =
                item.link === "/"
                  ? pathname === item.link
                  : pathname.startsWith(item.link);

              return (
                <SidebarMenuList
                  key={item.title}
                  item={item}
                  isActive={isActive}
                />
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <Separator className='bg-gray-400' />

        <SidebarGroup>
          <SidebarGroupLabel className='text-[11px] font-medium text-gray-300 uppercase tracking-wider'>
            Account
          </SidebarGroupLabel>
          <SidebarMenu className='mt-2'>
            {footerLinks.map((item) => {
              const isActive = pathname === item.link;
              return (
                <SidebarMenuList
                  key={item.title}
                  item={item}
                  isActive={isActive}
                />
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
