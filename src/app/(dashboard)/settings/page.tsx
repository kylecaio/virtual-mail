import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

  if (!session?.user) {
        redirect('/auth/signin');
  }

  let user = null;
    try {
          user = await db.user.findUnique({
                  where: { id: (session.user as any).id },
                  select: { id: true, name: true, email: true, phone: true },
          });
    } catch (error) {
          user = { id: '', name: session.user?.name, email: session.user?.email, phone: '' };
    }

  return (
        <div className="space-y-6">
              <div>
                      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>h1>
                      <p className="mt-1 text-sm text-gray-500">Manage your account information.</p>p>
              </div>div>
        
              <div className="bg-white shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Profile</h2>h2>
                                <SettingsForm user={user} />
                      </div>div>
              </div>div>
        
              <div className="bg-white shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Forwarding Address</h2>h2>
                                <div className="space-y-4">
                                            <div>
                                                          <label className="block text-sm font-medium text-gray-700">Street</label>label>
                                                          <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                            </div>div>
                                            <div className="grid grid-cols-3 gap-4">
                                                          <div>
                                                                          <label className="block text-sm font-medium text-gray-700">City</label>label>
                                                                          <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                                          </div>div>
                                                          <div>
                                                                          <label className="block text-sm font-medium text-gray-700">State</label>label>
                                                                          <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                                          </div>div>
                                                          <div>
                                                                          <label className="block text-sm font-medium text-gray-700">ZIP</label>label>
                                                                          <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                                          </div>div>
                                            </div>div>
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Save Address</button>button>
                                </div>div>
                      </div>div>
              </div>div>
        
              <div className="bg-white shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>h2>
                                <div className="space-y-4">
                                            <div className="flex items-center">
                                                          <input type="checkbox" id="email-notif" className="h-4 w-4 rounded border-gray-300" defaultChecked />
                                                          <label htmlFor="email-notif" className="ml-2 text-sm text-gray-900">Email for new mail</label>label>
                                            </div>div>
                                            <div className="flex items-center">
                                                          <input type="checkbox" id="sms-notif" className="h-4 w-4 rounded border-gray-300" />
                                                          <label htmlFor="sms-notif" className="ml-2 text-sm text-gray-900">SMS for new mail</label>label>
                                            </div>div>
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Save Preferences</button>button>
                                </div>div>
                      </div>div>
              </div>div>
        </div>div>
      );
}</div>
