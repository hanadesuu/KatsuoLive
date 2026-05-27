'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/useLanguage';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EditLotteryPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const lotteryId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lives, setLives] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    roundType: '',
    requirement: '',
    startTime: '',
    endTime: '',
    sourceUrl: '',
    notes: '',
    seatTypes: [] as Array<{ name: string; price: string }>,
    ticketLimit: 0,
    resultAnnouncementTime: '',
    selectedLives: [] as string[],
  });

  useEffect(() => {
    fetchLottery();
    fetchLives();
  }, [lotteryId]);

  const fetchLottery = async () => {
    try {
      const response = await api.get(`/lotteries/${lotteryId}`);
      const lottery = response.data;
      
      setFormData({
        roundType: lottery.roundType || '',
        requirement: lottery.requirement || '',
        startTime: lottery.startTime ? new Date(lottery.startTime).toISOString().slice(0, 16) : '',
        endTime: lottery.endTime ? new Date(lottery.endTime).toISOString().slice(0, 16) : '',
        sourceUrl: lottery.sourceUrl || '',
        notes: lottery.notes || '',
        seatTypes: lottery.seatTypes || [],
        ticketLimit: lottery.ticketLimit || 0,
        resultAnnouncementTime: lottery.resultAnnouncementTime 
          ? new Date(lottery.resultAnnouncementTime).toISOString().slice(0, 16) 
          : '',
        selectedLives: lottery.lives?.map((live: any) => live.id) || [],
      });
    } catch (error) {
      console.error('Failed to fetch lottery:', error);
      toast.error(t('admin.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchLives = async () => {
    try {
      const response = await api.get('/lives');
      setLives(response.data);
    } catch (error) {
      console.error('Failed to fetch lives:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData: any = {
        roundType: formData.roundType,
        requirement: formData.requirement || null,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        sourceUrl: formData.sourceUrl || null,
        notes: formData.notes || null,
      };

      // Add optional fields
      if (formData.seatTypes && formData.seatTypes.length > 0) {
        updateData.seatTypes = formData.seatTypes;
      }
      if (formData.ticketLimit) {
        updateData.ticketLimit = formData.ticketLimit;
      }
      if (formData.resultAnnouncementTime) {
        updateData.resultAnnouncementTime = new Date(formData.resultAnnouncementTime).toISOString();
      }

      await api.patch(`/lotteries/${lotteryId}`, updateData);
      toast.success(t('admin.updateSuccess'));
      router.push('/admin/lotteries');
    } catch (error: any) {
      console.error('Failed to update lottery:', error);
      toast.error(error.response?.data?.message || t('admin.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const addSeatType = () => {
    setFormData({
      ...formData,
      seatTypes: [...formData.seatTypes, { name: '', price: '' }],
    });
  };

  const removeSeatType = (index: number) => {
    setFormData({
      ...formData,
      seatTypes: formData.seatTypes.filter((_, i) => i !== index),
    });
  };

  const updateSeatType = (index: number, field: 'name' | 'price', value: string) => {
    const newSeatTypes = [...formData.seatTypes];
    newSeatTypes[index][field] = value;
    setFormData({ ...formData, seatTypes: newSeatTypes });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/lotteries"
          className="text-primary-600 hover:text-primary-800 font-medium"
        >
          ← {t('admin.back')}
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t('admin.editLottery')}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Round Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.lotteryType')} *
            </label>
            <input
              type="text"
              value={formData.roundType}
              onChange={(e) => setFormData({ ...formData, roundType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
              required
              placeholder="例：PREMIUM会员最速先行"
            />
          </div>

          {/* Requirement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.requirement')}
            </label>
            <input
              type="text"
              value={formData.requirement}
              onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
              placeholder="例：ZUTOMAYO PREMIUM 会员"
            />
          </div>

          {/* Time Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.startTime')} *
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.endTime')} *
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                required
              />
            </div>
          </div>

          {/* Result Announcement Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.resultAnnouncementTime')}
            </label>
            <input
              type="datetime-local"
              value={formData.resultAnnouncementTime}
              onChange={(e) => setFormData({ ...formData, resultAnnouncementTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
            />
          </div>

          {/* Seat Types */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('admin.seatTypes')}
              </label>
              <button
                type="button"
                onClick={addSeatType}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                + {t('admin.addSeatType')}
              </button>
            </div>
            {formData.seatTypes.map((seat, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={seat.name}
                  onChange={(e) => updateSeatType(index, 'name', e.target.value)}
                  placeholder={t('admin.seatName')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                />
                <input
                  type="text"
                  value={seat.price}
                  onChange={(e) => updateSeatType(index, 'price', e.target.value)}
                  placeholder={t('admin.price')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => removeSeatType(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Ticket Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.ticketLimit')}
            </label>
            <input
              type="number"
              value={formData.ticketLimit || ''}
              onChange={(e) => setFormData({ ...formData, ticketLimit: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
              min="0"
              placeholder="0"
            />
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.sourceUrl')}
            </label>
            <input
              type="url"
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
              placeholder="https://"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
              rows={3}
              placeholder={t('admin.notesPlaceholder')}
            />
          </div>

          {/* Associated Lives (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.associatedLives')}
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              {formData.selectedLives.length > 0 ? (
                <div className="text-sm text-gray-700">
                  {lives
                    .filter(live => formData.selectedLives.includes(live.id))
                    .map(live => (
                      <div key={live.id} className="py-1">
                        • {live.title} ({live.artist?.nameJp})
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t('admin.noLivesAssociated')}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {t('admin.cannotEditLivesHere')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <Link
            href="/admin/lotteries"
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            {t('admin.cancel')}
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-gray-400"
          >
            {saving ? t('admin.saving') : t('admin.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
