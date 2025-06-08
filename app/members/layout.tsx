import Sidebar from '@/app/components/layout/Sidebar';

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="flex">
        <div className="hidden lg:flex h-screen lg:w-72 lg:flex-col">
          <Sidebar />
        </div>
        <main className='w-full'>
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
  );
}