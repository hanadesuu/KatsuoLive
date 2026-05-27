'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/useLanguage';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LiveCalendar from '@/components/LiveCalendar';

export default function HomePage() {
  const [lives, setLives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    fetchUpcomingLives();
  }, []);

  const fetchUpcomingLives = async () => {
    try {
      const response = await api.get('/lives');
      setLives(response.data);
    } catch (error) {
      console.error('Failed to fetch lives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await api.get(`/artists?search=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Failed to search artists:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/artists?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/artists');
    }
  };

  const handleArtistSelect = (artistId: string) => {
    router.push(`/artists/${artistId}`);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="shrink-0 text-xl sm:text-2xl font-bold text-primary-600">
              KatsuoLive
            </Link>
            <div className="order-3 flex w-full items-center justify-between gap-2 text-sm sm:order-2 sm:w-auto sm:justify-end sm:gap-6 sm:text-base">
              <Link href="/calendar" className="whitespace-nowrap text-gray-700 hover:text-primary-600 font-medium transition-colors">
                {t('nav.calendar')}
              </Link>
              <Link href="/artists" className="whitespace-nowrap text-gray-700 hover:text-primary-600 font-medium transition-colors">
                {t('nav.artists')}
              </Link>
              <Link href="/admin" className="whitespace-nowrap text-gray-700 hover:text-primary-600 font-medium transition-colors">
                {t('nav.admin')}
              </Link>
            </div>
            <div className="order-2 sm:order-3">
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 mb-8">
            {t('hero.subtitle')}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8 relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder={t('search.placeholder')}
                className="w-full rounded-full bg-white py-4 pl-5 pr-24 text-base text-gray-950 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 sm:px-6 sm:pr-28 sm:text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 sm:px-6 sm:text-base"
              >
                {t('search.button')}
              </button>
            </form>

            {/* Search Results Dropdown */}
            {searchQuery && (
              <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl max-h-96 overflow-y-auto">
                {searching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                    <p className="text-sm">{t('search.searching')}</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((artist) => (
                      <button
                        key={artist.id}
                        onClick={() => handleArtistSelect(artist.id)}
                        className="w-full px-6 py-3 text-left hover:bg-primary-50 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-primary-600">
                            {artist.nameJp}
                          </div>
                          {(artist.nameEn || artist.nameCn) && (
                            <div className="text-sm text-gray-500">
                              {artist.nameEn} {artist.nameCn && `/ ${artist.nameCn}`}
                            </div>
                          )}
                          {artist._count && (
                            <div className="text-xs text-gray-400 mt-1">
                              {artist._count.lives} lives • {artist._count.tours} tours
                            </div>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    {t('search.noResults')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Live Calendar */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-900">{t('home.upcoming')}</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : lives.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            {t('home.noLives')}
          </p>
        ) : (
          <LiveCalendar lives={lives} />
        )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
