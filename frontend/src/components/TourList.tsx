'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/useLanguage';
import { format } from 'date-fns';
import { zhCN, ja, enUS } from 'date-fns/locale';

interface Live {
  id: string;
  title: string;
  dateStart: string;
  dateEnd?: string;
  venue: string;
  city: string;
  tourId?: string;
  lotteries?: any[];
}

interface Tour {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  officialPageUrl?: string;
  coverImage?: string;
  lives?: Live[];
  _count?: {
    lives: number;
  };
}

interface TourListProps {
  tours: Tour[];
  standaloneLives: Live[];
  artistName?: string;
}

export default function TourList({ tours, standaloneLives, artistName }: TourListProps) {
  const { language } = useLanguage();
  const [expandedTours, setExpandedTours] = useState<Set<string>>(new Set());

  const locale = language === 'zh' ? zhCN : language === 'ja' ? ja : enUS;

  // 切换巡演展开/收起
  const toggleTour = (tourId: string) => {
    const newExpanded = new Set(expandedTours);
    if (newExpanded.has(tourId)) {
      newExpanded.delete(tourId);
    } else {
      newExpanded.add(tourId);
    }
    setExpandedTours(newExpanded);
  };

  // 格式化日期范围
  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate) return '';
    
    try {
      const start = new Date(startDate);
      let startStr: string;
      if (language === 'zh') {
        startStr = format(start, 'yyyy年MM月dd日', { locale });
      } else if (language === 'ja') {
        startStr = format(start, 'yyyy年MM月dd日', { locale });
      } else {
        startStr = format(start, 'MMM dd, yyyy', { locale });
      }
      
      if (endDate) {
        const end = new Date(endDate);
        let endStr: string;
        if (language === 'zh') {
          endStr = format(end, 'yyyy年MM月dd日', { locale });
        } else if (language === 'ja') {
          endStr = format(end, 'yyyy年MM月dd日', { locale });
        } else {
          endStr = format(end, 'MMM dd, yyyy', { locale });
        }
        
        // 如果开始和结束日期相同，只显示一个日期
        if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
          return startStr;
        }
        
        // 如果年份相同，只显示一次年份
        if (start.getFullYear() === end.getFullYear()) {
          if (language === 'zh' || language === 'ja') {
            const startStrShort = format(start, 'MM月dd日', { locale });
            const endStrShort = format(end, 'MM月dd日', { locale });
            return `${start.getFullYear()}年${startStrShort} - ${endStrShort}`;
          } else {
            const startStrShort = format(start, 'MMM dd', { locale });
            const endStrShort = format(end, 'MMM dd', { locale });
            return `${startStrShort} - ${endStrShort}, ${start.getFullYear()}`;
          }
        }
        
        return `${startStr} - ${endStr}`;
      }
      
      return startStr;
    } catch (error) {
      return startDate;
    }
  };

  // 格式化单个日期
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (language === 'zh' || language === 'ja') {
        return format(date, 'yyyy年MM月dd日', { locale });
      } else {
        return format(date, 'MMM dd, yyyy', { locale });
      }
    } catch (error) {
      return dateStr;
    }
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'HH:mm', { locale });
    } catch (error) {
      return '';
    }
  };

  // 按日期排序巡演（最新的在前）
  const sortedTours = useMemo(() => {
    return [...tours].sort((a, b) => {
      const aDate = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bDate = b.startDate ? new Date(b.startDate).getTime() : 0;
      return bDate - aDate;
    });
  }, [tours]);

  // 按日期排序单独演出（最新的在前）
  const sortedStandaloneLives = useMemo(() => {
    return [...standaloneLives].sort((a, b) => {
      return new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime();
    });
  }, [standaloneLives]);

  return (
    <div className="w-full space-y-6">
      {/* 巡演列表 */}
      {sortedTours.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'zh' ? '巡演' : language === 'ja' ? 'ツアー' : 'Tours'}
          </h3>
          <div className="space-y-4">
            {sortedTours.map((tour) => {
              const isExpanded = expandedTours.has(tour.id);
              const tourLives = tour.lives || [];
              const liveCount = tour._count?.lives || tourLives.length;

              return (
                <div
                  key={tour.id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* 巡演头部 */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => toggleTour(tour.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold text-gray-900">
                            {tour.name}
                          </h4>
                          {tour.coverImage && (
                            <img
                              src={tour.coverImage}
                              alt={tour.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                          )}
                        </div>
                        
                        {tour.description && (
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {tour.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          {tour.startDate && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDateRange(tour.startDate, tour.endDate)}
                            </span>
                          )}
                          
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {liveCount} {language === 'zh' ? '场演出' : language === 'ja' ? '公演' : 'shows'}
                          </span>
                          
                          {tour.officialPageUrl && (
                            <a
                              href={tour.officialPageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              {language === 'zh' ? '官网' : language === 'ja' ? '公式サイト' : 'Official'}
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 flex items-center gap-2">
                        <button
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTour(tour.id);
                          }}
                        >
                          <svg
                            className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 巡演下的演出列表 */}
                  {isExpanded && tourLives.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <div className="space-y-3">
                        {tourLives
                          .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime())
                          .map((live) => (
                            <Link
                              key={live.id}
                              href={`/lives/${live.id}`}
                              className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="text-base font-bold text-gray-900 mb-2">
                                    {live.title}
                                  </h5>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <p className="flex items-center gap-2">
                                      <span className="text-primary-600">🕐</span>
                                      {formatDate(live.dateStart)} {formatTime(live.dateStart)}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <span className="text-primary-600">📍</span>
                                      {live.venue}, {live.city}
                                    </p>
                                    {live.lotteries && live.lotteries.length > 0 && (
                                      <p className="text-primary-600 font-semibold flex items-center gap-2">
                                        <span>🎫</span>
                                        {live.lotteries.length} {language === 'zh' ? '个抽选' : language === 'ja' ? '件の選抽' : 'lotteries'}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 单独演出列表 */}
      {sortedStandaloneLives.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'zh' ? '单独演出' : language === 'ja' ? '単独公演' : 'Standalone Shows'}
          </h3>
          <div className="space-y-3">
            {sortedStandaloneLives.map((live) => (
              <Link
                key={live.id}
                href={`/lives/${live.id}`}
                className="block p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="text-base font-bold text-gray-900 mb-2">
                      {live.title}
                    </h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center gap-2">
                        <span className="text-primary-600">🕐</span>
                        {formatDate(live.dateStart)} {formatTime(live.dateStart)}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-primary-600">📍</span>
                        {live.venue}, {live.city}
                      </p>
                      {live.lotteries && live.lotteries.length > 0 && (
                        <p className="text-primary-600 font-semibold flex items-center gap-2">
                          <span>🎫</span>
                          {live.lotteries.length} {language === 'zh' ? '个抽选' : language === 'ja' ? '件の選抽' : 'lotteries'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {sortedTours.length === 0 && sortedStandaloneLives.length === 0 && (
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
      )}
    </div>
  );
}
