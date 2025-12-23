import { db } from '@/lib/db';
import { ProcessRequestButton } from './ProcessRequestButton';

async function getPendingRequests() {
    return db.request.findMany({
          where: { status: 'PENDING' },
          include: { user: { select: { firstName: true, lastName: true } }, mailItem: true },
          orderBy: { createdAt: 'asc' },
    });
}

export default async function AdminRequestsPage() {
    const requests = await getPendingRequests();

  return (
        <div>
              <h1 className="text-2xl font-semibold text-gray-900">Pending Requests</h1>h1>
              <p className="mt-2 text-sm text-gray-600">{requests.length} requests to process</p>p>
              <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
                {requests.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-500">No pending requests.</div>div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                              <tr>
                                                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>th>
                                                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>th>
                                                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>th>
                                                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>th>
                                                              <th className="px-6 py-3"></th>th>
                                              </tr>tr>
                                </thead>thead>
                                <tbody className="divide-y divide-gray-200">
                                  {requests.map((req) => (
                                      <tr key={req.id}>
                                                        <td className="px-6 py-4 text-sm">{new Date(req.createdAt).toLocaleDateString()}</td>td>
                                                        <td className="px-6 py-4 text-sm">{req.user.lastName}, {req.user.firstName}</td>td>
                                                        <td className="px-6 py-4 text-sm font-medium">{req.type}</td>td>
                                                        <td className="px-6 py-4 text-sm">${req.amount.toFixed(2)}</td>td>
                                                        <td className="px-6 py-4"><ProcessRequestButton requestId={req.id} /></td>td>
                                      </tr>tr>
                                    ))}
                                </tbody>tbody>
                    </table>table>
                      )}
              </div>div>
        </div>div>
      );
}</div>
