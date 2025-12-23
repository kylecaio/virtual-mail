'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Mail', href: '/mail' },
  { name: 'Requests', href: '/requests' },
  { name: 'Billing', href: '/billing' },
  { name: 'Settings', href: '/settings' },
  ];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const pathname = usePathname();

  return (
        <div className="min-h-screen bg-gray-100">
              <div className="flex">
                      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                                <div className="flex flex-col flex-grow pt-5 bg-blue-700 overflow-y-auto">
                                            <div className="flex items-center flex-shrink-0 px-4">
                                                          <h1 className="text-xl font-bold text-white">BIG Oakland</h1>h1>
                                            </div>div>
                                            <div className="mt-5 flex-1 flex flex-col">
                                                          <nav className="flex-1 px-2 pb-4 space-y-1">
                                                            {navigation.map((item) => (
                            <Link key={item.name} href={item.href}
                                                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                                                          pathname.startsWith(item.href) ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-600'
                                                  }`}>
                              {item.name}
                            </Link>Link>
                          ))}
                                                          </nav>nav>
                                            </div>div>
                                            <div className="flex-shrink-0 flex border-t border-blue-800 p-4">
                                                          <div className="ml-3">
                                                                          <p className="text-sm font-medium text-white">{session?.user?.name}</p>p>
                                                                          <button onClick={() => signOut({ callbackUrl: '/login' })}
                                                                                              className="text-xs font-medium text-blue-200 hover:text-white">Sign out</button>button>
                                                          </div>div>
                                            </div>div>
                                </div>div>
                      </div>div>
                      <div className="md:pl-64 flex flex-col flex-1">
                                <main className="flex-1">
                                            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>div>
                                </main>main>
                      </div>div>
              </div>div>
        </div>div>
      );
}</div>
