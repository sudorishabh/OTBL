"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";

// Validation schema
const loginSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const router = useRouter();
  const { setUser } = useAuthContext();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = trpc.authMutation.login.useMutation();

  type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
  };

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: (data: { user: User }) => {
        // Redirect to dashboard or desired page after successful login
        router.push("/dashboard");
        setUser(data.user);
      },
      onError: (error: { message: string }) => {
        alert(`Login failed: ${error.message}`);
      },
    });
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-blue-50 dark:bg-gray-950 p-4'>
      <div className='w-full max-w-md mx-auto space-y-6'>
        {/* Brand Header */}
        <div className='text-center space-y-3'>
          <div className='inline-flex items-center'>
            <Image
              src='/otbl-logo.png'
              alt='OTBL Logo'
              width={500}
              height={500}
              className='h-16 w-28'
            />
          </div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-700 dark:text-gray-100'>
            ONGC TERI Biotech Limited
          </h1>
          <p className='text-base text-gray-600 dark:text-gray-400'>
            Management System
          </p>
        </div>

        {/* Login Form Card */}
        <Card className='border-0 shadow-md bg-white dark:bg-gray-900'>
          <CardHeader className='space-y-1 text-center pb-6'>
            <CardTitle className='text-2xl font-bold text-gray-700 dark:text-gray-100'>
              Welcome Back
            </CardTitle>
            <CardDescription className='text-base'>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-5'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='your.email@example.com'
                          className='h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='••••••••'
                          className='h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex items-center justify-between pt-1'>
                  <button
                    type='button'
                    className='text-sm font-medium text-cyan-700 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors'>
                    Forgot password?
                  </button>
                </div>

                <Button
                  type='submit'
                  className='w-full h-11 bg-emerald-600 hover:bg-emerald-700/90 cursor-pointer text-white shadow-md transition-colors duration-200 font-medium'
                  size='lg'>
                  Sign In
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className='text-center text-xs text-gray-500 dark:text-gray-400'>
          <p>
            © 2025 OTBL. All rights reserved. Protected by industry-leading
            security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
