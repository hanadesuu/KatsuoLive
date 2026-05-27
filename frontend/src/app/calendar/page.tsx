'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { ja, zhCN, enUS } from 'date-fns/locale';
import { useLanguage } from '@/lib/useLanguage';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function CalendarPage() {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lives, setLives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const monthPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCalendar();
  }, [currentDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
        setShowMonthPicker(false);
      }
    };

    if (showMonthPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthPicker]);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get(`/lives/calendar/${year}/${month}`);
      setLives(response.data);
    } catch (error) {
      console.error('Failed to fetch calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getLivesForDay = (day: Date) => {
    return lives.filter((live) =>
      isSameDay(new Date(live.dateStart), day)
    );
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleMonthSelect = (year: number, month: number) => {
    setCurrentDate(new Date(year, month, 1));
    setShowMonthPicker(false);
  };

  const getDateLocale = () => {
    if (language === 'zh') return zhCN;
    if (language === 'ja') return ja;
    return enUS;
  };

  const getWeekDays = () => {
    if (language === 'zh') return ['日', '一', '二', '三', '四', '五', '六'];
    if (language === 'ja') return ['日', '月', '火', '水', '木', '金', '土'];
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  };

  const getMonthName = (monthIndex: number) => {
    const date = new Date(2000, monthIndex);
    if (language === 'zh') {
      return `${monthIndex + 1}月`;
    } else if (language === 'ja') {
      return `${monthIndex + 1}月`;
    } else {
      return format(date, 'MMMM', { locale: enUS });
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  const monthName = language === 'zh'
    ? `${year}年${month + 1}月`
    : language === 'ja'
    ? `${year}年${month + 1}月`
    : format(currentDate, 'MMMM yyyy', { locale: enUS });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              KatsuoLive
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/calendar" className="text-primary-600 font-semibold">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            {/* 可点击的年月选择器 */}
            <div className="relative" ref={monthPickerRef}>
              <button
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className="text-3xl font-bold text-gray-900 hover:text-primary-600 transition-colors px-4 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                {monthName}
                <svg 
                  className={`w-6 h-6 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* 年月选择器下拉菜单 */}
              {showMonthPicker && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4 min-w-[320px]">
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'zh' ? '选择年份' : language === 'ja' ? '年を選択' : 'Select Year'}
                    </label>
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                      {years.map((y) => (
                        <button
                          key={y}
                          onClick={() => handleMonthSelect(y, month)}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            y === year
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'zh' ? '选择月份' : language === 'ja' ? '月を選択' : 'Select Month'}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {months.map((m) => (
                        <button
                          key={m}
                          onClick={() => handleMonthSelect(year, m)}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            m === month
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {getMonthName(m)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={previousMonth}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors font-medium"
              >
                ← {language === 'zh' ? '上月' : language === 'ja' ? '前月' : 'Previous'}
              </button>
              <button
                onClick={nextMonth}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors font-medium"
              >
                {language === 'zh' ? '下月' : language === 'ja' ? '翌月' : 'Next'} →
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {language === 'zh' ? '加载中...' : language === 'ja' ? '読み込み中...' : 'Loading...'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {getWeekDays().map((day, index) => (
                <div
                  key={index}
                  className="text-center font-semibold text-gray-700 py-2"
                >
                  {day}
                </div>
              ))}

              {days.map((day, dayIdx) => {
                const dayLives = getLivesForDay(day);
                return (
                  <div
                    key={day.toString()}
                    className={`min-h-[100px] border rounded p-2 ${
                      !isSameMonth(day, currentDate)
                        ? 'bg-gray-50 text-gray-400'
                        : 'bg-white'
                    }`}
                  >
                    <div className="text-right text-xl font-semibold mb-1">
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayLives.map((live) => (
                        <Link
                          key={live.id}
                          href={`/lives/${live.id}`}
                          className="block text-xs bg-primary-100 text-primary-800 p-1 rounded hover:bg-primary-200 truncate"
                        >
                          {(live.artist?.nameJp || live.artist?.nameCn || live.artist?.nameEn || 'Unknown')} - {live.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

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
