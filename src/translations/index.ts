import en from "./en"
import id from "./id"

// Keep both language types for backward compatibility but we'll only use 'id'
export type Language = "id"

export const translations = {
  en,
  id
}

export type TranslationKeys = typeof id
