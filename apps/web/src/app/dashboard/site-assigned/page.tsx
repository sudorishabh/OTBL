"use client";

import CustomButton from "@/components/shared/btn";
import { useAuthContext } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

export default function SiteAssignedPage() {
  const { logout } = useAuthContext();

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4'>
      <div className='max-w-md text-center space-y-2'>
        <h1 className='text-lg font-semibold text-gray-900'>
          No dashboard access yet
        </h1>
        <p className='text-sm text-muted-foreground'>
          You are assigned to a site but do not have access to offices, work
          orders, or user management. Contact your administrator if you need a
          different role or assignment.
        </p>
      </div>
      <CustomButton
        type='button'
        variant='outline'
        text='Log out'
        Icon={LogOut}
        onClick={() => void logout()}
      />
    </div>
  );
}
