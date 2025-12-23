import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';

async function getMailItems(userId: string) {
    return db.mailItem.findMany({ where: { userId }, orderBy: { receivedAt: 'desc' } });
}

export default async function MailPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;
    const mailItems = await getMailItems(session.user.id);

  return (
        <div>
              <div className="flex justify-between items-center">
                      <h1 className="text-2xl font-semibold text-gray-900">Mail Inbox</h1>h1>
                      <span className="text-sm text-gray-500">{mailItems.length} items</span>span>
              </div>div>
              <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
                {mailItems.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-500">No mail items yet.</div>div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                              <tr>
                                                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>th>
                                                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sender</th>th>
                                                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>th>
                                                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>th>
                                                              <th className="px-6 py-3"></th>th>
                                              </tr>tr>
                                </thead>thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {mailItems.map((item) => (
                                      <tr key={item.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.receivedAt).toLocaleDateString()}</td>td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.sender || 'Unknown'}</td>td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{item.type}</td>td>
                                                        <td className="px-6 py-4">
                                                                            <span className={`px-2 py-1 text-xs rounded-full ${item.status === 'RECEIVED' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{item.status}</span>span>
                                                        </td>td>
                                                        <td className="px-6 py-4 text-right">
                                                                            <Link href={`/mail/${item.id}`} className="text-blue-600 hover:text-blue-900 text-sm">View</Link>Link>
                                                        </td>td>
                                      </tr>tr>
                                    ))}
                                </tbody>tbody>
                    </table>table>
                      )}
              </div>div>
        </div>div>
      );
}</div>
