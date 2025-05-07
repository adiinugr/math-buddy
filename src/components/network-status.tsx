"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface NetworkStatusProps {
  isConnected: boolean
  showLabel?: boolean
  className?: string
}

export default function NetworkStatus({
  isConnected,
  showLabel = true,
  className
}: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Check if the browser is online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Animation for reconnecting state
  useEffect(() => {
    if (!isConnected && isOnline) {
      setIsReconnecting(true)
    } else {
      setIsReconnecting(false)
    }
  }, [isConnected, isOnline])

  // Update the last updated time when connection status changes
  useEffect(() => {
    setLastUpdated(new Date())
  }, [isConnected])

  const getStatusColor = () => {
    if (!isOnline) return "text-red-500"
    if (!isConnected) return "text-amber-500"
    return "text-green-500"
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />
    if (!isConnected) return <AlertCircle className="h-4 w-4" />
    return <Wifi className="h-4 w-4" />
  }

  const getStatusText = () => {
    if (!isOnline) return "Offline"
    if (!isConnected) return "Reconnecting..."
    return "Connected"
  }

  // Format last updated time as relative time (e.g., "2 minutes ago")
  const getLastUpdated = () => {
    const now = new Date()
    const diffSeconds = Math.floor(
      (now.getTime() - lastUpdated.getTime()) / 1000
    )

    if (diffSeconds < 60) return `${diffSeconds}s ago`
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
    return `${Math.floor(diffSeconds / 3600)}h ago`
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full",
        isReconnecting && "animate-pulse",
        className
      )}
    >
      <div className={cn("flex items-center", getStatusColor())}>
        {getStatusIcon()}
        {showLabel && <span className="ml-1">{getStatusText()}</span>}
      </div>
      {isConnected && (
        <span className="text-gray-400 text-[10px]">{getLastUpdated()}</span>
      )}
    </div>
  )
}
