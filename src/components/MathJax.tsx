"use client"

import "katex/dist/katex.min.css"
import Latex from "react-latex-next"
import { cn } from "@/lib/utils"

interface MathJaxProps {
  math: string
  block?: boolean
  className?: string
}

export function MathJax({ math, block = false, className }: MathJaxProps) {
  // Jika persamaan adalah block (standalone), bungkus dalam $$
  // Jika inline, bungkus dalam $
  const formattedMath = block ? `$$${math}$$` : `$${math}$`

  return (
    <span className={cn("math-display", className)}>
      <Latex>{formattedMath}</Latex>
    </span>
  )
}

export default MathJax
