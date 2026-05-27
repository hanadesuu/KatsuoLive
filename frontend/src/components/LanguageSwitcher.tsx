'use client';

import { useLanguage } from '@/lib/useLanguage';
import { Language } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; prefix: string }[] = [
    { code: 'zh', label: '中文', prefix: 'CN' },
    { code: 'ja', label: '日本語', prefix: 'JP' },
    { code: 'en', label: 'English', prefix: 'EN' },
  ];

  return (
    <div className="relative inline-block">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="max-w-[7rem] appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-900 transition-colors hover:border-primary-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 sm:max-w-none"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.prefix} {lang.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}
