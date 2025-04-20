"use client"

import { useCallback, useEffect, useState } from "react"
import { Language, translations } from "@/translations"
import { get } from "lodash"

// Helper to replace placeholders in translation strings
const replacePlaceholders = (
  text: string,
  replacements?: Record<string, string>
) => {
  if (!replacements) return text

  return Object.entries(replacements).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{${key}}`, "g"), value)
  }, text)
}

export const useTranslation = () => {
  const [lang, setLang] = useState<Language>("en")

  useEffect(() => {
    // Try to get language from localStorage
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang && (savedLang === "en" || savedLang === "id")) {
      setLang(savedLang)
    } else {
      // Fallback to browser language
      const browserLang = navigator.language.split("-")[0]
      setLang(browserLang === "id" ? "id" : "en")
    }
  }, [])

  const changeLanguage = useCallback((newLang: Language) => {
    localStorage.setItem("language", newLang)
    setLang(newLang)
    // Force page refresh to update all translations
    window.location.reload()
  }, [])

  const t = useCallback(
    (key: string, replacements?: Record<string, string>) => {
      const value = get(translations[lang], key) as string
      if (!value) return key // Fallback to key if translation not found
      return replacePlaceholders(value, replacements)
    },
    [lang]
  )

  return {
    t,
    lang,
    changeLanguage
  }
}

export default useTranslation
