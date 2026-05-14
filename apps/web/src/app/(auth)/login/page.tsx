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
    <div className='min-h-screen flex items-center justify-center bg-blue-50 dark:bg-gray-950 p-4 relative overflow-hidden'>
      {/* Building skyline background */}
      <div className='absolute inset-0 flex items-end justify-center pointer-events-none select-none'>
        <svg
          viewBox='0 0 1440 420'
          xmlns='http://www.w3.org/2000/svg'
          className='w-full text-gray-300/60 dark:text-gray-700/50'
          preserveAspectRatio='xMidYMax slice'
          fill='currentColor'
        >
          {/* Stepped / tiered tower — left */}
          <rect x='20' y='280' width='70' height='140' />
          <rect x='30' y='255' width='50' height='25' />
          <rect x='40' y='235' width='30' height='20' />
          <rect x='53' y='215' width='5' height='20' />

          {/* Flat-top wide office block */}
          <rect x='100' y='300' width='90' height='120' />
          <rect x='115' y='285' width='60' height='15' />

          {/* Pyramid-top building */}
          <polygon points='220,245 260,290 180,290' />
          <rect x='180' y='290' width='80' height='130' />

          {/* Slim tower with spire */}
          <rect x='285' y='250' width='40' height='170' />
          <polygon points='305,210 315,250 295,250' />
          <rect x='303' y='195' width='4' height='15' />

          {/* Stepped skyscraper center-left */}
          <rect x='345' y='230' width='100' height='190' />
          <rect x='355' y='205' width='80' height='25' />
          <rect x='368' y='185' width='54' height='20' />
          <rect x='380' y='168' width='30' height='17' />
          <rect x='393' y='152' width='5' height='16' />

          {/* Arched-top building */}
          <path d='M460 420 L460 300 Q490 270 520 300 L520 420 Z' />

          {/* Blocky industrial with chimney */}
          <rect x='540' y='310' width='80' height='110' />
          <rect x='545' y='290' width='25' height='20' />
          <rect x='590' y='295' width='20' height='15' />
          <rect x='549' y='270' width='7' height='20' />

          {/* Tall slim glass tower */}
          <rect x='640' y='220' width='50' height='200' />
          <rect x='648' y='200' width='34' height='20' />
          <rect x='663' y='185' width='4' height='15' />

          {/* Wide setback tower (Empire State style) */}
          <rect x='710' y='260' width='110' height='160' />
          <rect x='722' y='235' width='86' height='25' />
          <rect x='737' y='210' width='56' height='25' />
          <rect x='750' y='190' width='30' height='20' />
          <rect x='763' y='170' width='4' height='20' />

          {/* Flat warehouse */}
          <rect x='840' y='330' width='100' height='90' />
          <rect x='850' y='315' width='80' height='15' />

          {/* Circular-top (dome) building */}
          <path d='M960 420 L960 320 Q995 280 1030 320 L1030 420 Z' />
          <rect x='970' y='318' width='60' height='5' />

          {/* Twin towers */}
          <rect x='1050' y='255' width='38' height='165' />
          <rect x='1096' y='265' width='38' height='155' />
          <rect x='1055' y='238' width='28' height='17' />
          <rect x='1101' y='248' width='28' height='17' />
          <rect x='1067' y='220' width='4' height='18' />
          <rect x='1113' y='230' width='4' height='18' />

          {/* Stepped mid-rise */}
          <rect x='1155' y='285' width='85' height='135' />
          <rect x='1165' y='265' width='65' height='20' />
          <rect x='1177' y='248' width='41' height='17' />

          {/* Tapered top tower */}
          <polygon points='1265,240 1285,290 1245,290' />
          <rect x='1245' y='290' width='80' height='130' />
          <rect x='1273' y='225' width='4' height='15' />

          {/* Far-right simple high-rise */}
          <rect x='1345' y='270' width='65' height='150' />
          <rect x='1353' y='250' width='49' height='20' />
          <rect x='1375' y='235' width='5' height='15' />

          {/* Ground */}
          <rect x='0' y='418' width='1440' height='4' />
        </svg>
      </div>
      <div className='relative z-10 w-full max-w-md mx-auto space-y-6'>
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
