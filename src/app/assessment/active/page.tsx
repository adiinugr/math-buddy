"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  BookOpen,
  Loader2
} from "lucide-react"
import Link from "next/link"
import Breadcrumbs from "@/components/breadcrumbs"

interface ActiveAssessment {
  id: string
  title: string
  code: string
  teacher: string
  dueDate: string
  status: "in_progress" | "not_started" | "completed"
  progress: number
  totalQuestions: number
}

export default function ActiveAssessments() {
  const { data: session } = useSession()
  const router = useRouter()
  const [assessments, setAssessments] = useState<ActiveAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [joinLoading, setJoinLoading] = useState<string | null>(null)

  // Fetch active assessments
  useEffect(() => {
    const fetchActiveAssessments = async () => {
      if (!session) return

      try {
        setLoading(true)
        const response = await fetch("/api/quizzes/active")

        if (!response.ok) {
          throw new Error("Failed to fetch active assessments")
        }

        const data = await response.json()
        setAssessments(data.activeAssessments || [])
      } catch (err) {
        console.error("Error fetching active assessments:", err)
        setError("Failed to load active assessments. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchActiveAssessments()
  }, [session])

  useEffect(() => {
    if (!session) {
      router.push("/auth/login")
    }
  }, [session, router])

  // Function to handle joining an assessment
  const handleJoinAssessment = async (assessmentCode: string) => {
    if (!session?.user?.name) {
      // If no authenticated user, just navigate to the take page
      router.push(`/assessment/take/${assessmentCode}`)
      return
    }

    try {
      setJoinLoading(assessmentCode)

      // Join the assessment using the API
      const response = await fetch("/api/quizzes/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: assessmentCode,
          name: session.user.name
        })
      })

      if (!response.ok) {
        throw new Error("Failed to join assessment")
      }

      const data = await response.json()

      // Store participant ID for future reference
      sessionStorage.setItem("currentParticipantId", data.participantId)

      // Navigate to the take page with participant ID
      router.push(
        `/assessment/take/${assessmentCode}?participant=${data.participantId}`
      )
    } catch (error) {
      console.error("Error joining assessment:", error)
      toast.error("Failed to join assessment. Please try again.")
      // Fall back to regular navigation
      router.push(`/assessment/take/${assessmentCode}`)
    } finally {
      setJoinLoading(null)
    }
  }

  if (!session) {
    return null
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex flex-col gap-[32px] items-center w-full max-w-4xl mx-auto relative">
        <div className="w-full">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: "Dashboard", href: "/dashboard?role=student" },
                { label: "Penilaian Aktif", current: true }
              ]}
            />
          </div>
          <div className="backdrop-blur-lg bg-white/30 p-8 rounded-xl border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-blue-500/20">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 font-heading">
                Penilaian Aktif
              </h1>
            </div>
            <p className="text-gray-600 mb-6">
              Lanjutkan perjalanan belajar Anda dengan penilaian yang sedang
              berlangsung ini.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="w-full flex justify-center p-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="text-gray-600">Memuat penilaian aktif...</p>
            </div>
          </div>
        ) : error ? (
          <div className="w-full p-6 bg-red-50 rounded-lg border border-red-100">
            <p className="text-red-600 text-center">{error}</p>
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Coba Lagi
              </Button>
            </div>
          </div>
        ) : assessments.length === 0 ? (
          <div className="w-full">
            <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-heading text-center text-gray-800">
                  Tidak Ada Penilaian Aktif
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-blue-100 mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-gray-600 mb-6">
                  Anda tidak memiliki penilaian aktif saat ini. Bergabunglah
                  dengan penilaian untuk memulai.
                </p>
                <Button
                  onClick={() => router.push("/join")}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/20 group"
                >
                  Gabung Penilaian
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assessments.map((assessment) => (
              <Card
                key={assessment.id}
                className="backdrop-blur-lg bg-white/30 border-white/20 hover:shadow-lg transition-all duration-200"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-heading">
                        {assessment.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Diberikan oleh: {assessment.teacher}
                      </CardDescription>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        assessment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : assessment.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {assessment.status === "completed"
                        ? "Selesai"
                        : assessment.status === "in_progress"
                        ? "Sedang Berlangsung"
                        : "Belum Dimulai"}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          Tenggat: {formatDueDate(assessment.dueDate)}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        {assessment.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                        ) : assessment.status === "in_progress" ? (
                          <Clock className="h-4 w-4 mr-1 text-yellow-500" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1 text-blue-500" />
                        )}
                        <span>
                          {assessment.progress} / {assessment.totalQuestions}{" "}
                          pertanyaan
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className={`h-2.5 rounded-full ${
                          assessment.status === "completed"
                            ? "bg-green-500"
                            : assessment.status === "in_progress"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                        style={{
                          width: `${
                            (assessment.progress / assessment.totalQuestions) *
                            100
                          }%`
                        }}
                      ></div>
                    </div>

                    <div className="pt-2">
                      {assessment.status === "completed" ? (
                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                        >
                          <Link
                            href={`/assessment/results?participantId=${assessment.id}`}
                          >
                            Lihat Hasil
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                          onClick={() => handleJoinAssessment(assessment.code)}
                          disabled={joinLoading === assessment.code}
                        >
                          {joinLoading === assessment.code ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Menghubungkan...
                            </>
                          ) : (
                            <>
                              {assessment.status === "in_progress"
                                ? "Lanjutkan Penilaian"
                                : "Mulai Penilaian"}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="w-full flex justify-center">
          <Button
            asChild
            variant="outline"
            className="bg-white/50 border-gray-200/50"
          >
            <Link href="/dashboard?role=student">Kembali ke Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
