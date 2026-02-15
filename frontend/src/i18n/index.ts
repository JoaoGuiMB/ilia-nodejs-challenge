import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import pt from './locales/pt.json'

const LANGUAGE_KEY = 'app-language'

function getStoredLanguage(): string {
  if (typeof window === 'undefined') {
    return 'en'
  }
  return localStorage.getItem(LANGUAGE_KEY) || navigator.language.split('-')[0] || 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'pt'],
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_KEY, lng)
    document.documentElement.lang = lng
  }
})

export default i18n
