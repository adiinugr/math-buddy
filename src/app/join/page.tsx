"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import { disconnectSocket } from "@/lib/socket"
import { ArrowRight, Key, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Breadcrumbs from "@/components/breadcrumbs"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"

const joinFormSchema = z.object({
  code: z
    .string()
    .min(1, { message: "Room code is required" })
    .max(10, { message: "Room code cannot exceed 10 characters" }),
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name cannot exceed 50 characters" })
})

type JoinFormValues = z.infer<typeof joinFormSchema>

export default function JoinPage() {
  const [code] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { status } = useSession()

  const form = useForm<JoinFormValues>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      code: "",
      name: ""
    }
  })

  // Cleanup sockets when component unmounts
  useEffect(() => {
    return () => {
      console.log("Join page unmounting - cleaning up sockets")
      disconnectSocket()
    }
  }, [])

  // Check if there's a saved name when page loads
  useEffect(() => {
    const savedName = localStorage.getItem("studentName")
    if (savedName) {
      setName(savedName)
      form.setValue("name", savedName)
    }
  }, [form])

  const handleJoin = async (values: JoinFormValues) => {
    const formCode = values.code || code
    const formName = values.name || name

    if (!formCode) {
      setError("Please enter a code")
      return
    }

    if (!formName) {
      setError("Please enter your name")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Assessment flow
      const cleanName = formName.trim()
      const assessmentCode = formCode.toUpperCase()

      console.log("Assessment join - saving name to localStorage:", cleanName)
      localStorage.setItem("studentName", cleanName)

      // First, verify the assessment exists
      const verifyResponse = await fetch(
        `/api/quizzes/verify-room?code=${assessmentCode}`
      )

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json()
        throw new Error(errorData.error || "Kode penilaian tidak valid")
      }

      console.log("Assessment verified, joining with code:", assessmentCode)

      // Join the assessment
      const joinResponse = await fetch("/api/quizzes/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code: assessmentCode, name: cleanName })
      })

      if (!joinResponse.ok) {
        const errorData = await joinResponse.json()
        throw new Error(errorData.error || "Gagal bergabung dengan penilaian")
      }

      const joinData = await joinResponse.json()
      console.log(
        "Successfully joined, got participantId:",
        joinData.participantId
      )

      // Store participant ID in sessionStorage for the assessment page
      sessionStorage.setItem("currentParticipantId", joinData.participantId)
      console.log("Stored participantId in sessionStorage, redirecting")

      toast.success("Berhasil bergabung dengan penilaian!")

      // Redirect directly to the take page with participant ID
      router.push(
        `/assessment/take/${assessmentCode}?participant=${joinData.participantId}`
      )
    } catch (error) {
      console.error("Error joining:", error)
      setError(error instanceof Error ? error.message : "Failed to join")
      setLoading(false)
      toast.error(
        `Failed to join: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      )
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="flex flex-col gap-8 items-center justify-center w-full h-full max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute top-1 left-1 w-14 h-14 border-4 border-t-transparent border-r-blue-300 border-b-transparent border-l-purple-300 rounded-full animate-spin animate-reverse"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mt-6">
              Memuat...
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Harap tunggu sementara kami menyiapkan sesi Anda
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex flex-col gap-8 items-center w-full max-w-2xl mx-auto relative">
        <div className="w-full">
          <Breadcrumbs items={[{ label: "Gabung", current: true }]} />
        </div>

        <div className="w-full backdrop-blur-lg bg-white/30 p-6 rounded-xl border border-white/20 shadow-lg">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-2 rounded-full bg-blue-500/20 mb-3">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3 font-heading">
              Gabung Penilaian
            </h2>
            <p className="text-gray-700 text-base">
              Masukkan kode penilaian untuk memulai evaluasi Anda
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleJoin)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Penilaian</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan kode penilaian"
                            autoComplete="off"
                            {...field}
                            value={field.value.toUpperCase()}
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase())
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Anda</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan nama Anda"
                            autoComplete="name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Bergabung...
                      </>
                    ) : (
                      <>
                        Gabung Penilaian
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
