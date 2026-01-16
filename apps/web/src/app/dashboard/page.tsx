"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, logout, isUserLoading } = useAuthContext();

  // // SharePoint connection test (for debugging)
  // const { mutateAsync: createFolder } =
  //   trpc.sharePointMutation.createFolder.useMutation();

  // const { data: folders } = trpc.sharePointQuery.getFolders.useQuery({
  //   folderPath: "/OTBL",
  // });

  // const createFolderHandler = async () => {
  //   try {
  //     const result = await createFolder({
  //       parentPath: "/OTBL",
  //       folderName: "TestFolder2",
  //     });

  //     console.log(result);
  //     console.log("Folder created successfully");
  //   } catch (error) {
  //     console.error("Error creating folder:", error);
  //   }
  // };

  // useEffect(() => {
  //   createFolderHandler();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // console.log(folders);

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
