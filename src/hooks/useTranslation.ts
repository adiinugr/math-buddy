"use client"

import { useCallback } from "react"
import { translations } from "@/translations"
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
  // Always use Indonesian language
  const lang = "id"

  const changeLanguage = useCallback(() => {
    // This function is now a no-op since we always use Indonesian
    return
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
