'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/useLanguage';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ResizableTable } from '@/components/ResizableTable';

export default function LotteriesPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const artistIdFromUrl = searchParams.get('artist');
  const tourIdFromUrl = searchParams.get('tour');
  const liveIdFromUrl = searchParams.get('live');
  
  const [lotteries, setLotteries] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [lives, setLives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<string>(artistIdFromUrl || '');
  const [selectedTour, setSelectedTour] = useState<string>(tourIdFromUrl || '');
  const [selectedLive, setSelectedLive] = useState<string>(liveIdFromUrl || '');

  useEffect(() => {
    fetchArtists();
    fetchTours();
    fetchLives();
    fetchLotteries();
  }, []);

  useEffect(() => {
    if (artistIdFromUrl) {
      setSelectedArtist(artistIdFromUrl);
    }
    if (tourIdFromUrl) {
      setSelectedTour(tourIdFromUrl);
      // 找到对应的巡演并设置音乐人筛选
      const tour = tours.find(t => t.id === tourIdFromUrl);
      if (tour) {
        setSelectedArtist(tour.artistId);
      }
    }
    if (liveIdFromUrl) {
      setSelectedLive(liveIdFromUrl);
      // 找到对应的演出并设置音乐人和巡演筛选
      const live = lives.find(l => l.id === liveIdFromUrl);
      if (live) {
        setSelectedArtist(live.artistId);
        if (live.tourId) {
          setSelectedTour(live.tourId);
        }
      }
    }
  }, [artistIdFromUrl, tourIdFromUrl, liveIdFromUrl, tours, lives]);

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
    }
  };

  const fetchLotteries = async () => {
    try {
      const response = await api.get('/lotteries');
      setLotteries(response.data);
    } catch (error) {
      toast.error(t('admin.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return;

    try {
      await api.delete(`/lotteries/${id}`);
      toast.success(t('admin.deleted'));
      fetchLotteries();
    } catch (error) {
      toast.error(t('admin.deleteFailed'));
    }
  };

  const getStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return { text: t('admin.notStarted'), color: 'bg-yellow-100 text-yellow-800' };
    } else if (now > end) {
      return { text: t('admin.ended'), color: 'bg-gray-100 text-gray-800' };
    } else {
      return { text: t('admin.ongoing'), color: 'bg-green-100 text-green-800' };
    }
  };

  // 根据选择的音乐人筛选巡演列表
  const filteredToursForDropdown = selectedArtist
    ? tours.filter((tour) => tour.artistId === selectedArtist)
    : tours;

  // 根据选择的音乐人或巡演筛选演出列表
  const filteredLivesForDropdown = lives.filter((live) => {
    if (selectedTour) {
      return live.tourId === selectedTour;
    }
    if (selectedArtist) {
      return live.artistId === selectedArtist;
    }
    return true;
  });

  // 筛选抽选列表
  const filteredLotteries = lotteries.filter((lottery) => {
    // 后端已经将lives转换为Live对象数组
    const lotteryLives = lottery.lives || [];
    
    // 如果选择了特定演出，只显示关联该演出的抽选
    if (selectedLive) {
      return lotteryLives.some((live: any) => live.id === selectedLive);
    }
    
    // 如果选择了巡演，只显示关联该巡演演出的抽选
    if (selectedTour) {
      return lotteryLives.some((live: any) => live.tourId === selectedTour);
    }
    
    // 如果选择了音乐人，只显示关联该音乐人演出的抽选
    if (selectedArtist) {
      return lotteryLives.some((live: any) => live.artistId === selectedArtist);
    }
    
    return true;
  });

  const handleArtistChange = (artistId: string) => {
    setSelectedArtist(artistId);
    setSelectedTour(''); // 重置巡演筛选
    setSelectedLive(''); // 重置演出筛选
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.lotteriesManagement')}</h1>
        <Link
          href="/admin/lotteries/new"
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
                  {artist.nameJp || artist.nameCn || artist.nameEn || artist.id}
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
              onChange={(e) => {
                setSelectedTour(e.target.value);
                setSelectedLive(''); // 重置演出筛选
              }}
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

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              {t('admin.filterByLive')}:
            </label>
            <select
              value={selectedLive}
              onChange={(e) => setSelectedLive(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={Boolean(selectedArtist || selectedTour) && filteredLivesForDropdown.length === 0}
            >
              <option value="">{t('admin.allLives')}</option>
              {filteredLivesForDropdown.map((live) => (
                <option key={live.id} value={live.id}>
                  {live.title || live.id}
                </option>
              ))}
            </select>
          </div>

          {(selectedArtist || selectedTour || selectedLive) && (
            <button
              onClick={() => {
                setSelectedArtist('');
                setSelectedTour('');
                setSelectedLive('');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {t('admin.clearFilter')}
            </button>
          )}
          
          <span className="text-sm text-gray-600 ml-auto">
            {t('admin.total')}: {filteredLotteries.length} {t('admin.items')}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : filteredLotteries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">{t('admin.noData')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <ResizableTable className="min-w-max w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '150px', maxWidth: '400px' }}>
                  {t('admin.lotteryType')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '150px', maxWidth: '400px' }}>
                  {t('admin.relatedLives')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '130px' }}>
                  {t('admin.period')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '90px' }}>
                  {t('admin.status')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '130px' }}>
                  {t('admin.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLotteries.map((lottery) => {
                const status = getStatus(lottery.startTime, lottery.endTime);
                const lotteryLives = lottery.lives || [];
                return (
                  <tr key={lottery.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {lottery.roundType}
                        </div>
                        {lottery.requirement && (
                          <div className="text-xs text-gray-600 mt-1">
                            {t('admin.requirement')}: {lottery.requirement}
                          </div>
                        )}
                        {lottery.seatTypes && lottery.seatTypes.length > 0 && (
                          <div className="text-xs text-gray-700 mt-1">
                            {lottery.seatTypes.map((seat: any, index: number) => (
                              <span key={index} className="inline-block mr-2 bg-blue-50 px-2 py-0.5 rounded">
                                {seat.name} {seat.price}
                              </span>
                            ))}
                          </div>
                        )}
                        {lottery.ticketLimit && (
                          <div className="text-xs text-gray-600 mt-1">
                            {t('admin.ticketLimit')}: {lottery.ticketLimit}{t('admin.ticketsPerPerson')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">
                        {lotteryLives.length > 0 ? (
                          <div className="space-y-1">
                            {lotteryLives.slice(0, 2).map((live: any) => (
                              <div key={live.id} className="font-medium">
                                {live.title}
                                {live.artist && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({live.artist.nameJp})
                                  </span>
                                )}
                              </div>
                            ))}
                            {lotteryLives.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{lotteryLives.length - 2} {t('admin.more')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">{t('admin.noRelatedLives')}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div>
                        {format(new Date(lottery.startTime), 'MM/dd HH:mm')}
                        <br />~ {format(new Date(lottery.endTime), 'MM/dd HH:mm')}
                      </div>
                      {lottery.resultAnnouncementTime && (
                        <div className="text-xs text-blue-600 mt-1 font-medium">
                          {t('admin.result')}: {format(new Date(lottery.resultAnnouncementTime), 'MM/dd HH:mm')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="truncate">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/lotteries/${lottery.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {t('admin.edit')}
                        </Link>
                        <button
                          onClick={() => handleDelete(lottery.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t('admin.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </ResizableTable>
        </div>
      )}
    </div>
  );
}
