import Link from 'next/link';
import { getRows } from '../../lib/sheets';
import { Ledger, Member } from '../../types';
import { formatNumber } from '../../utils';
import { parse } from 'date-fns';

// Analytics Card Component
const StatCard = ({ title, value, subtext }: { title: string; value: string; subtext?: string }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-base font-semibold text-gray-500">{title}</h3>
    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
    {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
  </div>
);

// This is a React Server Component (RSC) by default
export default async function LedgerDashboardPage() {
  // Fetch data on the server
  const ledgers = await getRows<Ledger>('Ledger');
  const members = await getRows<Member>('Member');

  // --- Perform analytics on the server ---
  const totalReturnedBDT = ledgers
    .filter(l => l.Type === 'Return' && l.Currency === 'BDT')
    .reduce((sum, l) => sum + Number(l.Amount), 0);

  const totalReturnedGBP = ledgers
    .filter(l => l.Type === 'Return' && l.Currency === 'GBP')
    .reduce((sum, l) => sum + Number(l.Amount), 0);

  const bdtledgers = ledgers.filter(l => l.Type === 'Loan' && l.Currency === 'BDT');

  const totalLoanedBDT = bdtledgers.reduce((sum, l) => {
    const amount = Number(l.Amount);
    return sum + amount;
  }, 0);

  const gbpledgers = ledgers.filter(l => l.Currency === 'GBP' && l.Type === 'Loan');
  const totalLoanedGBP = gbpledgers.reduce((sum, l) => sum + Number(l.Amount), 0);

  const activeLoansCount = members.filter(m => m['Current Loan'] > 0).length;

  const latestLedgers = [...ledgers]
    .sort(
      (a: Ledger, b: Ledger) =>
        parse(b.CreatedAt, 'dd/MM/yyyy HH:mm:ss', new Date()).getTime() -
        parse(a.CreatedAt, 'dd/MM/yyyy HH:mm:ss', new Date()).getTime()
    )
    .slice(0, 5);
  // --- End analytics ---

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Net Loan BDT" value={`${formatNumber(totalLoanedBDT - totalReturnedBDT)} BDT`} />
        <StatCard title="Total Loaned BDT" value={`${formatNumber(totalLoanedBDT)} BDT`} />
        <StatCard title="Net Loan GBP" value={`${formatNumber(totalLoanedGBP - totalReturnedGBP)} GBP`} />
        <StatCard title="Total Loaned GBP" value={`${formatNumber(totalLoanedGBP)} GBP`} />
        <StatCard title="Members with Loans" value={activeLoansCount.toString()} />
      </div>

      {/* Latest Records List */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Latest Records</h2>
        <div className="bg-white rounded-lg shadow">
          <ul>
            {latestLedgers.map(record => (
              <li key={record.Id} className="hover:bg-gray-100 border-b last:border-b-0">
                <Link href={`/members/${record.MemberId}`} className='flex justify-between items-center p-3 '>
                  <div>
                    <p className="font-semibold">
                      {record.MemberName}
                    </p>
                    <p className="text-sm text-gray-600">{record.Notes || 'No notes'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${record.Type === 'Loan' ? 'text-red-600' : 'text-green-600'}`}>
                      {record.Type === 'Loan' ? '-' : '+'} {record.Amount} {record.Currency}
                    </p>
                    <p className="text-xs text-gray-500">{parse(record.CreatedAt, 'dd/MM/yyyy HH:mm:ss', new Date()).toLocaleDateString()}</p>
                  </div>
                </Link>

              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}