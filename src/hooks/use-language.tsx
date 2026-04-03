'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import en from '@/messages/en.json'
import hi from '@/messages/hi.json'

type Language = 'en' | 'hi'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en,
  hi,
}

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, prop) => current?.[prop], obj) || path
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export function useTranslation() {
  const { t } = useLanguage()
  return { t }
}

export const LanguageProviderComponent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem('language') as Language | null
    if (saved === 'en' || saved === 'hi') {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (isClient) {
      localStorage.setItem('language', lang)
    }
  }

  const t = (key: string): string => {
    return getNestedValue(translations[language], key)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

