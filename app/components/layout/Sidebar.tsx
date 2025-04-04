'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlatformStore } from '@/app/store/platformStore';
import { useSyncStore } from '@/app/store/syncStore'; // <-- Import sync store
import AuthButton from '../AuthButton';

// Define all possible navigation items
const ledgerNav = [
  { name: 'Dashboard', href: '/ledger/dashboard' },
  { name: 'All Records', href: '/ledger/records' },
  { name: 'Members', href: '/members' },
];

const expensesNav = [
  { name: 'Dashboard', href: '/expenses/dashboard' },
  { name: 'Transactions', href: '/expenses/transactions' },
  { name: 'Accounts', href: '/expenses/accounts' },
  { name: 'Categories', href: '/expenses/categories' },
];

const navigationItems = {
  ledger: ledgerNav,
  expenses: expensesNav,
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const pathname = usePathname();
  const { platform } = usePlatformStore();
  const { pendingTransactions } = useSyncStore(); // <-- Get pending transactions

  // Determine which navigation to show
  const currentNav = navigationItems[platform] || [];
  const pendingCount = pendingTransactions.length;

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <h1 className="text-white text-xl font-bold">{platform === 'expenses' ? 'Expense Tracker' : 'Ledger'}</h1>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {currentNav.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={classNames(
                      pathname.startsWith(item.href) // Use startsWith for better active state matching
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold items-center'
                    )}
                  >
                    <span className="flex-1">{item.name}</span>
                    {/* THE SYNC BADGE! */}
                    {item.name === 'Transactions' && pendingCount > 0 && (
                      <span className="ml-auto whitespace-nowrap rounded-full bg-blue-600 px-2.5 py-1 text-xs font-medium text-white">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
      <div className="mt-auto flex gap-x-3 flex-col">
        <a href="/select-platform" className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white">
          Switch Platform
        </a>
        <AuthButton />
      </div>
    </div>
  );
}