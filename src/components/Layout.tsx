"use client"

import { ReactNode } from "react"
import Header from "./Header"
import Footer from "./Footer"

interface LayoutProps {
  children: ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "6xl" | "full"
  className?: string
}

export function Layout({
  children,
  maxWidth = "6xl",
  className = ""
}: LayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "6xl": "max-w-6xl",
    full: "w-full"
  }

  return (
    <>
      <Header />
      <main className={`p-8 pb-20 sm:p-20 ${className}`}>
        <div className={`mx-auto ${maxWidthClasses[maxWidth]}`}>{children}</div>
      </main>
      <Footer />
    </>
  )
}

export default Layout
