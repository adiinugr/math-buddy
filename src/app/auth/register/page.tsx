"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setPasswordError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const name = formData.get("name") as string

    if (password !== confirmPassword) {
      setPasswordError("Kata sandi tidak cocok")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan")
      }

      router.push("/auth/login")
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Terjadi kesalahan")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <Card className="w-full max-w-md mx-4 backdrop-blur-lg bg-white/30 border border-white/20 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-800">
            Buat akun Anda
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Masukkan detail Anda untuk membuat akun baru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || passwordError) && (
              <Alert
                variant="destructive"
                className="bg-red-500/10 border-red-500/20"
              >
                <AlertDescription className="text-red-600">
                  {error || passwordError}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Nama
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Masukkan nama Anda"
                required
                className="h-10 bg-white/50 border-gray-200/50 focus:border-gray-300/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Masukkan email Anda"
                required
                className="h-10 bg-white/50 border-gray-200/50 focus:border-gray-300/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Kata Sandi
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Masukkan kata sandi Anda"
                required
                className="h-10 bg-white/50 border-gray-200/50 focus:border-gray-300/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Konfirmasi Kata Sandi
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Konfirmasi kata sandi Anda"
                required
                className="h-10 bg-white/50 border-gray-200/50 focus:border-gray-300/50"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat akun...
                </>
              ) : (
                "Buat akun"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            Sudah memiliki akun?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Masuk
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
