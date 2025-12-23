import { db } from '@/lib/db';

async function getAdminStats() {
    const [totalCustomers, totalMail, pendingRequests, todayMail] = await Promise.all([
          db.user.count({ where: { role: 'CUSTOMER' } }),
          db.mailItem.count(),
          db.request.count({ where: { status: 'PENDING' } }),
          db.mailItem.count({ where: { receivedAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
        ]);
    return { totalCustomers, totalMail, pendingRequests, todayMail };
}

export default async function AdminDashboard() {
    const stats = await getAdminStats();

  return (
        <div>
              <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>h1>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="bg-white shadow rounded-lg p-5">
                                <div className="text-sm text-gray-500">Total Customers</div>div>
                                <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalCustomers}</div>div>
                      </div>div>
                      <div className="bg-white shadow rounded-lg p-5">
                                <div className="text-sm text-gray-500">Total Mail Items</div>div>
                                <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalMail}</div>div>
                      </div>div>
                      <div className="bg-white shadow rounded-lg p-5">
                                <div className="text-sm text-gray-500">Pending Requests</div>div>
                                <div className="mt-1 text-3xl font-semibold text-yellow-600">{stats.pendingRequests}</div>div>
                      </div>div>
                      <div className="bg-white shadow rounded-lg p-5">
                                <div className="text-sm text-gray-500">Mail Today</div>div>
                                <div className="mt-1 text-3xl font-semibold text-green-600">{stats.todayMail}</div>div>
                      </div>div>
              </div>div>
              <div className="mt-8 bg-white shadow rounded-lg p-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>h2>
                      <div className="space-y-3">
                                <a href="/admin/intake" className="block px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">Log New Mail</a>a>
                                <a href="/admin/requests" className="block px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100">Process Requests ({stats.pendingRequests})</a>a>
                      </div>div>
              </div>div>
        </div>div>
      );
}</div>
