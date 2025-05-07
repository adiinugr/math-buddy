import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication pages"
}

export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
