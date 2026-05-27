'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/useLanguage';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ResizableTable } from '@/components/ResizableTable';

export default function ToursPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const artistIdFromUrl = searchParams.get('artist');
  
  const [tours, setTours] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<string>(artistIdFromUrl || '');
  const [showModal, setShowModal] = useState(false);
  const [editingTour, setEditingTour] = useState<any>(null);
  const [formData, setFormData] = useState({
    artistId: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    officialPageUrl: '',
  });

  useEffect(() => {
    fetchArtists();
    fetchTours();
  }, []);

  useEffect(() => {
    if (artistIdFromUrl) {
      setSelectedArtist(artistIdFromUrl);
    }
  }, [artistIdFromUrl]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return;

    try {
      await api.delete(`/tours/${id}`);
      toast.success(t('admin.deleted'));
      fetchTours();
    } catch (error) {
      toast.error(t('admin.deleteFailed'));
    }
  };

  const handleOpenModal = (tour?: any) => {
    if (tour) {
      setEditingTour(tour);
      setFormData({
        artistId: tour.artistId,
        name: tour.name,
        description: tour.description || '',
        startDate: format(new Date(tour.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(tour.endDate), 'yyyy-MM-dd'),
        officialPageUrl: tour.officialPageUrl || '',
      });
    } else {
      setEditingTour(null);
      setFormData({
        artistId: selectedArtist || '',
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        officialPageUrl: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTour(null);
    setFormData({
      artistId: '',
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      officialPageUrl: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 只发送有值的字段，日期字段为空时不发送（让后端自动计算）
      const submitData: any = {
        artistId: formData.artistId,
        name: formData.name,
        description: formData.description,
        officialPageUrl: formData.officialPageUrl,
      };

      // 只有在明确填写时才发送日期
      if (formData.startDate) {
        submitData.startDate = formData.startDate;
      }
      if (formData.endDate) {
        submitData.endDate = formData.endDate;
      }

      if (editingTour) {
        await api.put(`/tours/${editingTour.id}`, submitData);
        toast.success(t('admin.updated'));
      } else {
        await api.post('/tours', submitData);
        toast.success(t('admin.created'));
      }
      handleCloseModal();
      fetchTours();
    } catch (error) {
      toast.error(editingTour ? t('admin.updateFailed') : t('admin.createFailed'));
    }
  };

  const filteredTours = tours.filter((tour) => {
    if (selectedArtist) {
      return tour.artistId === selectedArtist;
    }
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.tours')}</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium"
        >
          ➕ {t('admin.addNew')}
        </button>
      </div>

      {/* 筛选器 */}
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              {t('admin.filterByArtist')}:
            </label>
            <select
              value={selectedArtist}
              onChange={(e) => setSelectedArtist(e.target.value)}
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

          {selectedArtist && (
            <button
              onClick={() => setSelectedArtist('')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {t('admin.clearFilter')}
            </button>
          )}
          
          <span className="text-sm text-gray-600 ml-auto">
            {t('admin.total')}: {filteredTours.length} {t('admin.items')}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : filteredTours.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">{t('admin.noData')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <ResizableTable className="min-w-max w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '150px', maxWidth: '500px' }}>
                  {t('admin.tourName')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '120px' }}>
                  {t('admin.artist')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '90px' }}>
                  {t('admin.startDate')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '90px' }}>
                  {t('admin.endDate')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '100px' }}>
                  {t('admin.liveCount')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '200px' }}>
                  {t('admin.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTours.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3" style={{ maxWidth: '500px' }}>
                    <div className="text-sm font-medium text-gray-900 truncate" title={tour.name}>
                      {tour.name}
                    </div>
                    {tour.description && (
                      <div className="text-xs text-gray-600 mt-1 truncate" title={tour.description}>
                        {tour.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                    <div className="truncate" title={tour.artist?.nameJp}>
                      {tour.artist?.nameJp}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="truncate" title={format(new Date(tour.startDate), 'yyyy/MM/dd')}>
                      {format(new Date(tour.startDate), 'yyyy/MM/dd')}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="truncate" title={format(new Date(tour.endDate), 'yyyy/MM/dd')}>
                      {format(new Date(tour.endDate), 'yyyy/MM/dd')}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium text-center">
                    <div className="truncate">
                      {tour._count?.lives || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/lives?tour=${tour.id}`}
                        className="text-green-600 hover:text-green-900"
                        title={t('admin.viewLives')}
                      >
                        🎤
                      </Link>
                      <Link
                        href={`/admin/lotteries?tour=${tour.id}`}
                        className="text-orange-600 hover:text-orange-900"
                        title={t('admin.viewLotteries')}
                      >
                        🎲
                      </Link>
                      <button
                        onClick={() => handleOpenModal(tour)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {t('admin.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(tour.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingTour ? t('admin.editTour') : t('admin.addNewTour')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.artist')} *
                </label>
                <select
                  value={formData.artistId}
                  onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  required
                >
                  <option value="">{t('admin.selectArtist')}</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.nameJp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.tourName')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.startDate')} <span className="text-gray-500 text-xs">(自动计算)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-gray-50"
                    placeholder="将从关联演出自动计算"
                    title="留空将从关联的演出中自动计算最早日期"
                  />
                  <p className="text-xs text-gray-500 mt-1">留空将自动从关联演出计算</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.endDate')} <span className="text-gray-500 text-xs">(自动计算)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-gray-50"
                    placeholder="将从关联演出自动计算"
                    title="留空将从关联的演出中自动计算最晚日期"
                  />
                  <p className="text-xs text-gray-500 mt-1">留空将自动从关联演出计算</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.officialPageUrl')}
                </label>
                <input
                  type="url"
                  value={formData.officialPageUrl}
                  onChange={(e) => setFormData({ ...formData, officialPageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  placeholder="https://"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  {editingTour ? t('admin.update') : t('admin.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
