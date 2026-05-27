'use client';

import { useEffect, useState } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAuthenticated, pathname, router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className="truncate text-lg font-bold text-primary-600">
            {t('admin.title')}
          </h1>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-700"
            aria-label="Toggle admin navigation"
            aria-expanded={mobileMenuOpen}
          >
            <span className="text-xl leading-none">{mobileMenuOpen ? '×' : '☰'}</span>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t bg-white px-3 py-3 shadow-sm">
            <nav className="grid grid-cols-2 gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    pathname === item.href
                      ? 'bg-primary-100 text-primary-700 font-semibold'
                      : 'text-gray-700 hover:bg-primary-50'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="min-w-0 truncate">{item.name}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
              <p className="min-w-0 truncate text-sm font-medium text-gray-700">
                {user?.username} ({user?.role})
              </p>
              <button
                onClick={logout}
                className="shrink-0 text-sm font-medium text-red-600 hover:text-red-800"
              >
                {t('admin.logout')}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 hidden w-64 bg-white shadow-lg md:block">
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
      <div className="md:ml-64">
        <main className="p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
