"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Initialize Google Analytics
export const initGA = () => {
  console.log("🔍 Google Analytics Debug:", { GA_MEASUREMENT_ID })

  if (typeof window !== "undefined" && GA_MEASUREMENT_ID) {
    console.log("✅ Initializing Google Analytics with ID:", GA_MEASUREMENT_ID)

    // Load Google Analytics script
    const script = document.createElement("script")
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script)

    // Initialize gtag
    window.gtag = function (...args: unknown[]) {
      window.dataLayer.push(args)
    }
    window.dataLayer = window.dataLayer || []
    window.gtag("js", new Date())
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href
    })

    console.log("✅ Google Analytics initialized successfully")
  } else {
    console.warn("⚠️ Google Analytics not initialized:", {
      window: typeof window !== "undefined",
      GA_MEASUREMENT_ID: GA_MEASUREMENT_ID
    })
  }
}

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== "undefined" && GA_MEASUREMENT_ID && window.gtag) {
    console.log("📊 Tracking page view:", url)
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: document.title
    })
  }
}

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== "undefined" && GA_MEASUREMENT_ID && window.gtag) {
    console.log("📊 Tracking event:", { action, category, label, value })
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value
    })
  } else {
    console.warn("⚠️ Cannot track event - GA not available:", {
      action,
      category
    })
  }
}

// Track quiz events
export const trackQuizEvent = (
  action: "quiz_start" | "quiz_complete" | "question_answer",
  quizId?: string,
  questionId?: string,
  isCorrect?: boolean
) => {
  if (typeof window !== "undefined" && GA_MEASUREMENT_ID && window.gtag) {
    console.log("📊 Tracking quiz event:", {
      action,
      quizId,
      questionId,
      isCorrect
    })
    window.gtag("event", action, {
      event_category: "quiz",
      quiz_id: quizId,
      question_id: questionId,
      is_correct: isCorrect
    })
  }
}

// Track user actions
export const trackUserAction = (
  action: "login" | "register" | "logout" | "role_select",
  role?: string
) => {
  if (typeof window !== "undefined" && GA_MEASUREMENT_ID && window.gtag) {
    console.log("📊 Tracking user action:", { action, role })
    window.gtag("event", action, {
      event_category: "user",
      user_role: role
    })
  }
}

// Google Analytics Component
export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Initialize GA on first load
    if (!window.gtag) {
      console.log("🔄 Initializing Google Analytics component")
      initGA()
    }
  }, [])

  useEffect(() => {
    // Track page views
    if (pathname && GA_MEASUREMENT_ID) {
      const url = searchParams?.size
        ? `${pathname}?${searchParams.toString()}`
        : pathname
      trackPageView(url)
    }
  }, [pathname, searchParams])

  // Don't render anything
  return null
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}
