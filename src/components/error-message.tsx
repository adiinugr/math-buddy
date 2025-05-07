"use client"

import { AlertCircle, WifiOff, ServerCrash, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

type ErrorType = "connection" | "server" | "general"

interface ErrorMessageProps {
  type?: ErrorType
  message: string
  retryAction?: () => void
  backAction?: () => void
  backLabel?: string
}

export default function ErrorMessage({
  type = "general",
  message,
  retryAction,
  backAction,
  backLabel = "Go Back"
}: ErrorMessageProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    return () => {
      setIsRetrying(false)
    }
  }, [])

  const handleRetry = () => {
    if (!retryAction) return

    setIsRetrying(true)

    // Simulate a delay for better UX
    setTimeout(() => {
      retryAction()
      setIsRetrying(false)
    }, 1000)
  }

  const getIcon = () => {
    switch (type) {
      case "connection":
        return <WifiOff className="h-8 w-8 text-amber-500" />
      case "server":
        return <ServerCrash className="h-8 w-8 text-red-500" />
      default:
        return <AlertCircle className="h-8 w-8 text-red-500" />
    }
  }

  const getTitle = () => {
    switch (type) {
      case "connection":
        return "Connection Error"
      case "server":
        return "Server Error"
      default:
        return "Error"
    }
  }

  const getHelpText = () => {
    switch (type) {
      case "connection":
        return "Please check your internet connection and try again."
      case "server":
        return "Our server is experiencing issues. Please try again later."
      default:
        return "Something went wrong. Please try again."
    }
  }

  return (
    <div className="p-6 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
      <div className="flex items-center gap-4 mb-4">
        {getIcon()}
        <h3 className="text-lg font-medium text-gray-800">{getTitle()}</h3>
      </div>

      <div className="mb-6">
        <p className="text-red-600 mb-2">{message}</p>
        <p className="text-gray-600 text-sm">{getHelpText()}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {retryAction && (
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>Retry</>
            )}
          </Button>
        )}

        {backAction && (
          <Button variant="outline" onClick={backAction}>
            {backLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
