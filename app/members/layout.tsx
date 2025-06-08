import Sidebar from '@/app/components/layout/Sidebar';
import AuthButton from '@/app/components/AuthButton';

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <Sidebar/>
      </div>

      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
                Loan Tracking Platform
            </div>
            <AuthButton />
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}