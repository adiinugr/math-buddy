"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  ArrowRight,
  BookOpen,
  Brain,
  LineChart,
  Target,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Plus,
  Calendar,
  BarChart2
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuestionDifficultyCard } from "@/components/dashboard/QuestionDifficultyCard"

interface DashboardStats {
  stats: {
    totalQuizzes: number
    quizGrowth: number
    activeStudents: number
    studentGrowth: number
    averageScore: number
    scoreGrowth: number
    completionRate: number
    completionRateGrowth: number
  }
  recentQuizzes: {
    id: string
    title: string
    createdAt: string
    participants: number
    completionRate: number
  }[]
  categoryPerformance: {
    topic: string
    average: number
    trend: "improving" | "stable" | "needs work"
  }[]
}

interface DifficultQuestion {
  id: string
  text: string
  quizId: string
  quizTitle: string
  subcategory: string
  correctPercentage: number
  difficulty: "Hard" | "Medium" | "Easy"
}

interface DifficultQuestionsData {
  difficultyGroups: {
    hard: DifficultQuestion[]
    medium: DifficultQuestion[]
    easy: DifficultQuestion[]
  }
  allQuestions: DifficultQuestion[]
}

interface StudentDashboardData {
  stats: {
    totalAssessments: number
    assessmentGrowth: number
    averageScore: number
    scoreGrowth: number
    timeSpent: number
    timeGrowth: number
    completionRate: number
    completionRateGrowth: number
  }
  recentAssessments: {
    id: string
    title: string
    score: number
    completedAt: string
    totalQuestions: number
    correctAnswers: number
  }[]
  learningProgress: {
    skill: string
    progress: number
    status: "improving" | "stable" | "needs work"
    improvement: number
  }[]
  noData: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role")
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null
  )
  const [difficultQuestions, setDifficultQuestions] =
    useState<DifficultQuestionsData | null>(null)
  const [studentData, setStudentData] = useState<StudentDashboardData | null>(
    null
  )
  const [loading, setLoading] = useState(false)
  const [studentDataLoading, setStudentDataLoading] = useState(false)
  const [questionsLoading, setQuestionsLoading] = useState(false)

  const [studentDataError, setStudentDataError] = useState("")

  useEffect(() => {
    if (!role) {
      router.push("/dashboard/role")
    } else if (role === "teacher") {
      fetchDashboardStats()
      fetchDifficultQuestions()
    } else if (role === "student") {
      fetchStudentData()
    }
  }, [role, router])

  const fetchDashboardStats = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/dashboard/stats")
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard statistics")
      }
      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDifficultQuestions = async () => {
    setQuestionsLoading(true)
    try {
      const response = await fetch("/api/dashboard/difficult-questions")
      if (!response.ok) {
        throw new Error("Failed to fetch difficult questions data")
      }
      const data = await response.json()
      setDifficultQuestions(data)
    } catch (err) {
      console.error("Error fetching difficult questions:", err)
    } finally {
      setQuestionsLoading(false)
    }
  }

  const fetchStudentData = async () => {
    setStudentDataLoading(true)
    try {
      const response = await fetch("/api/dashboard/student-stats")
      if (!response.ok) {
        throw new Error("Failed to fetch student dashboard data")
      }
      const data = await response.json()
      setStudentData(data)

      // If user has no data, show a message
      if (data.noData) {
        setStudentDataError(
          "You haven&apos;t taken any assessments yet. Join an assessment to see your stats!"
        )
      }
    } catch (err) {
      console.error("Error fetching student data:", err)
      setStudentDataError("Failed to load student dashboard data")
    } finally {
      setStudentDataLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  if (!role) {
    return null
  }

  if (role === "teacher") {
    return (
      <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto">
          <div className="w-full backdrop-blur-lg bg-white/30 p-8 rounded-xl border border-white/20 shadow-lg mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 font-heading">
              Dashboard Guru
            </h1>
            <p className="text-gray-600 mb-8">
              Kelola kuis, lihat statistik, dan analisis performa siswa Anda.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <Link href="/quizzes/new" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Buat Kuis Baru
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white/50 border-gray-200/50"
              >
                <Link href="/quizzes" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Lihat Semua Kuis
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/30 border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Kuis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">
                      {loading ? (
                        <span className="inline-block w-12 h-8 bg-gray-100 animate-pulse rounded"></span>
                      ) : (
                        dashboardData?.stats.totalQuizzes || 0
                      )}
                    </div>
                    <div className="p-2 rounded-full bg-blue-500/10">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                  {!loading && dashboardData && (
                    <p
                      className={`text-xs font-medium mt-2 ${
                        dashboardData.stats.quizGrowth >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {dashboardData.stats.quizGrowth >= 0 ? "+" : ""}
                      {dashboardData.stats.quizGrowth}% dibanding bulan lalu
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/30 border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Siswa Aktif
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">
                      {loading ? (
                        <span className="inline-block w-12 h-8 bg-gray-100 animate-pulse rounded"></span>
                      ) : (
                        dashboardData?.stats.activeStudents || 0
                      )}
                    </div>
                    <div className="p-2 rounded-full bg-green-500/10">
                      <GraduationCap className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  {!loading && dashboardData && (
                    <p
                      className={`text-xs font-medium mt-2 ${
                        dashboardData.stats.studentGrowth >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {dashboardData.stats.studentGrowth >= 0 ? "+" : ""}
                      {dashboardData.stats.studentGrowth}% dibanding bulan lalu
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/30 border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Skor Rata-rata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">
                      {loading ? (
                        <span className="inline-block w-12 h-8 bg-gray-100 animate-pulse rounded"></span>
                      ) : (
                        dashboardData?.stats.averageScore || 0
                      )}
                    </div>
                    <div className="p-2 rounded-full bg-purple-500/10">
                      <Trophy className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                  {!loading && dashboardData && (
                    <p
                      className={`text-xs font-medium mt-2 ${
                        dashboardData.stats.scoreGrowth >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {dashboardData.stats.scoreGrowth >= 0 ? "+" : ""}
                      {dashboardData.stats.scoreGrowth}% dibanding bulan lalu
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/30 border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Tingkat Penyelesaian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">
                      {loading ? (
                        <span className="inline-block w-12 h-8 bg-gray-100 animate-pulse rounded"></span>
                      ) : (
                        dashboardData?.stats.completionRate || 0
                      )}
                    </div>
                    <div className="p-2 rounded-full bg-amber-500/10">
                      <CheckCircle2 className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                  {!loading && dashboardData && (
                    <p
                      className={`text-xs font-medium mt-2 ${
                        dashboardData.stats.completionRateGrowth >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {dashboardData.stats.completionRateGrowth >= 0 ? "+" : ""}
                      {dashboardData.stats.completionRateGrowth}% dibanding
                      bulan lalu
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
            <div className="lg:col-span-2">
              <Card className="bg-white/30 border-white/20 h-full">
                <CardHeader>
                  <CardTitle>Performa per Kategori</CardTitle>
                  <CardDescription>
                    Skor rata-rata siswa berdasarkan kategori soal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <div className="w-1/4 h-5 bg-gray-100 animate-pulse rounded"></div>
                          <div className="w-2/3 h-4 bg-gray-100 animate-pulse rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : dashboardData?.categoryPerformance.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="p-3 bg-blue-50 rounded-full mb-4">
                        <LineChart className="h-6 w-6 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-1">
                        Belum Ada Data Performa
                      </h3>
                      <p className="text-sm text-gray-500 text-center max-w-md">
                        Mulai membuat kuis dan minta siswa untuk
                        menyelesaikannya untuk melihat analisis performa per
                        kategori.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dashboardData?.categoryPerformance.map((category, i) => (
                        <div key={i}>
                          <div className="flex justify-between mb-1">
                            <div className="font-medium text-sm capitalize">
                              {category.topic}
                            </div>
                            <div className="text-sm text-gray-500">
                              {category.average}%
                            </div>
                          </div>
                          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                category.trend === "improving"
                                  ? "bg-green-500"
                                  : category.trend === "needs work"
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                              }`}
                              style={{ width: `${category.average}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-end mt-1">
                            <span
                              className={`text-xs font-medium ${
                                category.trend === "improving"
                                  ? "text-green-600"
                                  : category.trend === "needs work"
                                  ? "text-red-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {category.trend === "improving"
                                ? "Membaik"
                                : category.trend === "needs work"
                                ? "Perlu perbaikan"
                                : "Stabil"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/30 border-white/20">
              <CardHeader>
                <CardTitle>Kuis Terbaru</CardTitle>
                <CardDescription>
                  Kuis yang baru dibuat dalam 30 hari terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="w-3/4 h-5 bg-gray-100 animate-pulse rounded"></div>
                        <div className="w-2/4 h-4 bg-gray-100 animate-pulse rounded"></div>
                        <div className="w-full h-px bg-gray-100 mt-4"></div>
                      </div>
                    ))}
                  </div>
                ) : dashboardData?.recentQuizzes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="p-3 bg-blue-50 rounded-full mb-4">
                      <BookOpen className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">
                      Belum Ada Kuis
                    </h3>
                    <p className="text-sm text-gray-500 text-center max-w-md mb-4">
                      Anda belum membuat kuis apa pun dalam 30 hari terakhir.
                    </p>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    >
                      <Link
                        href="/quizzes/new"
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Buat Kuis
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData?.recentQuizzes.map((quiz, i) => (
                      <div key={i} className="border-b border-gray-100 pb-4">
                        <div className="font-medium mb-1">{quiz.title}</div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(quiz.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-3.5 w-3.5" />
                              <span>{quiz.participants}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{quiz.completionRate}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 bg-white/50"
                          >
                            <Link
                              href={`/quizzes/${quiz.id}/results`}
                              className="flex items-center gap-1"
                            >
                              <BarChart2 className="h-3 w-3" />
                              Lihat Hasil
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      asChild
                      variant="ghost"
                      className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Link
                        href="/quizzes"
                        className="flex items-center justify-center gap-1"
                      >
                        Lihat Semua Kuis
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="w-full mt-8">
            <Tabs defaultValue="hard" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 font-heading">
                  Pertanyaan yang Sering Salah
                </h2>
                <TabsList className="bg-white/50 border border-white/20">
                  <TabsTrigger value="hard">Sulit</TabsTrigger>
                  <TabsTrigger value="medium">Sedang</TabsTrigger>
                  <TabsTrigger value="easy">Mudah</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="hard">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questionsLoading ? (
                    <>
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="bg-white/30 border border-white/20 rounded-xl p-4 animate-pulse"
                        >
                          <div className="h-4 bg-gray-100 rounded w-1/3 mb-3"></div>
                          <div className="h-6 bg-gray-100 rounded w-5/6 mb-4"></div>
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/6"></div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : difficultQuestions?.difficultyGroups.hard.length === 0 ? (
                    <div className="col-span-2">
                      <Card className="bg-white/30 border-white/20">
                        <CardContent className="flex flex-col items-center justify-center py-8">
                          <div className="p-3 bg-blue-50 rounded-full mb-4">
                            <Target className="h-6 w-6 text-blue-500" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-800 mb-1">
                            Tidak Ada Pertanyaan Sulit
                          </h3>
                          <p className="text-sm text-gray-500 text-center max-w-md">
                            Saat ini tidak ada pertanyaan sulit yang
                            teridentifikasi. Saat siswa menjawab lebih banyak
                            pertanyaan, Anda akan melihat pertanyaan yang paling
                            sulit di sini.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <>
                      {difficultQuestions?.difficultyGroups.hard
                        .slice(0, 4)
                        .map((question, i) => (
                          <QuestionDifficultyCard
                            key={i}
                            question={question}
                            onClick={() =>
                              router.push(
                                `/quizzes/${question.quizId}/edit?highlight=${question.id}`
                              )
                            }
                          />
                        ))}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="medium">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questionsLoading ? (
                    <>
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="bg-white/30 border border-white/20 rounded-xl p-4 animate-pulse"
                        >
                          <div className="h-4 bg-gray-100 rounded w-1/3 mb-3"></div>
                          <div className="h-6 bg-gray-100 rounded w-5/6 mb-4"></div>
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/6"></div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : difficultQuestions?.difficultyGroups.medium.length ===
                    0 ? (
                    <div className="col-span-2">
                      <Card className="bg-white/30 border-white/20">
                        <CardContent className="flex flex-col items-center justify-center py-8">
                          <div className="p-3 bg-blue-50 rounded-full mb-4">
                            <Target className="h-6 w-6 text-blue-500" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-800 mb-1">
                            Tidak Ada Pertanyaan Kesulitan Sedang
                          </h3>
                          <p className="text-sm text-gray-500 text-center max-w-md">
                            Saat ini tidak ada pertanyaan kesulitan sedang yang
                            teridentifikasi.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <>
                      {difficultQuestions?.difficultyGroups.medium
                        .slice(0, 4)
                        .map((question, i) => (
                          <QuestionDifficultyCard
                            key={i}
                            question={question}
                            onClick={() =>
                              router.push(
                                `/quizzes/${question.quizId}/edit?highlight=${question.id}`
                              )
                            }
                          />
                        ))}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="easy">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questionsLoading ? (
                    <>
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="bg-white/30 border border-white/20 rounded-xl p-4 animate-pulse"
                        >
                          <div className="h-4 bg-gray-100 rounded w-1/3 mb-3"></div>
                          <div className="h-6 bg-gray-100 rounded w-5/6 mb-4"></div>
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/6"></div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : difficultQuestions?.difficultyGroups.easy.length === 0 ? (
                    <div className="col-span-2">
                      <Card className="bg-white/30 border-white/20">
                        <CardContent className="flex flex-col items-center justify-center py-8">
                          <div className="p-3 bg-blue-50 rounded-full mb-4">
                            <Target className="h-6 w-6 text-blue-500" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-800 mb-1">
                            Tidak Ada Pertanyaan Mudah
                          </h3>
                          <p className="text-sm text-gray-500 text-center max-w-md">
                            Saat ini tidak ada pertanyaan mudah yang
                            teridentifikasi.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <>
                      {difficultQuestions?.difficultyGroups.easy
                        .slice(0, 4)
                        .map((question, i) => (
                          <QuestionDifficultyCard
                            key={i}
                            question={question}
                            onClick={() =>
                              router.push(
                                `/quizzes/${question.quizId}/edit?highlight=${question.id}`
                              )
                            }
                          />
                        ))}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    )
  }

  // Student Dashboard
  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex flex-col items-center w-full max-w-7xl mx-auto">
        <div className="w-full backdrop-blur-lg bg-white/30 p-8 rounded-xl border border-white/20 shadow-lg mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 font-heading">
            Dashboard Siswa
          </h1>
          <p className="text-gray-600 mb-8">
            Lacak kemajuan belajar dan riwayat penilaian Anda
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              asChild
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Link href="/join" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Gabung Penilaian
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-white/50 border-gray-200/50"
            >
              <Link
                href="/assessment/active"
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Lihat Semua Penilaian
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Assessments
                </CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                {studentDataLoading ? (
                  <>
                    <div className="h-6 w-16 bg-gray-300 animate-pulse rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
                  </>
                ) : studentDataError ? (
                  <p className="text-sm text-red-500">Error loading data</p>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-800">
                      {studentData?.stats.totalAssessments || 0}
                    </div>
                    <p className="text-xs text-gray-500">
                      {studentData?.stats.assessmentGrowth
                        ? `+${studentData.stats.assessmentGrowth} from last month`
                        : "No change from last month"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Average Score
                </CardTitle>
                <LineChart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                {studentDataLoading ? (
                  <>
                    <div className="h-6 w-16 bg-gray-300 animate-pulse rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
                  </>
                ) : studentDataError ? (
                  <p className="text-sm text-red-500">Error loading data</p>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-800">
                      {studentData?.stats.averageScore || 0}%
                    </div>
                    <p className="text-xs text-gray-500">
                      {studentData?.stats.scoreGrowth
                        ? `+${studentData.stats.scoreGrowth}% from last month`
                        : "No change from last month"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Time Spent
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                {studentDataLoading ? (
                  <>
                    <div className="h-6 w-16 bg-gray-300 animate-pulse rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
                  </>
                ) : studentDataError ? (
                  <p className="text-sm text-red-500">Error loading data</p>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-800">
                      {studentData?.stats.timeSpent.toFixed(1) || 0}h
                    </div>
                    <p className="text-xs text-gray-500">
                      {studentData?.stats.timeGrowth
                        ? `+${studentData.stats.timeGrowth.toFixed(
                            1
                          )}h from last month`
                        : "No change from last month"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completion Rate
                </CardTitle>
                <Trophy className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                {studentDataLoading ? (
                  <>
                    <div className="h-6 w-16 bg-gray-300 animate-pulse rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
                  </>
                ) : studentDataError ? (
                  <p className="text-sm text-red-500">Error loading data</p>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-800">
                      {studentData?.stats.completionRate || 0}%
                    </div>
                    <p className="text-xs text-gray-500">
                      {studentData?.stats.completionRateGrowth
                        ? `+${studentData.stats.completionRateGrowth}% from last month`
                        : "No change from last month"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-gray-800">
                Recent Assessments
              </CardTitle>
              <CardDescription>Your latest learning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentDataLoading ? (
                  [1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/50 border border-white/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-gray-200 animate-pulse h-9 w-9"></div>
                        <div>
                          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-2"></div>
                          <div className="h-3 w-24 bg-gray-100 animate-pulse rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-2 w-20 bg-gray-100 animate-pulse rounded-full"></div>
                      </div>
                    </div>
                  ))
                ) : studentDataError ? (
                  <div className="text-center py-4 text-red-500">
                    {studentDataError}
                    <Button
                      onClick={fetchStudentData}
                      className="mt-2 bg-red-500 hover:bg-red-600 text-white"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : studentData?.recentAssessments?.length ? (
                  studentData.recentAssessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/50 border border-white/20 hover:bg-white/70 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-blue-500/20">
                          <Brain className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {assessment.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Completed {formatDate(assessment.completedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">
                          {assessment.score}%
                        </span>
                        <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${assessment.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No assessments completed yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-gray-800">
                Learning Progress
              </CardTitle>
              <CardDescription>
                Your skill development over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentDataLoading ? (
                  [1, 2, 3].map((item) => (
                    <div key={item} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 w-8 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-300 animate-pulse rounded-full"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 bg-gray-200 animate-pulse rounded-full"></div>
                        <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))
                ) : studentDataError ? (
                  <div className="text-center py-4 text-red-500">
                    {studentDataError}
                    <Button
                      onClick={fetchStudentData}
                      className="mt-2 bg-red-500 hover:bg-red-600 text-white"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : studentData?.learningProgress?.length ? (
                  studentData.learningProgress.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">
                          {item.skill}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.status === "improving"
                              ? "bg-green-500"
                              : item.status === "stable"
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {item.status === "improving" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span className="text-green-600">
                              Improving ({item.improvement > 0 ? "+" : ""}
                              {item.improvement}%)
                            </span>
                          </>
                        ) : item.status === "stable" ? (
                          <>
                            <Clock className="h-3 w-3 text-blue-500" />
                            <span className="text-blue-600">
                              Stable ({item.improvement > 0 ? "+" : ""}
                              {item.improvement}%)
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-yellow-500" />
                            <span className="text-yellow-600">
                              Needs Work ({item.improvement}%)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No learning progress data available yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full">
          <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-gray-800">
                Get Started
              </CardTitle>
              <CardDescription>
                Take your first assessment to see detailed statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  Complete assessments to see your learning progress and track
                  improvements over time.
                </p>
                <Button
                  onClick={() => router.push("/join")}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  Find an Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
