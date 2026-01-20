import React from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import LoginForm from "./_components/LoginForm";

const LoginPage = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-blue-50 dark:bg-gray-950 p-4'>
      <div className='w-full max-w-md mx-auto space-y-6'>
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
            <LoginForm />
          </CardContent>
        </Card>

        <div className='text-center text-xs text-gray-500 dark:text-gray-400'>
          <p>
            © {new Date().getFullYear()} OTBL. All rights reserved. Protected
            by industry-leading security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
