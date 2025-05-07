"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Providers from "@/components/Providers"

export default function LayoutContent({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </Providers>
  )
}
