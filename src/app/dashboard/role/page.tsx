"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import RoleSelector from "@/components/role-selector"

export default function RoleSelectionPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleRoleSelect = (role: "student" | "teacher") => {
    // Store the selected role in localStorage
    localStorage.setItem("userRole", role)
    // Redirect to the appropriate dashboard
    router.push(`/dashboard?role=${role}`)
  }

  const welcomeMessage = `Selamat datang, ${session?.user?.name || "Pengguna"}!`

  return (
    <RoleSelector
      onRoleSelect={handleRoleSelect}
      welcomeMessage={welcomeMessage}
    />
  )
}
