'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/useLanguage';

interface Live {
  id: string;
  title: string;
  dateStart: string;
  dateEnd: string;
  venue: string;
  city: string;
  artist?: {
    nameJp: string;
    nameEn?: string;
    nameCn?: string;
  };
  lotteries?: any[];
}

interface LiveCalendarProps {
  lives: Live[];
  artistId?: string;
}

export default function LiveCalendar({ lives, artistId }: LiveCalendarProps) {
  const { language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const monthPickerRef = useRef<HTMLDivElement>(null);

  // 获取当前月份的天数
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // 将演出按日期分组
  const livesByDate = useMemo(() => {
    const map = new Map<string, Live[]>();
    lives.forEach((live) => {
      if (!live.dateStart) {
        console.warn('Live missing dateStart:', live);
        return;
      }
      try {
        const date = new Date(live.dateStart);
        // 检查日期是否有效
        if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
          console.warn('Invalid date for live:', live.title, live.dateStart);
          return;
        }
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(live);
      } catch (error) {
        console.error('Error parsing date for live:', live, error);
      }
    });
    return map;
  }, [lives]);

  // 生成日历天数数组
  const calendarDays = useMemo(() => {
    const days = [];
    // 添加上月末尾的空白
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // 添加本月的天数
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  }, [startingDayOfWeek, daysInMonth]);

  // 检查某一天是否有演出
  const hasLive = (day: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return livesByDate.has(dateKey);
  };

  // 获取某一天的演出数量
  const getLiveCount = (day: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return livesByDate.get(dateKey)?.length || 0;
  };

  // 获取某一天的演出
  const getLivesForDate = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return livesByDate.get(dateKey) || [];
  };

  // 点击日期
  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    if (hasLive(day)) {
      setSelectedDate(date);
    }
  };

  // 切换月份
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  // 点击月份选择器
  const handleMonthPickerToggle = () => {
    setShowMonthPicker(!showMonthPicker);
  };

  // 选择特定年月
  const handleMonthSelect = (selectedYear: number, selectedMonth: number) => {
    setCurrentDate(new Date(selectedYear, selectedMonth, 1));
    setSelectedDate(null);
    setShowMonthPicker(false);
  };

  // 点击外部关闭月份选择器
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

  // 星期名称
  const weekDays = language === 'zh' 
    ? ['日', '一', '二', '三', '四', '五', '六']
    : language === 'ja'
    ? ['日', '月', '火', '水', '木', '金', '土']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // 月份名称
  const monthName = language === 'zh'
    ? `${year}年${month + 1}月`
    : language === 'ja'
    ? `${year}年${month + 1}月`
    : `${new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;

  const selectedLives = selectedDate ? getLivesForDate(selectedDate) : [];

  // 获取音乐人名称（优先使用日文）
  const getArtistName = (artist: Live['artist']) => {
    if (!artist) return 'Unknown Musician';
    // 尝试多种语言
    if (artist.nameJp) return artist.nameJp;
    if (artist.nameCn) return artist.nameCn;
    if (artist.nameEn) return artist.nameEn;
    return 'Unknown Musician';
  };

  // 生成年份列表（当前年份前后各5年）
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  // 月份列表
  const months = Array.from({ length: 12 }, (_, i) => i);
  
  // 获取月份名称
  const getMonthName = (monthIndex: number) => {
    if (language === 'zh') {
      return `${monthIndex + 1}月`;
    } else if (language === 'ja') {
      return `${monthIndex + 1}月`;
    } else {
      return new Date(2000, monthIndex).toLocaleDateString('en-US', { month: 'long' });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 日历头部 */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 mb-4">
          <button
            onClick={goToPreviousMonth}
            className="whitespace-nowrap px-2 py-1.5 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors font-medium sm:px-3 sm:text-sm"
          >
            ← {language === 'zh' ? '上月' : language === 'ja' ? '前月' : 'Previous'}
          </button>
          
          {/* 可点击的月份选择器 */}
          <div className="relative" ref={monthPickerRef}>
            <button
              onClick={handleMonthPickerToggle}
              className="mx-auto flex items-center gap-1 rounded-md px-2 py-2 text-center text-lg font-bold text-gray-900 transition-colors hover:bg-gray-50 hover:text-primary-600 sm:gap-2 sm:px-4 sm:text-xl"
            >
              {monthName}
              <svg 
                className={`h-4 w-4 shrink-0 transition-transform sm:h-5 sm:w-5 ${showMonthPicker ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* 月份选择器下拉菜单 */}
            {showMonthPicker && (
              <div className="absolute top-full left-1/2 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
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
          
          <button
            onClick={goToNextMonth}
            className="whitespace-nowrap px-2 py-1.5 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors font-medium sm:px-3 sm:text-sm"
          >
            {language === 'zh' ? '下月' : language === 'ja' ? '翌月' : 'Next'} →
          </button>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="text-center font-semibold text-gray-700 py-1 text-xs"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日历网格 */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-11 sm:h-14" />;
            }

            const isSelected = selectedDate && 
              selectedDate.getDate() === day &&
              selectedDate.getMonth() === month &&
              selectedDate.getFullYear() === year;
            const hasEvent = hasLive(day);
            const liveCount = getLiveCount(day);
            const isToday = new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={!hasEvent}
                className={`
                  h-11 sm:h-14 rounded-md flex flex-col items-center justify-start pt-1.5
                  transition-all duration-200 relative text-xl sm:text-2xl
                  ${hasEvent ? 'cursor-pointer hover:bg-primary-100' : 'cursor-default'}
                  ${isSelected ? 'bg-primary-600 text-white font-bold shadow-lg border-2 border-primary-700' : ''}
                  ${!isSelected && isToday ? 'bg-primary-50 text-primary-700 font-bold border-2 border-primary-400' : ''}
                  ${!isSelected && !isToday && hasEvent ? 'bg-white border-2 border-primary-500 text-gray-900 font-semibold hover:bg-primary-50 hover:border-primary-600' : ''}
                  ${!hasEvent ? 'text-gray-400 bg-white border border-gray-100' : ''}
                `}
              >
                <span className={`leading-none ${isSelected ? 'text-white font-bold' : hasEvent ? 'font-bold' : ''}`}>{day}</span>
                {hasEvent && !isSelected && liveCount > 0 && (
                  <div className="absolute bottom-1 right-1 min-w-[0.9rem] rounded-full bg-white px-1 text-center text-[9px] font-bold leading-3 text-red-600 shadow-sm sm:min-w-[1.1rem] sm:text-[10px] sm:leading-4">
                    {liveCount}
                  </div>
                )}
                {hasEvent && isSelected && liveCount > 0 && (
                  <div className="absolute bottom-1 right-1 min-w-[0.9rem] rounded-full bg-white px-1 text-center text-[9px] font-bold leading-3 text-primary-600 shadow-sm sm:min-w-[1.1rem] sm:text-[10px] sm:leading-4">
                    {liveCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 选中日期的演出列表 */}
      {selectedDate && selectedLives.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold mb-3 text-gray-900">
            {selectedDate.toLocaleDateString(
              language === 'zh' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : 'en-US',
              { year: 'numeric', month: 'long', day: 'numeric' }
            )} {language === 'zh' ? '的演出' : language === 'ja' ? 'の公演' : 'Events'}
          </h3>
          <div className="space-y-3">
            {selectedLives.map((live) => (
              <a
                key={live.id}
                href={`/lives/${live.id}`}
                className="block p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-primary-600 font-semibold mb-1">
                      {getArtistName(live.artist)}
                    </p>
                    <h4 className="text-base font-bold text-gray-900 mb-1.5">
                      {live.title}
                    </h4>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <p>
                        🕐 {new Date(live.dateStart).toLocaleTimeString(
                          language === 'zh' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : 'en-US',
                          { hour: '2-digit', minute: '2-digit' }
                        )}
                      </p>
                      <p>📍 {live.venue}, {live.city}</p>
                      {live.lotteries && live.lotteries.length > 0 && (
                        <p className="text-primary-600 font-semibold">
                          🎫 {live.lotteries.length} {language === 'zh' ? '个抽选' : language === 'ja' ? '件の選抽' : 'lotteries'}
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
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 提示信息 */}
      {!selectedDate && (
        <div className="text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {language === 'zh' 
                ? '点击带有数字的日期查看演出详情' 
                : language === 'ja'
                ? '数字のある日付をクリックして公演詳細を表示'
                : 'Click on dates with numbers to see event details'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
