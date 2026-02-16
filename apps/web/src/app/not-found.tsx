import Link from "next/link";

export default function NotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <h1 className='text-9xl font-bold text-gray-800'>404</h1>
        <h2 className='mt-4 text-2xl font-semibold text-gray-700'>
          Page Not Found
        </h2>
        <p className='mt-2 text-gray-500'>
          Could not find the requested resource
        </p>
        <Link
          href='/dashboard'
          className='mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-white transition-colors hover:bg-emerald-700'>
          Return Home
        </Link>
      </div>
    </div>
  );
}
