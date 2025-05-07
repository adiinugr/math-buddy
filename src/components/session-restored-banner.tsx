"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SessionRestoredBannerProps {
  isVisible: boolean
  questionNumber: number
  totalQuestions: number
  onDismiss: () => void
}

export default function SessionRestoredBanner({
  isVisible,
  questionNumber,
  totalQuestions,
  onDismiss
}: SessionRestoredBannerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setVisible(true)
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false)
        onDismiss()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onDismiss])

  if (!visible) return null

  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto md:max-w-md z-50 animate-slideInDown">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-blue-800 font-medium mb-1">Session Restored</h4>
            <p className="text-blue-700 text-sm">
              Your previous session has been restored to question{" "}
              {questionNumber} of {totalQuestions}.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full text-blue-700 hover:bg-blue-100"
            onClick={() => {
              setVisible(false)
              onDismiss()
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
