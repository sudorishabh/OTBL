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
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import Input from "@/components/shared/input";
import CustomButton from "@/components/shared/btn";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useApiError } from "@/hooks/useApiError";
import { useAuthContext } from "@/contexts/AuthContext";
import { userSchemas, type userTypes } from "@pkg/schema";
import { capitalFirstLetter } from "@pkg/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Calendar,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  Shield,
  User,
  Eye,
  EyeOff,
} from "lucide-react";

function formatJoinedAt(value: Date | string | null | undefined) {
  if (value == null) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusBadgeVariant(status: string) {
  return status === "active" ? "default" : "secondary";
}

export default function ProfilePage() {
  const { refetchUser } = useAuthContext();
  const { handleError } = useApiError();
  const trpcUtils = trpc.useUtils();
  const [editing, setEditing] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { data: profile, isLoading } = trpc.userQuery.me.useQuery(undefined, {
    retry: false,
  });

  const profileForm = useForm<userTypes.UpdateUserType>({
    resolver: zodResolver(userSchemas.updateUserSchema),
    defaultValues: {
      id: 0,
      name: "",
      email: "",
      contact_number: "",
      role: "operator",
    },
  });

  const passwordForm = useForm<userTypes.UpdateUserPasswordType>({
    resolver: zodResolver(userSchemas.updateUserPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!profile) return;
    profileForm.reset({
      id: profile.id,
      name: profile.name ?? "",
      email: profile.email ?? "",
      contact_number: profile.contact_number ?? "",
      role: profile.role as userTypes.CreateUserType["role"],
    });
  }, [profile, profileForm]);

  const updateProfile = trpc.userMutation.updateUserByAdmin.useMutation({
    onSuccess: async () => {
      toast.success("Profile updated");
      setEditing(false);
      await trpcUtils.userQuery.me.invalidate();
      refetchUser();
    },
    onError: (error: any) => handleError(error, { showToast: true }),
  });

  const changePassword = trpc.userMutation.updateUserPassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed");
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: any) => handleError(error, { showToast: true }),
  });

  const handleCancelEdit = () => {
    if (profile) {
      profileForm.reset({
        id: profile.id,
        name: profile.name ?? "",
        email: profile.email ?? "",
        contact_number: profile.contact_number ?? "",
        role: profile.role as userTypes.CreateUserType["role"],
      });
    }
    setEditing(false);
  };

  if (isLoading || !profile) {
    return (
      <PageWrapper
        title='Profile'
        description='View and update your account details'>
        <div className='mt-6 max-w-2xl space-y-4'>
          <Skeleton className='h-40 w-full rounded-xl' />
          <Skeleton className='h-56 w-full rounded-xl' />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title='Profile'
      description='View and update your account details'>
      <div className='mt-6 flex max-w-2xl flex-col gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-start justify-between gap-4 space-y-0'>
            <div>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Your name, email, and contact number as stored in OTBL.
              </CardDescription>
            </div>
            {!editing ? (
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='shrink-0 gap-2'
                onClick={() => setEditing(true)}>
                <Pencil className='h-4 w-4' />
                Edit
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            {!editing ? (
              <dl className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <dt className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                    Name
                  </dt>
                  <dd className='mt-1 text-sm font-medium'>
                    {capitalFirstLetter(profile.name)}
                  </dd>
                </div>
                <div>
                  <dt className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                    Email
                  </dt>
                  <dd className='mt-1 text-sm font-medium'>{profile.email}</dd>
                </div>
                <div>
                  <dt className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                    Contact
                  </dt>
                  <dd className='mt-1 text-sm font-medium'>
                    {profile.contact_number?.trim()
                      ? profile.contact_number
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                    Role
                  </dt>
                  <dd className='mt-1'>
                    <Badge
                      variant='outline'
                      className='capitalize'>
                      {profile.role}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                    Status
                  </dt>
                  <dd className='mt-1'>
                    <Badge variant={statusBadgeVariant(profile.status)}>
                      {profile.status}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className='flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                    <Calendar className='h-3.5 w-3.5' />
                    Member since
                  </dt>
                  <dd className='mt-1 text-sm font-medium'>
                    {formatJoinedAt(profile.created_at)}
                  </dd>
                </div>
              </dl>
            ) : (
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit((values) =>
                    updateProfile.mutate({
                      ...values,
                      password: undefined,
                    }),
                  )}
                  className='space-y-4'>
                  <Input
                    control={profileForm.control}
                    fieldName='name'
                    Label='Name'
                    LabelIcon={User}
                    placeholder='Your name'
                  />
                  <Input
                    control={profileForm.control}
                    fieldName='email'
                    Label='Email'
                    LabelIcon={Mail}
                    type='email'
                    placeholder='Email address'
                  />
                  <Input
                    control={profileForm.control}
                    fieldName='contact_number'
                    Label='Contact number'
                    LabelIcon={Phone}
                    type='tel'
                    placeholder='Mobile number'
                    optional
                  />
                  <p className='text-xs text-muted-foreground'>
                    Role and account status can only be changed by an
                    administrator.
                  </p>
                  <div className='flex justify-end gap-2 pt-2'>
                    <CustomButton
                      text='Cancel'
                      type='button'
                      variant='outline'
                      onClick={handleCancelEdit}
                    />
                    <CustomButton
                      text='Save changes'
                      type='submit'
                      variant='primary'
                    />
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <KeyRound className='h-5 w-5' />
              Change password
            </CardTitle>
            <CardDescription>
              Use a strong password you do not reuse on other sites.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit((values) =>
                  changePassword.mutate(values),
                )}
                className='space-y-4'>
                <Input
                  control={passwordForm.control}
                  fieldName='currentPassword'
                  Label='Current password'
                  LabelIcon={Shield}
                  type='password'
                  placeholder='Current password'
                />
                <Input
                  control={passwordForm.control}
                  fieldName='newPassword'
                  Label='New password'
                  LabelIcon={KeyRound}
                  type={showNewPassword ? "text" : "password"}
                  placeholder='New password'
                  inputIconButton={{
                    icon: showNewPassword ? EyeOff : Eye,
                    onClick: () => setShowNewPassword((s) => !s),
                  }}
                />
                <Input
                  control={passwordForm.control}
                  fieldName='confirmPassword'
                  Label='Confirm new password'
                  LabelIcon={KeyRound}
                  type={showNewPassword ? "text" : "password"}
                  placeholder='Confirm new password'
                />
                <div className='flex justify-end pt-2'>
                  <CustomButton
                    text='Update password'
                    type='submit'
                    variant='primary'
                  />
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
