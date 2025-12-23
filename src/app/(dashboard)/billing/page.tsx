import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';

export default async function BillingPage() {
    const session = await getServerSession(authOptions);

  if (!session?.user) {
        redirect('/auth/signin');
  }

  let subscription = null;
    let transactions: any[] = [];
    let plans: any[] = [];

  try {
        subscription = await db.subscription.findUnique({
                where: { userId: (session.user as any).id },
                include: { plan: true },
        });

      transactions = await db.transaction.findMany({
              where: { userId: (session.user as any).id },
              orderBy: { createdAt: 'desc' },
              take: 10,
      });

      plans = await db.plan.findMany({
              where: { active: true },
              orderBy: { monthlyPrice: 'asc' },
      });
  } catch (error) {
        // Handle DB not set up
  }

  return (
        <div className="space-y-6">
              <div>
                      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>h1>
                      <p className="mt-1 text-sm text-gray-500">
                                Manage your subscription and view billing history.
                      </p>p>
              </div>div>
        
              <div className="bg-white shadow rounded-lg p-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h2>h2>
                {subscription ? (
                    <div className="flex items-center justify-between">
                                <div>
                                              <p className="text-xl font-semibold">{subscription.plan.name}</p>p>
                                              <p className="text-gray-500">${subscription.plan.monthlyPrice}/month</p>p>
                                              <p className="text-sm text-gray-500 mt-1">
                                                {subscription.itemsUsed} / {subscription.plan.itemsIncluded} items
                                              </p>p>
                                </div>div>
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                  {subscription.status}
                                </span>span>
                    </div>div>
                  ) : (
                    <p className="text-gray-500">No active subscription</p>p>
                      )}
              </div>
        
              <div className="bg-white shadow rounded-lg p-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Available Plans</h2>h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {plans.map((plan) => (
                      <div key={plan.id} className="border rounded-lg p-4">
                                    <h3 className="font-semibold">{plan.name}</h3>h3>
                                    <p className="text-2xl font-bold mt-2">${plan.monthlyPrice}/mo</p>p>
                                    <p className="text-sm text-gray-500 mt-1">{plan.itemsIncluded} items/month</p>p>
                        {plan.freePickup && <p className="text-xs text-green-600 mt-1">Free pickup</p>p>}
                      </div>div>
                    ))}
                      </div>div>
              </div>div>
        
              <div className="bg-white shadow rounded-lg p-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h2>h2>
                {transactions.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                              <tr>
                                                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>th>
                                                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>th>
                                                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>th>
                                                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>th>
                                              </tr>tr>
                                </thead>thead>
                                <tbody className="divide-y divide-gray-200">
                                  {transactions.map((txn) => (
                                      <tr key={txn.id}>
                                                        <td className="px-4 py-3 text-sm">{new Date(txn.createdAt).toLocaleDateString()}</td>td>
                                                        <td className="px-4 py-3 text-sm">{txn.type}</td>td>
                                                        <td className="px-4 py-3 text-sm text-right">${txn.amount.toFixed(2)}</td>td>
                                                        <td className="px-4 py-3 text-sm">{txn.status}</td>td>
                                      </tr>tr>
                                    ))}
                                </tbody>tbody>
                    </table>table>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No transactions yet</p>p>
                      )}
              </div>div>
        </div>div>
      );
}</div>
