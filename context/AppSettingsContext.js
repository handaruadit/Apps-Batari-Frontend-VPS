//===== (Imports) ======
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getAppColors } from '@/config/theme';
import { translations } from '@/locales/translations';

//===== (Storage Keys) ======
const THEME_STORAGE_KEY = 'batari:theme-mode';
const LANGUAGE_STORAGE_KEY = 'batari:language';

//===== (AppSettingsContext) ======
const AppSettingsContext = createContext(null);

//===== (AppSettingsProvider) ======
export function AppSettingsProvider({ children }) {
  const [themeMode, setThemeModeState] = useState('light');
  const [language, setLanguageState] = useState('en');

  //===== (Load Settings Effect) ======
  useEffect(() => {
    let isMounted = true;

    //===== (loadSettings) ======
    async function loadSettings() {
      const [storedTheme, storedLanguage] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
      ]);

      if (!isMounted) return;

      if (storedTheme === 'light' || storedTheme === 'dark') {
        setThemeModeState(storedTheme);
      }

      if (storedLanguage === 'en' || storedLanguage === 'id') {
        setLanguageState(storedLanguage);
      }
    }

    loadSettings().catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  //===== (setThemeMode) ======
  const setThemeMode = async (nextThemeMode) => {
    const safeThemeMode = nextThemeMode === 'light' ? 'light' : 'dark';
    setThemeModeState(safeThemeMode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, safeThemeMode);
  };

  //===== (setLanguage) ======
  const setLanguage = async (nextLanguage) => {
    const safeLanguage = nextLanguage === 'id' ? 'id' : 'en';
    setLanguageState(safeLanguage);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, safeLanguage);
  };

  //===== (contextValue) ======
  const value = useMemo(() => {
    const dictionary = translations[language] || translations.en;

    return {
      themeMode,
      setThemeMode,
      language,
      setLanguage,
      colors: getAppColors(themeMode),
      t: (key) => dictionary[key] || translations.en[key] || key,
    };
  }, [language, themeMode]);

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

//===== (useAppSettings) ======
export function useAppSettings() {
  const value = useContext(AppSettingsContext);

  if (!value) {
    return {
      themeMode: 'light',
      setThemeMode: async () => {},
      language: 'en',
      setLanguage: async () => {},
      colors: getAppColors('light'),
      t: (key) => translations.en[key] || key,
    };
  }

  return value;
}
