import { createContext, useContext, useState } from 'react'
import { translations } from '../utils/translations'

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')

  const t = (key) => {
    return translations[language]?.[key] || key
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'uk' : 'en')
  }

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)