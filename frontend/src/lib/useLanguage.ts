import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, getTranslation } from './i18n';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const useLanguage = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: 'zh',
      setLanguage: (lang: Language) => set({ language: lang }),
      t: (key: string) => getTranslation(key, get().language),
    }),
    {
      name: 'katsuolive-language',
    }
  )
);
