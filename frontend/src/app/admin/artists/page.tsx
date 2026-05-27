'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/useLanguage';
import toast from 'react-hot-toast';
import { ResizableTable } from '@/components/ResizableTable';

export default function ArtistsPage() {
  const { t } = useLanguage();
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await api.get('/artists');
      setArtists(response.data);
    } catch (error) {
      toast.error(t('admin.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return;

    try {
      await api.delete(`/artists/${id}`);
      toast.success(t('admin.deleted'));
      fetchArtists();
    } catch (error) {
      toast.error(t('admin.deleteFailed'));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.artistsManagement')}</h1>
        <Link
          href="/admin/artists/new"
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium"
        >
          ➕ {t('admin.addNew')}
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : artists.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">{t('admin.noData')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <ResizableTable className="min-w-max w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                  {t('admin.name')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap w-[100px]">
                  {t('admin.tourCount')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap w-[100px]">
                  {t('admin.liveCount')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap min-w-[280px]">
                  {t('admin.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {artists.map((artist) => (
                <tr key={artist.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3" style={{ maxWidth: '300px' }}>
                    <div className="flex items-center">
                      <div className="max-w-full">
                        <div className="text-sm font-medium text-gray-900 truncate" title={artist.nameJp}>
                          {artist.nameJp}
                        </div>
                        {artist.nameCn && (
                          <div className="text-sm text-gray-600 truncate" title={artist.nameCn}>
                            {artist.nameCn}
                          </div>
                        )}
                        {artist.nameEn && (
                          <div className="text-sm text-gray-500 truncate" title={artist.nameEn}>
                            {artist.nameEn}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium text-center">
                    <div className="truncate">
                      {artist._count?.tours || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium text-center">
                    <div className="truncate">
                      {artist._count?.lives || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/tours?artist=${artist.id}`}
                        className="text-purple-600 hover:text-purple-900"
                        title={t('admin.viewTours')}
                      >
                        🎫
                      </Link>
                      <Link
                        href={`/admin/lives?artist=${artist.id}`}
                        className="text-green-600 hover:text-green-900"
                        title={t('admin.viewLives')}
                      >
                        🎤
                      </Link>
                      <Link
                        href={`/admin/lotteries?artist=${artist.id}`}
                        className="text-orange-600 hover:text-orange-900"
                        title={t('admin.viewLotteries')}
                      >
                        🎲
                      </Link>
                      <Link
                        href={`/admin/artists/${artist.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {t('admin.edit')}
                      </Link>
                      <button
                        onClick={() => handleDelete(artist.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('admin.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </ResizableTable>
        </div>
      )}
    </div>
  );
}
