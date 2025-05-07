"use client"

import { Input } from "@/components/ui/input"
import { InlineMath } from "react-katex"
import { useState } from "react"

interface LatexInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string
  onChange: (value: string) => void
}

export function LatexInput({ value, onChange, ...props }: LatexInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const renderTextWithLatex = (text: string) => {
    const parts = text.split(/(\$[^$]+\$)/g)
    return parts.map((part, index) => {
      if (part.startsWith("$") && part.endsWith("$")) {
        try {
          return <InlineMath key={index} math={part.slice(1, -1)} />
        } catch {
          return (
            <span key={index} className="text-red-500">
              {part}
            </span>
          )
        }
      }
      return <span key={index}>{part}</span>
    })
  }

  return (
    <div className="relative w-full">
      <Input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="relative z-10 bg-transparent border-0 focus:ring-0"
      />
      {isFocused && (
        <div className="absolute inset-0 pointer-events-none flex items-center px-3 z-0">
          {renderTextWithLatex(value)}
        </div>
      )}
    </div>
  )
}
