'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/useLanguage';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EditArtistPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const artistId = params?.id as string;

  const [formData, setFormData] = useState({
    nameJp: '',
    nameEn: '',
    nameCn: '',
    searchKeywords: [] as string[],
    description: '',
    coverImage: '',
    officialLinks: {
      website: '',
      twitter: '',
      instagram: '',
      youtube: '',
    },
  });
  const [keywordsInput, setKeywordsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchArtist();
  }, [artistId]);

  const fetchArtist = async () => {
    try {
      const response = await api.get(`/artists/${artistId}`);
      const artist = response.data;
      const keywords = artist.searchKeywords || [];
      setFormData({
        nameJp: artist.nameJp || '',
        nameEn: artist.nameEn || '',
        nameCn: artist.nameCn || '',
        searchKeywords: keywords,
        description: artist.description || '',
        coverImage: artist.coverImage || '',
        officialLinks: {
          website: artist.officialLinks?.website || '',
          twitter: artist.officialLinks?.twitter || '',
          instagram: artist.officialLinks?.instagram || '',
          youtube: artist.officialLinks?.youtube || '',
        },
      });
      setKeywordsInput(keywords.join(' '));
    } catch (error) {
      console.error('Failed to fetch artist:', error);
      toast.error(t('admin.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const keywords = keywordsInput
        .split(/[\s\n]+/)
        .map(k => k.trim())
        .filter(k => k.length > 0);
      
      const dataToSubmit = {
        ...formData,
        searchKeywords: keywords,
      };
      
      await api.patch(`/artists/${artistId}`, dataToSubmit);
      toast.success(t('admin.updated'));
      router.push('/admin/artists');
    } catch (error) {
      console.error('Failed to update artist:', error);
      toast.error(t('admin.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('officialLinks.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        officialLinks: {
          ...prev.officialLinks,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
          href="/admin/artists"
          className="text-primary-600 hover:text-primary-800 font-medium"
        >
          ← {t('admin.back')}
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t('admin.editArtist')}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 max-w-2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.artistNameJp')} *
            </label>
            <input
              type="text"
              name="nameJp"
              required
              value={formData.nameJp}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.artistNameEn')}
            </label>
            <input
              type="text"
              name="nameEn"
              value={formData.nameEn}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.artistNameCn')}
            </label>
            <input
              type="text"
              name="nameCn"
              value={formData.nameCn}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.searchKeywords')}
            </label>
            <input
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder={t('admin.searchKeywordsPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
            />
            <p className="mt-1 text-sm text-gray-500">
              {keywordsInput && (
                <span>
                  Preview: {keywordsInput.split(/[\s\n]+/).filter(k => k.trim()).join(' • ')}
                </span>
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.description')}
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.coverImageUrl')}
            </label>
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
              placeholder="https://"
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              {t('admin.officialLinks')}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.website')}
                </label>
                <input
                  type="url"
                  name="officialLinks.website"
                  value={formData.officialLinks.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  placeholder="https://"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter
                </label>
                <input
                  type="url"
                  name="officialLinks.twitter"
                  value={formData.officialLinks.twitter}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  placeholder="https://twitter.com/"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  type="url"
                  name="officialLinks.instagram"
                  value={formData.officialLinks.instagram}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  placeholder="https://instagram.com/"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube
                </label>
                <input
                  type="url"
                  name="officialLinks.youtube"
                  value={formData.officialLinks.youtube}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  placeholder="https://youtube.com/"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? t('admin.saving') : t('admin.save')}
          </button>
          <Link
            href="/admin/artists"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 inline-block"
          >
            {t('admin.cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
