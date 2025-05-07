"use client"

import { useState, useEffect, useRef } from "react"
import { InlineMath } from "react-katex"
import "katex/dist/katex.min.css"

interface LatexEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function LatexEditor({
  value,
  onChange,
  placeholder,
  className = ""
}: LatexEditorProps) {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  const handleClick = () => {
    setIsFocused(true)
    // Focus the textarea immediately
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

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
    <div
      className={`relative w-full min-h-[100px] ${className} ${
        isFocused ? "ring-1 ring-blue-500" : ""
      }`}
    >
      {isFocused ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full min-h-[100px] p-2 bg-transparent border-0 resize-none text-sm outline-none"
          style={{ whiteSpace: "pre-wrap" }}
        />
      ) : (
        <div
          className="w-full min-h-[100px] p-2 bg-transparent border-0 text-left cursor-text text-sm"
          onClick={handleClick}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {value.trim() ? (
            renderTextWithLatex(value)
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
      )}
    </div>
  )
}
