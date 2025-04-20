"use client"

import Link from "next/link"
import { useState } from "react"
import { useTranslation } from "@/hooks/useTranslation"
import { Button } from "@/components/ui/button"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Menu, ChevronDown, X } from "lucide-react"

export function Header() {
  const { t, changeLanguage } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (newLang: "en" | "id") => {
    changeLanguage(newLang)
    setIsOpen(false)
  }

  return (
    <header className="w-full border-b border-border">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-6 sm:p-6">
        <Link href="/" className="text-primary font-bold text-2xl font-heading">
          {t("common.title")}{" "}
          <span className="text-accent text-base align-text-top">β</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          <div className="flex gap-2">
            <Button variant="default" size="sm">
              {t("common.login")}
            </Button>
            <Button variant="outline" size="sm">
              {t("common.register")}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Menu className="h-7 w-7" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] p-6">
              <div className="flex items-center justify-between mb-6">
                <SheetTitle>{t("common.title")} Menu</SheetTitle>
                <SheetClose asChild>
                  <X className="h-7 w-7" />
                </SheetClose>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    {t("common.language")}
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <div className="flex items-center">
                          <span className="mr-2">
                            {t("common.language") === "Language" ? "🇺🇸" : "🇮🇩"}
                          </span>
                          <span>
                            {t("common.language") === "Language"
                              ? "English"
                              : "Indonesia"}
                          </span>
                        </div>
                        <ChevronDown className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-full min-w-[200px]"
                    >
                      <DropdownMenuItem
                        onClick={() => handleLanguageChange("en")}
                      >
                        <span className="mr-2">🇺🇸</span> English
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleLanguageChange("id")}
                      >
                        <span className="mr-2">🇮🇩</span> Indonesia
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-col gap-3 mt-4">
                  <Button variant="default" className="w-full">
                    {t("common.login")}
                  </Button>
                  <Button variant="outline" className="w-full">
                    {t("common.register")}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Header
