"use client"

import React, { useState, useCallback, createContext, useContext } from "react"

interface Toast {
  id: string
  title: string
  description: string
  variant?: "default" | "destructive"
}

interface ToastContextType {
  toast: (props: Omit<Toast, "id">) => void
  toasts: Toast[]
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast = {
        id,
        title,
        description,
        variant
      }
      setToasts((prev) => [...prev, newToast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5000)
    },
    []
  )

  return (
    <ToastContext.Provider value={{ toast, toasts }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-0 right-0 z-50 p-4 md:max-w-[420px] space-y-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-md shadow-md border ${
              t.variant === "destructive"
                ? "bg-red-100 border-red-200 text-red-800"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{t.title}</h3>
              <button
                onClick={() =>
                  setToasts((prev) => prev.filter((toast) => toast.id !== t.id))
                }
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <p className="text-sm mt-1">{t.description}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
