"use client"

import Link from "next/link"
import { useTranslation } from "@/hooks/useTranslation"

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="w-full border-t border-border">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4 sm:p-6 text-sm text-muted-foreground">
        <p>{t("common.footer.copyright")}</p>
        <div className="flex gap-4">
          <Link href="#" className="hover:text-primary transition-colors">
            {t("common.footer.about")}
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            {t("common.footer.contact")}
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            {t("common.footer.privacy")}
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
