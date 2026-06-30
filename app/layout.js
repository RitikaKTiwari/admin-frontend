"use client";

import { usePathname } from 'next/navigation';
import './globals.css';
import Sidebar from '@/app/_components/Sidebar';
import AdminHeader from '@/app/_components/AdminHeader';
import { isAdminLoggedIn } from '@/app/_services/api/admin';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const isAdminPage = pathname?.startsWith('/admin') || pathname === '/dashboard' || pathname === '/products' || pathname === '/orders' || pathname === '/users';
  
  const isLoginPage = pathname === '/login';

  // Protect admin routes
  useEffect(() => {
    if (isAdminPage && !isLoginPage) {
      if (!isAdminLoggedIn()) {
        router.push('/login');
      }
    }
  }, [isAdminPage, isLoginPage, router]);

  if (isLoginPage) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  // Admin pages - with sidebar and header
  if (isAdminPage) {
    // Don't  if not logged in
    if (typeof window !== 'undefined' && !isAdminLoggedIn()) {
      return (
        <html lang="en">
          <body>{children}</body>
        </html>
      );
    }

    return (
      <html lang="en">
        <body>
          <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <AdminHeader />
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}