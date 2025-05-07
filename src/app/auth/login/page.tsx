"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        // Handle error
      } else {
        router.push("/select-role")
      }
    } catch (error) {
      console.log(error)
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
        <Card className="w-full backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-heading text-center text-gray-800">
              Selamat datang kembali
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Masukkan kredensial Anda untuk masuk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Add error handling and display */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/50 border-gray-200/50 focus:bg-white/70"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Kata Sandi
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan kata sandi Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/50 border-gray-200/50 focus:bg-white/70"
                  required
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
                    Masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-600">
              Belum memiliki akun?{" "}
              <Link
                href="/auth/register"
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                Daftar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
