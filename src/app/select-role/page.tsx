"use client"

import { useRouter } from "next/navigation"
import RoleSelector from "@/components/role-selector"

export default function SelectRolePage() {
  const router = useRouter()

  const handleRoleSelect = (role: "student" | "teacher") => {
    if (role === "teacher") {
      router.push("/dashboard")
    } else if (role === "student") {
      router.push("/join")
    }
  }

  return <RoleSelector onRoleSelect={handleRoleSelect} />
}
