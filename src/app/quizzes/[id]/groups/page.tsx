"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  ArrowLeft,
  Users,
  UserPlus,
  Download,
  RefreshCw,
  MinusCircle,
  PlusCircle,
  AlertTriangle
} from "lucide-react"
import { toast } from "sonner"

interface Quiz {
  id: string
  title: string
  description: string | null
}

interface Participant {
  id: string
  name: string
  score: number
  totalQuestions?: number
  createdAt: string
  quizId: string
  categories?: {
    [key: string]: {
      correct: number
      total: number
      subcategories: {
        [key: string]: {
          correct: number
          total: number
        }
      }
    }
  }
}

export default function StudentGroupsPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [groups, setGroups] = useState<Participant[][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [groupSize, setGroupSize] = useState(4)
  const [category, setCategory] = useState("overall")
  const [refreshing, setRefreshing] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  const fetchQuiz = useCallback(async () => {
    try {
      const response = await fetch(`/api/quizzes/${params.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch quiz")
      }
      const data = await response.json()
      setQuiz(data)
    } catch {
      setError("Failed to load quiz")
    }
  }, [params.id])

  const generateGroups = useCallback(async () => {
    setRefreshing(true)
    try {
      const response = await fetch(
        `/api/quizzes/${params.id}/groups?groupSize=${groupSize}&category=${category}`
      )
      if (!response.ok) {
        throw new Error("Failed to generate groups")
      }
      const data = await response.json()
      setGroups(data.groups)

      // Set error message if provided by the API
      if (data.error) {
        setError(data.error)
      } else {
        setError("")
      }

      // Extract available categories from the first participant
      if (data.groups.length > 0 && data.groups[0].length > 0) {
        const firstParticipant = data.groups[0][0]
        if (firstParticipant.categories) {
          setAvailableCategories([
            "overall",
            ...Object.keys(firstParticipant.categories)
          ])
        }
      }
    } catch (error) {
      toast.error("Gagal menghasilkan grup siswa")
      setError("Failed to generate student groups")
      console.error("Error generating groups:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [params.id, groupSize, category])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    fetchQuiz()
    generateGroups()
  }, [status, router, fetchQuiz, generateGroups])

  const decreaseGroupSize = () => {
    if (groupSize > 2) {
      setGroupSize(groupSize - 1)
    }
  }

  const increaseGroupSize = () => {
    if (groupSize < 8) {
      setGroupSize(groupSize + 1)
    }
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
  }

  const handleRegenerateGroups = () => {
    generateGroups()
  }

  const downloadGroupsCSV = () => {
    if (!groups.length) return

    // Create CSV header
    let csvContent = "Group,Student Name,Score\n"

    // Add each student to the CSV
    groups.forEach((group, groupIndex) => {
      group.forEach((student) => {
        csvContent += `${groupIndex + 1},"${student.name}",${student.score}\n`
      })
    })

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `${quiz?.title || "Quiz"} - Student Groups.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const calculatePercentage = (correct: number, total: number) => {
    return total > 0 ? Math.round((correct / total) * 100) : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || "Quiz not found"}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex flex-col gap-8 items-center w-full max-w-6xl mx-auto">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex items-center gap-1 border-gray-300 bg-white/50 hover:bg-white"
              >
                <Link href={`/quizzes/${params.id}/results`}>
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Results</span>
                </Link>
              </Button>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 font-heading text-center sm:text-left">
              Student Groups - {quiz.title}
            </h2>
            <p className="text-gray-600 mt-1 text-center sm:text-left">
              Generate heterogeneous student groups based on assessment results
            </p>
          </div>
        </div>

        {error && (
          <div className="w-full text-center text-red-500">{error}</div>
        )}

        <Card className="w-full backdrop-blur-lg bg-white/30 border-white/20 shadow-lg p-6">
          <CardHeader className="px-0">
            <CardTitle>Grouping Options</CardTitle>
            <CardDescription>
              Configure how you want to group your students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-0">
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Group Size
                </label>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={decreaseGroupSize}
                    disabled={groupSize <= 2}
                    className="h-10 px-3 rounded-r-none"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center justify-center h-10 px-4 bg-white border border-gray-200 border-x-0">
                    {groupSize} students per group
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={increaseGroupSize}
                    disabled={groupSize >= 8}
                    className="h-10 px-3 rounded-l-none"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group by Category
                </label>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={downloadGroupsCSV}
                disabled={groups.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                onClick={handleRegenerateGroups}
                disabled={refreshing}
                className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2"
              >
                {refreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Generate Groups
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.length > 0 ? (
            groups.map((group, groupIndex) => (
              <Card
                key={groupIndex}
                className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Grup {groupIndex + 1}
                    </span>
                    <span className="text-sm font-normal text-gray-500">
                      {group.length} siswa
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {group.map((student) => {
                      // Calculate the score percentage
                      const scorePercentage = student.totalQuestions
                        ? Math.round(
                            (student.score / student.totalQuestions) * 100
                          )
                        : 0

                      // Calculate the category percentage if applicable
                      let categoryPercentage = 0
                      if (
                        category !== "overall" &&
                        student.categories &&
                        student.categories[category]
                      ) {
                        const categoryData = student.categories[category]
                        categoryPercentage = calculatePercentage(
                          categoryData.correct,
                          categoryData.total
                        )
                      }

                      return (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-3 rounded-md bg-white/50 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">
                                {student.name}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  Skor: {student.score}/{student.totalQuestions}{" "}
                                  ({scorePercentage}%)
                                </span>
                                {category !== "overall" && (
                                  <span className="text-xs text-blue-600">
                                    {category}: {categoryPercentage}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-3 text-center p-8 bg-white/30 rounded-lg border border-white/20">
              <div className="flex flex-col items-center justify-center gap-4">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
                <h3 className="text-lg font-medium text-gray-700">
                  Kesalahan Menghasilkan Grup
                </h3>
                <p className="text-gray-500 max-w-md">
                  {error}. Pastikan ada siswa yang telah menyelesaikan penilaian
                  ini.
                </p>
              </div>
            </div>
          ) : (
            <div className="col-span-3 text-center p-8 bg-white/30 rounded-lg border border-white/20">
              <div className="flex flex-col items-center justify-center gap-4">
                <UserPlus className="h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-700">
                  Belum Ada Grup yang Dihasilkan
                </h3>
                <p className="text-gray-500 max-w-md">
                  Konfigurasi opsi pengelompokan dan klik tombol Hasilkan Grup
                  untuk membuat grup siswa berdasarkan hasil penilaian.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
