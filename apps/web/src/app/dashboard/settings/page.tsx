"use client";

import { PageWrapper } from "@/components/wrapper/page-wrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthContext } from "@/contexts/AuthContext";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

type ThemeChoice = "system" | "light" | "dark";

export default function SettingsPage() {
  const { logout } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentTheme = useMemo<ThemeChoice>(() => {
    const value = (theme ?? "system") as ThemeChoice;
    if (value === "light" || value === "dark" || value === "system") return value;
    return "system";
  }, [theme]);

  return (
    <PageWrapper title='Settings' description='App preferences and session'>
      <div className='mt-6 flex max-w-2xl flex-col gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Choose how OTBL looks on this device.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <div className='space-y-0.5'>
                <div className='text-sm font-medium'>Theme</div>
                <div className='text-xs text-muted-foreground'>
                  Light, Dark, or follow your system setting.
                </div>
              </div>
              <Select
                value={mounted ? currentTheme : "system"}
                onValueChange={(v) => setTheme(v as ThemeChoice)}
                disabled={!mounted}>
                <SelectTrigger className='w-full sm:w-56'>
                  <SelectValue placeholder='Select theme' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='system'>
                    <span className='flex items-center gap-2'>
                      <Monitor className='h-4 w-4' />
                      System
                    </span>
                  </SelectItem>
                  <SelectItem value='light'>
                    <span className='flex items-center gap-2'>
                      <Sun className='h-4 w-4' />
                      Light
                    </span>
                  </SelectItem>
                  <SelectItem value='dark'>
                    <span className='flex items-center gap-2'>
                      <Moon className='h-4 w-4' />
                      Dark
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>Manage your current login session.</CardDescription>
          </CardHeader>
          <CardContent className='flex items-center justify-between gap-4'>
            <div className='text-sm text-muted-foreground'>
              Logging out will end your current session on this device.
            </div>
            <Button variant='destructive' onClick={logout}>
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
