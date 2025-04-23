import { getRows } from '../../lib/sheets';
import { Member, Ledger } from '../../types';
import { notFound } from 'next/navigation';
import { parse } from 'date-fns';
import MemberDetailsClient from './MemberDetails.Client';
// This is also a Server Component
export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    .sort((a, b) => {
      const dateA = parse(a.CreatedAt, 'dd/MM/yyyy HH:mm:ss', new Date());
      const dateB = parse(b.CreatedAt, 'dd/MM/yyyy HH:mm:ss', new Date());
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <MemberDetailsClient member={member} memberLedgers={memberLedgers} />
  );
}