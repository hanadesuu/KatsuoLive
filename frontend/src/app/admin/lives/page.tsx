'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/useLanguage';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ResizableTable } from '@/components/ResizableTable';

export default function LivesPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const artistIdFromUrl = searchParams.get('artist');
  const tourIdFromUrl = searchParams.get('tour');
  
  const [lives, setLives] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<string>(artistIdFromUrl || '');
  const [selectedTour, setSelectedTour] = useState<string>(tourIdFromUrl || '');

  useEffect(() => {
    fetchArtists();
    fetchTours();
    fetchLives();
  }, []);

  useEffect(() => {
    if (artistIdFromUrl) {
      setSelectedArtist(artistIdFromUrl);
    }
  }, [artistIdFromUrl]);

  useEffect(() => {
    if (tourIdFromUrl) {
      setSelectedTour(tourIdFromUrl);
      // 如果有 tourId，需要找到对应的 artistId 并设置
      const tour = tours.find(t => t.id === tourIdFromUrl);
      if (tour) {
        setSelectedArtist(tour.artistId);
      }
    }
  }, [tourIdFromUrl, tours]);

  const fetchArtists = async () => {
    try {
      const response = await api.get('/artists');
      setArtists(response.data);
    } catch (error) {
      toast.error(t('admin.fetchFailed'));
    }
  };

  const fetchTours = async () => {
    try {
      const response = await api.get('/tours');
      setTours(response.data);
    } catch (error) {
      toast.error(t('admin.fetchFailed'));
    }
  };

  const fetchLives = async () => {
    try {
      const response = await api.get('/lives');
      setLives(response.data);
    } catch (error) {
      toast.error(t('admin.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return;

    try {
      await api.delete(`/lives/${id}`);
      toast.success(t('admin.deleted'));
      fetchLives();
    } catch (error) {
      toast.error(t('admin.deleteFailed'));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      UPCOMING: { text: t('admin.upcoming'), color: 'bg-blue-100 text-blue-800' },
      ONGOING: { text: t('admin.ongoing'), color: 'bg-green-100 text-green-800' },
      FINISHED: { text: t('admin.finished'), color: 'bg-gray-100 text-gray-800' },
      CANCELLED: { text: t('admin.cancelled'), color: 'bg-red-100 text-red-800' },
    };
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  // 根据选择的音乐人筛选巡演列表
  const filteredToursForDropdown = selectedArtist
    ? tours.filter((tour) => tour.artistId === selectedArtist)
    : tours;

  // 筛选演出列表
  const filteredLives = lives.filter((live) => {
    if (selectedTour) {
      return live.tourId === selectedTour;
    }
    if (selectedArtist) {
      return live.artistId === selectedArtist;
    }
    return true;
  });

  const handleArtistChange = (artistId: string) => {
    setSelectedArtist(artistId);
    setSelectedTour(''); // 重置巡演筛选
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.livesManagement')}</h1>
        <Link
          href="/admin/lives/new"
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium"
        >
          ➕ {t('admin.addNew')}
        </Link>
      </div>

      {/* 三级筛选器 */}
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              {t('admin.filterByArtist')}:
            </label>
            <select
              value={selectedArtist}
              onChange={(e) => handleArtistChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{t('admin.allArtists')}</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.nameJp}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              {t('admin.filterByTour')}:
            </label>
            <select
              value={selectedTour}
              onChange={(e) => setSelectedTour(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={Boolean(selectedArtist) && filteredToursForDropdown.length === 0}
            >
              <option value="">{t('admin.allTours')}</option>
              {filteredToursForDropdown.map((tour) => (
                <option key={tour.id} value={tour.id}>
                  {tour.name}
                </option>
              ))}
            </select>
          </div>

          {(selectedArtist || selectedTour) && (
            <button
              onClick={() => {
                setSelectedArtist('');
                setSelectedTour('');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {t('admin.clearFilter')}
            </button>
          )}
          
          <span className="text-sm text-gray-600 ml-auto">
            {t('admin.total')}: {filteredLives.length} {t('admin.items')}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : filteredLives.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">{t('admin.noData')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <ResizableTable className="min-w-max w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '150px', maxWidth: '500px' }}>
                  {t('admin.liveTitle')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '100px' }}>
                  {t('admin.artist')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '90px' }}>
                  {t('admin.date')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '120px', maxWidth: '350px' }}>
                  {t('admin.venue')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '90px' }}>
                  {t('admin.status')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '100px' }}>
                  {t('admin.lotteryCount')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '150px' }}>
                  {t('admin.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLives.map((live) => (
                <tr key={live.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3" style={{ maxWidth: '500px' }}>
                    <div className="text-sm font-medium text-gray-900 truncate" title={live.title}>
                      {live.title}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                    <div className="truncate" title={live.artist?.nameJp}>
                      {live.artist?.nameJp}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="truncate" title={format(new Date(live.dateStart), 'yyyy/MM/dd')}>
                      {format(new Date(live.dateStart), 'yyyy/MM/dd')}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700" style={{ maxWidth: '350px' }}>
                    <div className="truncate" title={live.venue}>
                      {live.venue}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="truncate">
                      {getStatusBadge(live.status)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium text-center">
                    <div className="truncate">
                      {live._count?.lotteries || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/lotteries?live=${live.id}`}
                        className="text-orange-600 hover:text-orange-900"
                        title={t('admin.viewLotteries')}
                      >
                        🎲
                      </Link>
                      <Link
                        href={`/admin/lives/${live.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {t('admin.edit')}
                      </Link>
                      <button
                        onClick={() => handleDelete(live.id)}
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
