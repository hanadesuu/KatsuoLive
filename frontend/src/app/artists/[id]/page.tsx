'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/useLanguage';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LiveCalendar from '@/components/LiveCalendar';
import TourList from '@/components/TourList';

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
  officialLinks?: any;
  lives: any[];
}

interface Tour {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  officialPageUrl?: string;
  coverImage?: string;
  lives?: any[];
  _count?: {
    lives: number;
  };
}

type ViewMode = 'calendar' | 'list';

export default function ArtistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const artistId = params.id as string;

  useEffect(() => {
    if (artistId) {
      fetchArtistDetail();
      fetchTours();
    }
  }, [artistId]);

  const fetchArtistDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/artists/${artistId}`);
      setArtist(response.data);
    } catch (error) {
      console.error('Failed to fetch artist:', error);
      setError('Failed to load artist information');
    } finally {
      setLoading(false);
    }
  };

  const fetchTours = async () => {
    try {
      const response = await api.get(`/tours?artistId=${artistId}`);
      setTours(response.data);
    } catch (error) {
      console.error('Failed to fetch tours:', error);
    }
  };

  const getArtistName = () => {
    if (!artist) return '';
    return artist.nameJp;
  };

  const getArtistDescription = () => {
    if (!artist) return '';
    if (language === 'zh' && artist.descriptionCn) return artist.descriptionCn;
    if (language === 'en' && artist.descriptionEn) return artist.descriptionEn;
    if (artist.descriptionJp) return artist.descriptionJp;
    return artist.description; // Fallback to old description field
  };

  // 将演出按是否属于巡演分组
  const { toursWithLives, standaloneLives } = useMemo(() => {
    if (!artist) {
      return {
        toursWithLives: [],
        standaloneLives: [],
      };
    }

    if (!tours.length) {
      return {
        toursWithLives: [],
        standaloneLives: artist.lives || [],
      };
    }

    // 获取所有巡演ID
    const tourIds = new Set(tours.map(tour => tour.id));

    // 获取每个巡演的完整演出数据（通过tourId匹配）
    const toursWithLivesData = tours.map(tour => {
      // 从artist.lives中筛选出属于这个巡演的演出
      const fullLives = (artist.lives || []).filter(live => live.tourId === tour.id);
      
      return {
        ...tour,
        lives: fullLives,
      };
    });

    // 获取不属于任何巡演的演出（tourId为null或undefined）
    const standaloneLivesData = (artist.lives || []).filter(live => !live.tourId || !tourIds.has(live.tourId));

    return {
      toursWithLives: toursWithLivesData,
      standaloneLives: standaloneLivesData,
    };
  }, [artist, tours]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                KatsuoLive
              </Link>
              <div className="flex gap-6 items-center">
                <Link href="/calendar" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  {t('nav.calendar')}
                </Link>
                <Link href="/artists" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  {t('nav.artists')}
                </Link>
                <Link href="/admin" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  {t('nav.admin')}
                </Link>
                <LanguageSwitcher />
              </div>
            </div>
          </nav>
        </header>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading artist information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                KatsuoLive
              </Link>
              <div className="flex gap-6 items-center">
                <Link href="/calendar" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  {t('nav.calendar')}
                </Link>
                <Link href="/artists" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  {t('nav.artists')}
                </Link>
                <Link href="/admin" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  {t('nav.admin')}
                </Link>
                <LanguageSwitcher />
              </div>
            </div>
          </nav>
        </header>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 text-xl mb-4">❌ Artist not found</p>
            <Link 
              href="/"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              KatsuoLive
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/calendar" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                {t('nav.calendar')}
              </Link>
              <Link href="/artists" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                {t('nav.artists')}
              </Link>
              <Link href="/admin" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                {t('nav.admin')}
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      </header>

      {/* Artist Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/"
              className="text-white/80 hover:text-white transition-colors"
            >
              ← {language === 'zh' ? '返回首页' : language === 'ja' ? 'ホームに戻る' : 'Back to Home'}
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {artist.coverImage && (
              <div className="w-32 h-32 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                <img 
                  src={artist.coverImage} 
                  alt={getArtistName()} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                {getArtistName()}
              </h1>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {artist.nameJp && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    🇯🇵 {artist.nameJp}
                  </span>
                )}
                {artist.nameEn && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    🇬🇧 {artist.nameEn}
                  </span>
                )}
                {artist.nameCn && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    🇨🇳 {artist.nameCn}
                  </span>
                )}
              </div>

              {artist.searchKeywords && artist.searchKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-sm text-white/70">
                    {language === 'zh' ? '搜索关键词：' : language === 'ja' ? '検索キーワード：' : 'Keywords:'}
                  </span>
                  {artist.searchKeywords.map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/90"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              {getArtistDescription() && (
                <p className="text-white/90 max-w-3xl">
                  {getArtistDescription()}
                </p>
              )}

              {artist.officialLinks && (
                <div className="flex gap-3 mt-4">
                  {artist.officialLinks.website && (
                    <a
                      href={artist.officialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                    >
                      🌐 {language === 'zh' ? '官网' : language === 'ja' ? '公式サイト' : 'Website'}
                    </a>
                  )}
                  {artist.officialLinks.twitter && (
                    <a
                      href={artist.officialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                    >
                      🐦 Twitter
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Lives Calendar / Tour List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {language === 'zh' ? '演出日程' : language === 'ja' ? '公演スケジュール' : 'Live Schedule'}
              </h2>
              <p className="text-gray-600 mt-2">
                {language === 'zh' 
                  ? `查看 ${getArtistName()} 的所有演出信息` 
                  : language === 'ja'
                  ? `${getArtistName()}のすべての公演情報`
                  : `All live events by ${getArtistName()}`}
              </p>
            </div>
            
            {/* 视图切换按钮 */}
            {artist.lives.length > 0 && (
              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {language === 'zh' ? '列表视图' : language === 'ja' ? 'リスト表示' : 'List View'}
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {language === 'zh' ? '日历视图' : language === 'ja' ? 'カレンダー表示' : 'Calendar View'}
                </button>
              </div>
            )}
          </div>
        </div>

        {artist.lives.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-gray-500 text-lg">
              {language === 'zh' 
                ? '暂无演出信息' 
                : language === 'ja'
                ? '公演情報がありません'
                : 'No live events scheduled'}
            </p>
          </div>
        ) : viewMode === 'calendar' ? (
          <LiveCalendar 
            lives={artist.lives.map(live => ({
              ...live,
              artist: live.artist || {
                id: artist.id,
                nameJp: artist.nameJp,
                nameEn: artist.nameEn,
                nameCn: artist.nameCn,
              }
            }))} 
            artistId={artistId} 
          />
        ) : (
          <TourList
            tours={toursWithLives}
            standaloneLives={standaloneLives}
            artistName={getArtistName()}
          />
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
