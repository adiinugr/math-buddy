import en from "./en"
import id from "./id"

export type Language = "en" | "id"

export const translations = {
  en,
  id
}

export type TranslationKeys = typeof en
