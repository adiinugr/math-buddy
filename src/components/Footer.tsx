"use client"

import Link from "next/link"
import { useTranslation } from "@/hooks/useTranslation"

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="w-full backdrop-blur-lg bg-white/30 border-t border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4 sm:p-6 text-sm">
        <p className="text-gray-600">{t("common.footer.copyright")}</p>
        <div className="flex gap-4">
          <Link
            href="#"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            {t("common.footer.about")}
          </Link>
          <Link
            href="#"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            {t("common.footer.contact")}
          </Link>
          <Link
            href="#"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            {t("common.footer.privacy")}
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
