"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Dashboard</h1>
        <Button
          onClick={() => logout()}
          variant='outline'>
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {user?.name}!</CardTitle>
          <CardDescription>
            Your session is persisted even after page reload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Role:</strong> {user?.role}
            </p>
            <p>
              <strong>User ID:</strong> {user?.id}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className='mt-6'>
        <Card>
          <CardHeader>
            <CardTitle>How Authentication Works</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <p>✅ Your authentication is persisted using HTTP-only cookies</p>
            <p>✅ Refresh tokens are automatically used to renew sessions</p>
            <p>✅ You can reload the page and stay logged in</p>
            <p>✅ Protected routes redirect to login if not authenticated</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
