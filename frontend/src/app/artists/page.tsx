'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/useLanguage';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface Artist {
  id: string;
  nameJp: string;
  nameEn?: string;
  nameCn?: string;
  description?: string;
  descriptionJp?: string;
  descriptionEn?: string;
  descriptionCn?: string;
  coverImage?: string;
  searchKeywords: string[];
  _count?: {
    lives: number;
    tours: number;
  };
}

function ArtistsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [actualSearchQuery, setActualSearchQuery] = useState('');

  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
      setActualSearchQuery(searchFromUrl);
      setIsSearched(true);
      fetchArtists(searchFromUrl);
    } else {
      fetchArtists('');
    }
  }, []);

  const fetchArtists = async (query: string = '') => {
    try {
      setLoading(true);
      const url = query ? `/artists?search=${encodeURIComponent(query)}` : '/artists';
      const response = await api.get(url);
      setArtists(response.data);
    } catch (error) {
      console.error('Failed to fetch artists:', error);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearched(true);
    setActualSearchQuery(searchQuery);
    fetchArtists(searchQuery);
    if (searchQuery) {
      router.push(`/artists?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/artists');
    }
  };

  const getArtistName = (artist: Artist) => {
    return artist.nameJp;
  };

  const getArtistDescription = (artist: Artist) => {
    if (language === 'zh' && artist.descriptionCn) return artist.descriptionCn;
    if (language === 'en' && artist.descriptionEn) return artist.descriptionEn;
    if (artist.descriptionJp) return artist.descriptionJp;
    return artist.description; // Fallback to old description field
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Link href="/artists" className="whitespace-nowrap text-primary-600 font-semibold">
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

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            {language === 'zh' ? '音乐人搜索' : language === 'ja' ? 'ミュージシャン検索' : 'Musician Search'}
          </h1>
          <p className="text-xl text-primary-100 mb-8 text-center">
            {language === 'zh' 
              ? '搜索你喜爱的JPOP音乐人，查看演出信息' 
              : language === 'ja'
              ? 'お気に入りのJPOPミュージシャンを検索して、公演情報をチェック'
              : 'Search for your favorite JPOP musicians and check their live events'}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'zh'
                    ? '输入音乐人名称或关键词...'
                    : language === 'ja'
                    ? 'ミュージシャン名またはキーワードを入力...'
                    : 'Enter musician name or keywords...'
                }
                className="w-full px-6 py-4 rounded-full bg-white text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full font-semibold transition-colors"
              >
                {language === 'zh' ? '搜索' : language === 'ja' ? '検索' : 'Search'}
              </button>
            </form>

            {isSearched && actualSearchQuery && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActualSearchQuery('');
                    setIsSearched(false);
                    fetchArtists('');
                    router.push('/artists');
                  }}
                  className="text-white/90 hover:text-white text-sm underline"
                >
                  {language === 'zh' ? '清除搜索' : language === 'ja' ? '検索をクリア' : 'Clear search'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Artists Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isSearched && actualSearchQuery
              ? `${language === 'zh' ? '搜索结果' : language === 'ja' ? '検索結果' : 'Search Results'} "${actualSearchQuery}"`
              : language === 'zh'
              ? '所有音乐人'
              : language === 'ja'
              ? 'すべてのミュージシャン'
              : 'All Musicians'}
          </h2>
          {!loading && (
            <p className="text-gray-600 mt-1">
              {language === 'zh' ? `找到 ${artists.length} 位音乐人` : language === 'ja' ? `${artists.length}人のミュージシャン` : `${artists.length} musicians found`}
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {language === 'zh' ? '加载中...' : language === 'ja' ? '読み込み中...' : 'Loading...'}
            </p>
          </div>
        ) : artists.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {language === 'zh' ? '未找到音乐人' : language === 'ja' ? 'ミュージシャンが見つかりません' : 'No musicians found'}
            </h3>
            <p className="text-gray-600">
              {isSearched && actualSearchQuery
                ? language === 'zh'
                  ? '尝试使用其他关键词搜索'
                  : language === 'ja'
                  ? '別のキーワードで検索してみてください'
                  : 'Try searching with different keywords'
                : language === 'zh'
                ? '暂无音乐人信息'
                : language === 'ja'
                ? 'ミュージシャン情報がありません'
                : 'No musicians available'}
            </p>
          </div>
        ) : (
          <div className="columns-2 gap-3 sm:gap-4 lg:columns-3 lg:gap-6">
            {artists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artists/${artist.id}`}
                className="mb-3 inline-block w-full break-inside-avoid overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl sm:mb-4 lg:mb-6 group"
              >
                {/* Artist Cover Image */}
                <div className="aspect-[4/5] bg-gradient-to-br from-primary-400 to-primary-600 relative overflow-hidden sm:aspect-square">
                  {artist.coverImage ? (
                    <img
                      src={artist.coverImage}
                      alt={getArtistName(artist)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl sm:text-7xl">👨‍🎤</span>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>

                {/* Artist Info */}
                <div className="p-3 sm:p-5">
                  <h3 className="mb-2 text-base font-bold leading-tight text-gray-900 transition-colors group-hover:text-primary-600 sm:text-xl">
                    {getArtistName(artist)}
                  </h3>

                  {/* Alternative Names */}
                  <div className="mb-2 flex flex-wrap gap-1 text-[11px] sm:mb-3 sm:text-xs">
                    {language !== 'ja' && artist.nameJp && (
                      <span className="text-gray-600">🇯🇵 {artist.nameJp}</span>
                    )}
                    {language !== 'en' && artist.nameEn && (
                      <span className="text-gray-600">🇬🇧 {artist.nameEn}</span>
                    )}
                    {language !== 'zh' && artist.nameCn && (
                      <span className="text-gray-600">🇨🇳 {artist.nameCn}</span>
                    )}
                  </div>

                  {/* Description */}
                  {getArtistDescription(artist) && (
                    <p className="mb-2 line-clamp-2 text-xs text-gray-600 sm:mb-3 sm:text-sm">
                      {getArtistDescription(artist)}
                    </p>
                  )}

                  {/* Keywords */}
                  {artist.searchKeywords && artist.searchKeywords.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1 sm:mb-3">
                      {artist.searchKeywords.slice(0, 2).map((keyword, index) => (
                        <span
                          key={index}
                          className="rounded bg-primary-50 px-1.5 py-0.5 text-[10px] text-primary-700 sm:px-2 sm:text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                      {artist.searchKeywords.length > 2 && (
                        <span className="text-[10px] text-gray-500 sm:text-xs">
                          +{artist.searchKeywords.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  {artist._count && (
                    <div className="flex flex-col gap-1 border-t border-gray-100 pt-2 text-xs text-gray-600 sm:flex-row sm:items-center sm:gap-4 sm:pt-3 sm:text-sm">
                      <span>
                        🎤 {artist._count.lives} {language === 'zh' ? '场演出' : language === 'ja' ? '公演' : 'lives'}
                      </span>
                      <span>
                        🎫 {artist._count.tours} {language === 'zh' ? '个巡演' : language === 'ja' ? 'ツアー' : 'tours'}
                      </span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <div className="mt-3 flex items-center justify-between sm:mt-4">
                    <span className="text-xs font-medium text-primary-600 group-hover:text-primary-700 sm:text-sm">
                      {language === 'zh' ? '查看详情' : language === 'ja' ? '詳細を見る' : 'View Details'}
                    </span>
                    <svg
                      className="h-4 w-4 text-primary-600 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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

export default function ArtistsPage() {
  return (
    <Suspense fallback={<div />}>
      <ArtistsContent />
    </Suspense>
  );
}
