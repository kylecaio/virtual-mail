import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';

async function getStats(userId: string) {
    const [totalMail, pendingRequests, recentMail] = await Promise.all([
          db.mailItem.count({ where: { userId } }),
          db.request.count({ where: { userId, status: 'PENDING' } }),
          db.mailItem.findMany({ where: { userId }, orderBy: { receivedAt: 'desc' }, take: 5 }),
        ]);
    return { totalMail, pendingRequests, recentMail };
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;
    const stats = await getStats(session.user.id);

  return (
        <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>h1>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                                <div className="text-sm font-medium text-gray-500">Total Mail Items</div>div>
                                <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalMail}</div>div>
                                <Link href="/mail" className="mt-3 text-sm text-blue-600 hover:text-blue-500 block">View all</Link>Link>
                      </div>div>
                      <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                                <div className="text-sm font-medium text-gray-500">Pending Requests</div>div>
                                <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.pendingRequests}</div>div>
                                <Link href="/requests" className="mt-3 text-sm text-blue-600 hover:text-blue-500 block">View all</Link>Link>
                      </div>div>
                      <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                                <div className="text-sm font-medium text-gray-500">Account Status</div>div>
                                <div className="mt-1 text-3xl font-semibold text-green-600">Active</div>div>
                                <Link href="/billing" className="mt-3 text-sm text-blue-600 hover:text-blue-500 block">Manage</Link>Link>
                      </div>div>
              </div>div>
              <div className="mt-8">
                      <h2 className="text-lg font-medium text-gray-900">Recent Mail</h2>h2>
                      <div className="mt-4 bg-white shadow rounded-md">
                                <ul className="divide-y divide-gray-200">
                                  {stats.recentMail.length === 0 ? (
                        <li className="px-6 py-4 text-gray-500">No mail items yet</li>li>
                      ) : stats.recentMail.map((item) => (
                        <li key={item.id}>
                                        <Link href={`/mail/${item.id}`} className="block hover:bg-gray-50 px-6 py-4">
                                                          <div className="flex justify-between">
                                                                              <p className="text-sm font-medium text-blue-600">{item.sender || 'Unknown'}</p>p>
                                                                              <p className="text-sm text-gray-500">{new Date(item.receivedAt).toLocaleDateString()}</p>p>
                                                          </div>div>
                                                          <p className="mt-1 text-sm text-gray-500">{item.type}</p>p>
                                        </Link>Link>
                        </li>li>
                      ))}
                                </ul>ul>
                      </div>div>
              </div>div>
        </div>div>
      );
}</div>
