'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { ja, zhCN, enUS } from 'date-fns/locale';
import { useLanguage } from '@/lib/useLanguage';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LiveDetailPage() {
  const params = useParams();
  const [live, setLive] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    if (params.id) {
      fetchLive();
    }
  }, [params.id]);

  const fetchLive = async () => {
    try {
      const response = await api.get(`/lives/${params.id}`);
      setLive(response.data);
    } catch (error) {
      console.error('Failed to fetch live:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateLocale = () => {
    if (language === 'zh') return zhCN;
    if (language === 'ja') return ja;
    return enUS;
  };

  const getArtistName = (artist: any) => {
    if (!artist) return 'Unknown Musician';
    // 尝试多种语言
    if (artist.nameJp) return artist.nameJp;
    if (artist.nameCn) return artist.nameCn;
    if (artist.nameEn) return artist.nameEn;
    return 'Unknown Musician';
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: { zh: string; ja: string; en: string } } = {
      UPCOMING: { zh: '即将举行', ja: '予定', en: 'Upcoming' },
      ONGOING: { zh: '进行中', ja: '進行中', en: 'Ongoing' },
      FINISHED: { zh: '已结束', ja: '終了', en: 'Finished' },
      CANCELLED: { zh: '已取消', ja: 'キャンセル', en: 'Cancelled' },
    };
    return statusMap[status]?.[language] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!live) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-900 text-lg">{t('live.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              KatsuoLive
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/" className="text-gray-700 hover:text-primary-600">
                {t('nav.calendar')}
              </Link>
              <Link href="/artists" className="text-gray-700 hover:text-primary-600">
                {t('nav.artists')}
              </Link>
              <Link href="/admin" className="text-gray-700 hover:text-primary-600">
                {t('nav.admin')}
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cover Image */}
        {live.coverImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={live.coverImage}
              alt={live.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Main Info */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          {live.artist && (
            <Link
              href={`/artists/${live.artist.id}`}
              className="text-primary-600 font-semibold hover:text-primary-800 mb-2 inline-block"
            >
              {getArtistName(live.artist)}
            </Link>
          )}
          {!live.artist && (
            <span className="text-gray-500 mb-2 inline-block">
              {getArtistName(live.artist)}
            </span>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{live.title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                {t('live.dateTime')}
              </h3>
              <p className="text-lg text-gray-900">
                {format(new Date(live.dateStart), 'yyyy年M月d日(E) HH:mm', {
                  locale: getDateLocale(),
                })}
                {live.dateEnd &&
                  ` - ${format(new Date(live.dateEnd), 'HH:mm')}`}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                {t('live.venue')}
              </h3>
              <p className="text-lg text-gray-900">
                {live.venue}
                <span className="text-gray-600 ml-2">({live.city})</span>
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                {t('live.status')}
              </h3>
              <p className="text-lg">
                <span
                  className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                    live.status === 'UPCOMING'
                      ? 'bg-blue-100 text-blue-800'
                      : live.status === 'ONGOING'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {getStatusText(live.status)}
                </span>
              </p>
            </div>

            {live.officialPageUrl && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  {t('live.official')}
                </h3>
                <a
                  href={live.officialPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-800 inline-flex items-center"
                >
                  {t('live.officialLink')} →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Lottery Timeline */}
        {live.lotteries && live.lotteries.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('live.lotterySchedule')}</h2>
            <div className="space-y-4">
              {[...live.lotteries]
                .sort((a: any, b: any) => {
                  const aLottery = a.lottery || a;
                  const bLottery = b.lottery || b;
                  return new Date(bLottery.startTime).getTime() - new Date(aLottery.startTime).getTime();
                })
                .map((ll: any) => {
                const lottery = ll.lottery || ll;
                const now = new Date();
                const startTime = new Date(lottery.startTime);
                const endTime = new Date(lottery.endTime);
                const status = 
                  now < startTime ? 'beforeStart' :
                  now > endTime ? 'ended' : 'ongoing';
                
                const borderColor = 
                  status === 'beforeStart' ? 'border-yellow-500' :
                  status === 'ended' ? 'border-gray-400' : 'border-green-500';

                return (
                  <div
                    key={lottery.id}
                    className={`border-l-4 ${borderColor} pl-4 py-2`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{lottery.roundType}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded font-semibold ${
                          status === 'beforeStart'
                            ? 'bg-yellow-100 text-yellow-800'
                            : status === 'ended'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {t(`live.${status}`)}
                      </span>
                    </div>
                    {lottery.requirement && (
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">{t('live.condition')}:</span> {lottery.requirement}
                      </p>
                    )}
                    
                    {/* 席位类型和价格 */}
                    {lottery.seatTypes && lottery.seatTypes.length > 0 && (
                      <div className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">{t('live.seatTypes')}:</span>{' '}
                        {lottery.seatTypes.map((seat: any, index: number) => (
                          <span key={index} className="inline-block mr-3 bg-blue-50 px-2 py-1 rounded">
                            {seat.name} <span className="font-semibold text-primary-700">{seat.price}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* 票数限制 */}
                    {lottery.ticketLimit && (
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">{t('live.ticketLimit')}:</span> {t('live.perPerson')} {lottery.ticketLimit} {t('live.tickets')}
                      </p>
                    )}
                    
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        <span className="font-semibold">{t('live.period')}:</span>{' '}
                        {format(startTime, 'yyyy/MM/dd HH:mm')} ~ {format(endTime, 'yyyy/MM/dd HH:mm')}
                      </p>
                      
                      {/* 结果发布时间 */}
                      {lottery.resultAnnouncementTime && (
                        <p>
                          <span className="font-semibold">{t('live.resultAnnouncement')}:</span>{' '}
                          {format(new Date(lottery.resultAnnouncementTime), 'yyyy/MM/dd HH:mm')}
                        </p>
                      )}
                    </div>
                    {lottery.sourceUrl && (
                      <a
                        href={lottery.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-800 mt-2 inline-block font-medium"
                      >
                        {t('live.apply')} →
                      </a>
                    )}
                    {lottery.notes && (
                      <p className="text-sm text-gray-700 mt-2 bg-yellow-50 p-2 rounded border border-yellow-200">
                        ⚠️ {lottery.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Documents */}
        {live.documents && live.documents.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('live.relatedInfo')}</h2>
            <div className="space-y-3">
              {live.documents.map((doc: any) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.slug}`}
                  className="block p-4 border border-gray-200 rounded hover:bg-gray-50 hover:border-primary-300 transition-colors"
                >
                  <h3 className="font-semibold text-lg text-gray-900">{doc.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
