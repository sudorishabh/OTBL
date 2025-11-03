import AppSidebar from "../_components/AppSidebar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex'>
      <AppSidebar />
      <div className='w-full'>{children}</div>
    </div>
  );
}
