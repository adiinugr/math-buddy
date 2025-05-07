"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
}

export default function Breadcrumbs({
  items,
  className,
  showHome = true
}: BreadcrumbsProps) {
  return (
    <nav className={cn("flex", className)} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {showHome && (
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
            >
              <Home className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </li>
        )}

        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {item.href && !item.current ? (
              <Link
                href={item.href}
                className="ml-1 md:ml-2 text-sm text-gray-600 hover:text-blue-600"
              >
                {item.label}
              </Link>
            ) : (
              <span className="ml-1 md:ml-2 text-sm font-medium text-gray-800">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
