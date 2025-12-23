import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';

async function getRequests(userId: string) {
    return db.request.findMany({ where: { userId }, include: { mailItem: true }, orderBy: { createdAt: 'desc' } });
}

export default async function RequestsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;
    const requests = await getRequests(session.user.id);

  return (
        <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Requests</h1>h1>
              <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
                {requests.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-500">No requests yet.</div>div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                              <tr>
                                                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>th>
                                                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>th>
                                                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mail</th>th>
                                                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>th>
                                                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>th>
                                              </tr>tr>
                                </thead>thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {requests.map((req) => (
                                      <tr key={req.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{req.type}</td>td>
                                                        <td className="px-6 py-4 text-sm"><Link href={`/mail/${req.mailItemId}`} className="text-blue-600 hover:underline">{req.mailItem?.sender || 'View'}</Link>Link></td>td>
                                                        <td className="px-6 py-4 text-sm text-gray-900">${req.amount.toFixed(2)}</td>td>
                                                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{req.status}</span>span></td>td>
                                      </tr>tr>
                                    ))}
                                </tbody>tbody>
                    </table>table>
                      )}
              </div>div>
        </div>div>
      );
}</div>
