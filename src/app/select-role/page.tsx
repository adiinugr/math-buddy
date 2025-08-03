"use client"

import { useRouter } from "next/navigation"
import RoleSelector from "@/components/role-selector"
import { trackUserAction } from "@/components/GoogleAnalytics"

export default function SelectRolePage() {
  const router = useRouter()

  const handleRoleSelect = (role: "student" | "teacher") => {
    trackUserAction("role_select", role)
    if (role === "teacher") {
      router.push("/dashboard")
    } else if (role === "student") {
      router.push("/join")
    }
  }

  return <RoleSelector onRoleSelect={handleRoleSelect} />
}
