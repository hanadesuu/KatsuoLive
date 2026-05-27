'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/useLanguage';
import Link from 'next/link';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    artists: 0,
    lives: 0,
    lotteries: 0,
    upcomingLives: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [artistsRes, livesRes, lotteriesRes, upcomingRes] =
        await Promise.all([
          api.get('/artists'),
          api.get('/lives'),
          api.get('/lotteries'),
          api.get('/lives/upcoming'),
        ]);

      console.log('Stats data:', {
        artists: artistsRes.data,
        lives: livesRes.data,
        lotteries: lotteriesRes.data,
        upcoming: upcomingRes.data,
      });

      setStats({
        artists: artistsRes.data.length || 0,
        lives: livesRes.data.length || 0,
        lotteries: lotteriesRes.data.length || 0,
        upcomingLives: upcomingRes.data.length || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const statCards = [
    {
      name: t('admin.artists'),
      value: stats.artists,
      href: '/admin/artists',
      color: 'bg-blue-500',
    },
    {
      name: t('admin.lives'),
      value: stats.lives,
      href: '/admin/lives',
      color: 'bg-green-500',
    },
    {
      name: t('admin.lotteries'),
      value: stats.lotteries,
      href: '/admin/lotteries',
      color: 'bg-purple-500',
    },
    {
      name: t('admin.upcomingLives'),
      value: stats.upcomingLives,
      href: '/admin/lives',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('admin.dashboard')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className={`inline-block p-3 rounded-lg ${stat.color} mb-4`}>
              <span className="text-white text-2xl">📊</span>
            </div>
            <h3 className="text-gray-700 text-sm font-medium">{stat.name}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('admin.quickActions')}</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/artists/new"
              className="inline-flex items-center px-3 py-1.5 text-sm bg-primary-50 text-primary-700 rounded hover:bg-primary-100 font-medium"
            >
              ➕ {t('admin.addNewArtist')}
            </Link>
            <Link
              href="/admin/lives/new"
              className="inline-flex items-center px-3 py-1.5 text-sm bg-primary-50 text-primary-700 rounded hover:bg-primary-100 font-medium"
            >
              ➕ {t('admin.addNewLive')}
            </Link>
            <Link
              href="/admin/lotteries/new"
              className="inline-flex items-center px-3 py-1.5 text-sm bg-primary-50 text-primary-700 rounded hover:bg-primary-100 font-medium"
            >
              ➕ {t('admin.addNewLottery')}
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('admin.systemInfo')}</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-700 font-medium">{t('admin.version')}:</dt>
              <dd className="font-semibold text-gray-900">1.0.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-700 font-medium">{t('admin.database')}:</dt>
              <dd className="font-semibold text-gray-900">PostgreSQL</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-700 font-medium">{t('admin.backend')}:</dt>
              <dd className="font-semibold text-gray-900">NestJS</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-700 font-medium">{t('admin.frontend')}:</dt>
              <dd className="font-semibold text-gray-900">Next.js</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
