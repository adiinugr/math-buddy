"use client"

import { Montserrat, Raleway } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap"
})

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap"
})

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <title>Math Buddy - Mathematics Diagnostic Tool</title>
        <meta
          name="description"
          content="Assessment and diagnostic tool to identify your math strengths and areas for improvement"
        />
      </head>
      <body
        className={`${montserrat.variable} ${raleway.variable} antialiased bg-background text-foreground font-sans`}
      >
        <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
