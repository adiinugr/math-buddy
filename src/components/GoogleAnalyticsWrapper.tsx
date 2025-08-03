"use client"

import { Suspense } from "react"
import GoogleAnalytics from "./GoogleAnalytics"

// Wrapper component to handle Suspense boundary for useSearchParams
function GoogleAnalyticsWithSuspense() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalytics />
    </Suspense>
  )
}

export default GoogleAnalyticsWithSuspense
