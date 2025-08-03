import type { Metadata } from "next"
import { Montserrat, Raleway } from "next/font/google"
import "./globals.css"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Toaster } from "sonner"
import GoogleAnalyticsWrapper from "@/components/GoogleAnalyticsWrapper"

// Optimize font loading
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"]
})

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"]
})

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      <p className="text-gray-700 animate-pulse">Memuat...</p>
    </div>
  </div>
)

// Dynamically import LayoutContent with loading fallback
const LayoutContent = dynamic(() => import("@/components/LayoutContent"), {
  ssr: true,
  loading: () => <LoadingSkeleton />
})

export const metadata: Metadata = {
  title: "Math Buddy - Alat Diagnostik Matematika",
  description:
    "Platform penilaian diagnostik matematika interaktif untuk siswa dan guru",
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "Alat Diagnostik Matematika",
    description:
      "Platform penilaian diagnostik matematika interaktif untuk siswa dan guru",
    siteName: "Alat Diagnostik Matematika"
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${montserrat.variable} ${raleway.variable}`}>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preload" href="/favicon.ico" as="image" />
      </head>
      <body className="antialiased bg-background text-foreground font-sans">
        <Suspense fallback={<LoadingSkeleton />}>
          <LayoutContent>{children}</LayoutContent>
        </Suspense>
        <Toaster position="top-right" richColors closeButton />
        <GoogleAnalyticsWrapper />
      </body>
    </html>
  )
}
