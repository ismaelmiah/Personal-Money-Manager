import { getRows } from '../../lib/sheets';
import { Transaction, Account } from '../../types';

// Reusable StatCard component
const StatCard = ({ title, value, subtext }: { title: string; value: string; subtext?: string }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-base font-semibold text-gray-500">{title}</h3>
    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
    {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
  </div>
);

// This is a React Server Component (RSC)
export default async function ExpensesDashboardPage() {
  // --- 1. Fetch Data on the Server ---
  const [transactions, accounts] = await Promise.all([
    getRows<Transaction>('Transactions'),
    getRows<Account>('Accounts'),
  ]);

  // --- 2. Perform Analytics ---
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const thisMonthTransactions = transactions.filter(t => new Date(t.CreatedAt) >= startOfMonth);

  const totalIncome = thisMonthTransactions
    .filter(t => t.Type === 'Income')
    .reduce((sum, t) => sum + t.Amount, 0);

  const totalExpense = thisMonthTransactions
    .filter(t => t.Type === 'Expense')
    .reduce((sum, t) => sum + t.Amount, 0);

  const netFlow = totalIncome - totalExpense;

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.Balance, 0);
  const mainCurrency = accounts.length > 0 ? accounts[0].Currency : 'BDT';
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Expenses Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Account Balance" value={`${totalBalance.toLocaleString()} ${mainCurrency}`} />
        <StatCard title="This Month's Income" value={`+ ${totalIncome.toLocaleString()} ${mainCurrency}`} />
        <StatCard title="This Month's Expense" value={`- ${totalExpense.toLocaleString()} ${mainCurrency}`} />
        <StatCard title="This Month's Net Flow" value={`${netFlow.toLocaleString()} ${mainCurrency}`} subtext={netFlow >= 0 ? 'You are in profit' : 'You spent more than you earned'}/>
      </div>

      {/* More charts and detailed breakdowns can be added here */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Coming Soon</h2>
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            <p>Spending by Category charts and recent transaction lists will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}