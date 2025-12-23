'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Mail Intake', href: '/admin/intake' },
  { name: 'Requests', href: '/admin/requests' },
  { name: 'Customers', href: '/admin/customers' },
  { name: 'Pricing', href: '/admin/pricing' },
  ];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const pathname = usePathname();

  return (
        <div className="min-h-screen bg-gray-100">
              <div className="flex">
                      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                                <div className="flex flex-col flex-grow pt-5 bg-gray-800 overflow-y-auto">
                                            <div className="px-4"><h1 className="text-xl font-bold text-white">BIG Oakland Admin</h1>h1></div>div>
                                            <nav className="mt-5 flex-1 px-2 space-y-1">
                                              {navigation.map((item) => (
                          <Link key={item.name} href={item.href}
                                              className={`block px-2 py-2 text-sm font-medium rounded-md ${pathname === item.href ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                            {item.name}
                          </Link>Link>
                        ))}
                                            </nav>nav>
                                            <div className="border-t border-gray-700 p-4">
                                                          <p className="text-sm text-white">{session?.user?.name}</p>p>
                                                          <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-xs text-gray-400 hover:text-white">Sign out</button>button>
                                            </div>div>
                                </div>div>
                      </div>div>
                      <div className="md:pl-64 flex flex-col flex-1">
                                <main className="flex-1 py-6 px-4 sm:px-6 md:px-8">{children}</main>main>
                      </div>div>
              </div>div>
        </div>div>
      );
}</div>
