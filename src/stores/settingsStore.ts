import create from 'zustand';

type Language = 'en' | 'fr';

interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void;

  // Any other settings you use (theme, etc.)
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useSettingsStore = create<SettingsState>(set => ({
  language: 'en',
  setLanguage: lang => set(() => ({ language: lang })),
  theme: 'light',
  setTheme: theme => set(() => ({ theme })),
}));