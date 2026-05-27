'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/useLanguage';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, checkAuth } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAuthenticated, pathname, router]);

  if (pathname === '/admin/login') {
    return children;
  }

  if (!isAuthenticated) {
    return null;
  }

  const navigation = [
    { name: t('admin.dashboard'), href: '/admin', icon: '📊' },
    { name: t('admin.artists'), href: '/admin/artists', icon: '👨‍🎤' },
    { name: t('admin.tours'), href: '/admin/tours', icon: '🎫' },
    { name: t('admin.lives'), href: '/admin/lives', icon: '🎤' },
    { name: t('admin.lotteries'), href: '/admin/lotteries', icon: '🎲' },
    { name: t('admin.documents'), href: '/admin/documents', icon: '📄' },
    { name: t('admin.audit'), href: '/admin/audit', icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b px-4">
            <h1 className="text-xl font-bold text-primary-600">
              {t('admin.title')}
            </h1>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary-50 transition-colors ${
                  pathname === item.href
                    ? 'bg-primary-100 text-primary-700 font-semibold'
                    : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="border-t p-4 space-y-3">
            <p className="text-sm text-gray-700 font-medium">
              {user?.username} ({user?.role})
            </p>
            <div className="flex items-center justify-between gap-2">
              <LanguageSwitcher />
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                {t('admin.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
