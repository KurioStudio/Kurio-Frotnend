import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import es from './locales/es.json'

const languageStorageKey = 'kurio_language'
const supportedLanguages = ['es', 'en'] as const

const normalizeLanguage = (language: string | null | undefined): 'es' | 'en' => {
  if (!language) {
    return 'es'
  }

  const baseLanguage = language.toLowerCase().slice(0, 2)
  return supportedLanguages.includes(baseLanguage as 'es' | 'en')
    ? (baseLanguage as 'es' | 'en')
    : 'es'
}

const getInitialLanguage = (): 'es' | 'en' => {
  if (typeof window === 'undefined') {
    return 'es'
  }

  const rawSavedLanguage = localStorage.getItem(languageStorageKey)
  if (rawSavedLanguage) {
    return normalizeLanguage(rawSavedLanguage)
  }

  return normalizeLanguage(window.navigator.language)
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
  })

i18n.on('languageChanged', (language) => {
  if (typeof window === 'undefined') {
    return
  }

  const normalizedLanguage = normalizeLanguage(language)
  localStorage.setItem(languageStorageKey, normalizedLanguage)
})

export default i18n
