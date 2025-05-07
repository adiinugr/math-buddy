"use client"

import Link from "next/link"
import { useState } from "react"
import { useTranslation } from "@/hooks/useTranslation"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

export function Header() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { status } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <header className="w-full backdrop-blur-lg bg-white/30 border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-6 sm:p-6">
        <Link
          href="/"
          className="text-gray-800 font-bold text-2xl font-heading"
        >
          {t("common.title")}{" "}
          <span className="text-blue-600 text-base align-text-top">β</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex gap-2">
            {status === "authenticated" ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleLogout}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/20"
              >
                {t("common.logout")}
              </Button>
            ) : (
              <>
                <Button
                  variant="default"
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/20"
                >
                  <Link href="/auth/login">{t("common.login")}</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="bg-white/50 border-gray-200/50 hover:bg-white/70 text-gray-800 hover:text-gray-900"
                >
                  <Link href="/auth/register">{t("common.register")}</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Menu className="h-7 w-7 text-gray-800" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[250px] sm:w-[300px] p-6 backdrop-blur-lg bg-white/30 border-l border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <SheetTitle className="text-gray-800">
                  {t("common.title")} Menu
                </SheetTitle>
                <SheetClose asChild>
                  <X className="h-7 w-7 text-gray-800" />
                </SheetClose>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Akun
                  </h4>
                  {status === "authenticated" ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/20"
                    >
                      {t("common.logout")}
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/20"
                      >
                        <Link href="/auth/login">{t("common.login")}</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full bg-white/50 border-gray-200/50 hover:bg-white/70"
                      >
                        <Link href="/auth/register">
                          {t("common.register")}
                        </Link>
                      </Button>
                    </div>
                  )}
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
