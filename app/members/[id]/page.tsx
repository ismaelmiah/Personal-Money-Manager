import { getRows } from '../../lib/sheets';
import { Member, Ledger } from '../../types';
import { notFound } from 'next/navigation';
import { parse } from 'date-fns';

const StatCard = ({ title, value }: { title: string; value: string }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-base font-semibold text-gray-500">{title}</h3>
      <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
    </div>
  );
  
// This is also a Server Component
export default async function MemberDetailPage({ params }:  { params: Promise<{ id: string }> }) {
  const memberId = (await params).id;

  // Fetch all data in parallel
  const [allMembers, allLedgers] = await Promise.all([
    getRows<Member>('Member'),
    getRows<Ledger>('Ledger'),
  ]);

  const member = allMembers.find(m => m.Id === memberId);
  if (!member) {
    notFound(); // If no member found, show a 404 page
  }

  const memberLedgers = allLedgers
    .filter(l => l.MemberId === memberId)
    .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());

  // Calculate stats for this member
  const memberTotalLoaned = memberLedgers
    .filter(l => l.Type === 'Loan')
    .reduce((sum, l) => sum + l['Equivalent to BDT'], 0);

  const memberTotalReturned = memberLedgers
    .filter(l => l.Type === 'Return')
    .reduce((sum, l) => sum + l['Equivalent to BDT'], 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{member.Name}</h1>
        <p className="text-gray-600">{member.Relationship || 'No relationship specified'}</p>
        <p className="text-sm text-gray-500">{member.Email} | {member.Phone}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-10">
        <StatCard title="Current Balance" value={`${(memberTotalLoaned - memberTotalReturned).toLocaleString()} BDT`} />
        <StatCard title="Total Loaned to Member" value={`${memberTotalLoaned.toLocaleString()} BDT`} />
        <StatCard title="Total Returned by Member" value={`${memberTotalReturned.toLocaleString()} BDT`} />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        <div className="bg-white shadow rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-50">
                {/* table headers */}
            </thead>
            <tbody>
              {memberLedgers.map(record => (
                <tr key={record.Id}>
                  <td className="p-4">{parse(record.CreatedAt, 'dd/MM/yyyy HH:mm:ss', new Date()).toLocaleDateString()}</td>
                  <td className={`p-4 font-semibold ${record.Type === 'Loan' ? 'text-red-600' : 'text-green-600'}`}>{record.Type}</td>
                  <td className="p-4">{record.Amount.toLocaleString()} {record.Currency}</td>
                  <td className="p-4 text-gray-600">{record.Notes}</td>
                </tr>
              ))}
              {memberLedgers.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center p-8 text-gray-500">No records found for this member.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}