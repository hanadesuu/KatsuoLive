'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/useLanguage';
import toast from 'react-hot-toast';

export default function EditLivePage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const liveId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [artists, setArtists] = useState<any[]>([]);
  const [allLotteries, setAllLotteries] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    artistId: '',
    title: '',
    dateStart: '',
    dateEnd: '',
    venue: '',
    city: '',
    officialPageUrl: '',
    status: 'UPCOMING',
    coverImage: '',
    lotteryIds: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, [liveId]);

  const fetchData = async () => {
    try {
      const [liveRes, artistsRes, lotteriesRes] = await Promise.all([
        api.get(`/lives/${liveId}`),
        api.get('/artists'),
        api.get('/lotteries'),
      ]);

      const live = liveRes.data;
      
      // 获取当前演出关联的抽选ID列表
      // 后端已经将lotteries转换为Lottery对象数组
      const currentLotteryIds = (live.lotteries || []).map((lottery: any) => 
        lottery.id
      );

      setFormData({
        artistId: live.artistId || '',
        title: live.title || '',
        dateStart: live.dateStart ? new Date(live.dateStart).toISOString().slice(0, 16) : '',
        dateEnd: live.dateEnd ? new Date(live.dateEnd).toISOString().slice(0, 16) : '',
        venue: live.venue || '',
        city: live.city || '',
        officialPageUrl: live.officialPageUrl || '',
        status: live.status || 'UPCOMING',
        coverImage: live.coverImage || '',
        lotteryIds: currentLotteryIds,
      });

      setArtists(artistsRes.data);
      setAllLotteries(lotteriesRes.data);
    } catch (error) {
      toast.error(t('admin.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.patch(`/lives/${liveId}`, {
        ...formData,
        dateStart: new Date(formData.dateStart).toISOString(),
        dateEnd: formData.dateEnd ? new Date(formData.dateEnd).toISOString() : null,
      });
      toast.success(t('admin.updateSuccess'));
      router.push('/admin/lives');
    } catch (error) {
      toast.error(t('admin.updateFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLottery = (lotteryId: string) => {
    setFormData((prev) => ({
      ...prev,
      lotteryIds: prev.lotteryIds.includes(lotteryId)
        ? prev.lotteryIds.filter((id) => id !== lotteryId)
        : [...prev.lotteryIds, lotteryId],
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.editLive')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* 音乐人选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.artist')} *
          </label>
          <select
            value={formData.artistId}
            onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
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

        {/* 演出标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.liveTitle')} *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        {/* 开始时间 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.startTime')} *
          </label>
          <input
            type="datetime-local"
            value={formData.dateStart}
            onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        {/* 结束时间 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.endTime')}
          </label>
          <input
            type="datetime-local"
            value={formData.dateEnd}
            onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* 场馆 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.venue')} *
          </label>
          <input
            type="text"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        {/* 城市 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.city')} *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        {/* 官方页面 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.officialPage')}
          </label>
          <input
            type="url"
            value={formData.officialPageUrl}
            onChange={(e) => setFormData({ ...formData, officialPageUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://..."
          />
        </div>

        {/* 状态 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.status')} *
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="UPCOMING">{t('live.upcoming')}</option>
            <option value="ONGOING">{t('live.ongoing')}</option>
            <option value="FINISHED">{t('live.finished')}</option>
            <option value="CANCELLED">{t('live.cancelled')}</option>
          </select>
        </div>

        {/* 封面图片 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.coverImage')}
          </label>
          <input
            type="url"
            value={formData.coverImage}
            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://..."
          />
        </div>

        {/* 关联抽选批次 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('admin.associatedLotteries')}
          </label>
          <div className="border border-gray-300 rounded-md p-4 max-h-96 overflow-y-auto bg-gray-50">
            {allLotteries.length === 0 ? (
              <p className="text-gray-500 text-sm">{t('admin.noLotteriesAvailable')}</p>
            ) : (
              <div className="space-y-2">
                {allLotteries.map((lottery) => (
                  <label
                    key={lottery.id}
                    className="flex items-start p-3 border border-gray-200 rounded bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.lotteryIds.includes(lottery.id)}
                      onChange={() => toggleLottery(lottery.id)}
                      className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {lottery.roundType}
                      </div>
                      {lottery.requirement && (
                        <div className="text-xs text-gray-600 mt-1">
                          {t('admin.requirement')}: {lottery.requirement}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(lottery.startTime).toLocaleDateString()} ~ {new Date(lottery.endTime).toLocaleDateString()}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {t('admin.selectedCount')}: {formData.lotteryIds.length}
          </p>
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? t('admin.saving') : t('admin.save')}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/lives')}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
          >
            {t('admin.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
