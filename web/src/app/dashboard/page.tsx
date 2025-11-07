"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user, logout, isUserLoading } = useAuthContext();

  if (isUserLoading) {
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
    </div>
  );
}
