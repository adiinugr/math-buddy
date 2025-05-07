"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  ArrowLeft,
  User,
  Calendar,
  BookText,
  Award,
  AlertTriangle
} from "lucide-react"
import { toast } from "sonner"
import "katex/dist/katex.min.css"
import Latex from "react-latex-next"
import { AIInsightsCard } from "@/components/AIInsightsCard"

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  category: string
  subcategory?: string
}

interface DetailedResult {
  id: string
  name: string
  userId: string | null
  quizId: string
  score: number
  totalQuestions: number
  createdAt: string
  questions: Question[]
  answers: Record<string, number>
  categories: {
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
  studentName?: string
}

interface Quiz {
  id: string
  title: string
  description: string | null
}

interface LearningResource {
  title: string
  url: string
  description: string
}

// Component to display student-style learning resources
function StudentStyleLearningPath({
  result,
  resourcesFunction
}: {
  result: DetailedResult
  resourcesFunction: (subcategory: string) => LearningResource[]
}) {
  // Helper to calculate percentage
  const calculatePercentage = (correct: number, total: number) => {
    return total > 0 ? Math.round((correct / total) * 100) : 0
  }

  // Get topic performance data
  const categoryPerformance = Object.entries(result.categories)
    .filter(([, stats]) => stats.total > 0)
    .map(([category, stats]) => ({
      category,
      correct: stats.correct,
      total: stats.total,
      percentage: calculatePercentage(stats.correct, stats.total)
    }))
    .sort((a, b) => a.percentage - b.percentage) // Sort by performance (lowest first)

  // Get subcategory performance data
  const subcategoryPerformance: {
    category: string
    subcategory: string
    correct: number
    total: number
    percentage: number
  }[] = []

  // Extract all subcategories with their metrics
  Object.entries(result.categories).forEach(([category, categoryData]) => {
    Object.entries(categoryData.subcategories).forEach(
      ([subcategory, data]) => {
        if (data.total > 0) {
          subcategoryPerformance.push({
            category,
            subcategory,
            correct: data.correct,
            total: data.total,
            percentage: calculatePercentage(data.correct, data.total)
          })
        }
      }
    )
  })

  // Sort by performance (lowest first)
  subcategoryPerformance.sort((a, b) => a.percentage - b.percentage)

  // Get topics to recommend (lowest performance first)
  const topicsToRecommend = [
    ...subcategoryPerformance.slice(0, 2), // Top 2 weakest subcategories
    ...categoryPerformance.slice(0, 1).map((cat) => ({
      ...cat,
      subcategory: undefined // Add undefined subcategory to match type
    }))
  ]
    .filter(
      (topic, index, self) =>
        // Remove duplicates (when category and subcategory are related)
        index ===
        self.findIndex(
          (t) =>
            (topic.subcategory && t.subcategory === topic.subcategory) ||
            (!topic.subcategory && t.category === topic.category)
        )
    )
    .slice(0, 3) // Limit to 3 recommendations

  return (
    <Card className="mb-6 bg-white/90 border-white/20 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          Learning Path Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topicsToRecommend.length > 0 ? (
          <div className="space-y-6">
            {topicsToRecommend.map((topic, index) => {
              const topicName = topic.subcategory || topic.category
              const resources = resourcesFunction(topicName)

              return (
                <div
                  key={index}
                  className="bg-indigo-50/50 rounded-lg border border-indigo-100 overflow-hidden"
                >
                  <div className="bg-indigo-100/80 px-4 py-3">
                    <h3 className="font-medium text-indigo-900 capitalize flex items-center justify-between">
                      {topic.subcategory
                        ? `${topic.category}: ${topic.subcategory}`
                        : topic.category}
                      <span className="text-sm px-2 py-1 bg-white rounded-full">
                        {topic.percentage}% mastery
                      </span>
                    </h3>
                  </div>

                  <div className="p-4 space-y-3">
                    {resources.map((resource, i) => (
                      <a
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white p-3 rounded-md border border-indigo-50 hover:border-indigo-200 transition-all"
                      >
                        <h4 className="text-indigo-700 font-medium mb-1 hover:underline">
                          {resource.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {resource.description}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 px-4">
            <p className="text-gray-500 mb-2">
              {calculatePercentage(result.score, result.totalQuestions) === 100
                ? "Great job! You've mastered all the content in this assessment."
                : "No specific recommendations available."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Reuse the learning resources function from assessment results
const getLearningResources = (subcategory: string): LearningResource[] => {
  const resources: Record<string, LearningResource[]> = {
    equations: [
      {
        title: "Ruang Guru - Persamaan Linear",
        url: "https://www.ruangguru.com/blog/matematika-kelas-10-persamaan-linear",
        description:
          "Pembahasan lengkap persamaan linear satu variabel dan dua variabel."
      },
      {
        title: "Zenius - Persamaan Linear",
        url: "https://www.zenius.net/blog/persamaan-linear",
        description: "Video pembelajaran dan latihan soal persamaan linear."
      },
      {
        title: "Khan Academy - Linear Equations",
        url: "https://www.khanacademy.org/math/algebra/linear-equations",
        description:
          "Learn about linear equations, their graphs, and how to solve them."
      },
      {
        title: "Math is Fun - Equations",
        url: "https://www.mathsisfun.com/algebra/equations.html",
        description:
          "Basic introduction to equations with examples and practice problems."
      }
    ],
    inequalities: [
      {
        title: "Ruang Guru - Pertidaksamaan Linear",
        url: "https://www.ruangguru.com/blog/matematika-kelas-10-pertidaksamaan-linear",
        description:
          "Materi lengkap pertidaksamaan linear satu variabel dan dua variabel."
      },
      {
        title: "Zenius - Pertidaksamaan",
        url: "https://www.zenius.net/blog/pertidaksamaan",
        description: "Video pembelajaran pertidaksamaan dengan contoh soal."
      },
      {
        title: "Khan Academy - Inequalities",
        url: "https://www.khanacademy.org/math/algebra/linear-inequalities",
        description: "Learn how to solve and graph linear inequalities."
      }
    ],
    // Default algebra resources for any unmatched topics
    algebra: [
      {
        title: "Ruang Guru - Aljabar",
        url: "https://www.ruangguru.com/blog/matematika-kelas-10-aljabar",
        description: "Materi lengkap aljabar untuk siswa SMA."
      },
      {
        title: "Zenius - Aljabar",
        url: "https://www.zenius.net/blog/aljabar",
        description: "Video pembelajaran aljabar dengan contoh soal."
      },
      {
        title: "Khan Academy - Algebra",
        url: "https://www.khanacademy.org/math/algebra",
        description: "Complete algebra course covering all essential topics."
      }
    ]
  }

  // Handle undefined subcategory
  if (!subcategory || subcategory === "undefined") {
    return resources.algebra || []
  }

  // Try exact match first
  const exactMatch = resources[subcategory.toLowerCase()]
  if (exactMatch) return exactMatch

  // If no exact match, try to find a partial match
  const partialMatch = Object.entries(resources).find(
    ([key]) =>
      subcategory.toLowerCase().includes(key) ||
      key.includes(subcategory.toLowerCase())
  )

  return partialMatch ? partialMatch[1] : resources.algebra
}

export default function QuizResultDetailPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [result, setResult] = useState<DetailedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
  }, [params.id, setQuiz, setError])

  const fetchResultDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/quizzes/${params.id}/results?participantId=${params.participantId}`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch result details")
      }
      const data = await response.json()
      setResult(data)
    } catch (error) {
      toast.error("Failed to load result details")
      setError("Failed to load result details")
      console.error("Error fetching result details:", error)
    } finally {
      setLoading(false)
    }
  }, [params.id, params.participantId, setResult, setError, setLoading])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    fetchQuiz()
    fetchResultDetails()
  }, [status, router, fetchQuiz, fetchResultDetails])

  // Helper function to calculate percentage
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

  if (!quiz || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || "Result not found"}</div>
      </div>
    )
  }

  // Find strongest and weakest subcategories
  const subcategoryPerformance: {
    category: string
    subcategory: string
    correct: number
    total: number
    percentage: number
  }[] = []

  // Extract all subcategories with their metrics
  Object.entries(result.categories).forEach(([category, categoryData]) => {
    Object.entries(categoryData.subcategories).forEach(
      ([subcategory, data]) => {
        if (data.total > 0) {
          subcategoryPerformance.push({
            category,
            subcategory,
            correct: data.correct,
            total: data.total,
            percentage: calculatePercentage(data.correct, data.total)
          })
        }
      }
    )
  })

  // Sort by percentage for finding strongest and weakest
  subcategoryPerformance.sort((a, b) => b.percentage - a.percentage)

  const strongestSubcategory = subcategoryPerformance[0]
  // Only consider subcategories with less than 100% score as needing improvement
  const subcategoriesNeedingImprovement = subcategoryPerformance.filter(
    (sub) => sub.percentage < 100
  )
  const weakestSubcategory =
    subcategoriesNeedingImprovement.length > 0
      ? subcategoriesNeedingImprovement[
          subcategoriesNeedingImprovement.length - 1
        ]
      : null

  // Find strongest and weakest main categories
  const categoryPerformance = Object.entries(result.categories)
    .filter(([, stats]) => stats.total > 0)
    .map(([category, stats]) => ({
      category,
      correct: stats.correct,
      total: stats.total,
      percentage: calculatePercentage(stats.correct, stats.total)
    }))
    .sort((a, b) => b.percentage - a.percentage)

  const strongestCategory = categoryPerformance[0]
  // Only consider categories with less than 100% score as needing improvement
  const categoriesNeedingImprovement = categoryPerformance.filter(
    (cat) => cat.percentage < 100
  )
  const weakestCategory =
    categoriesNeedingImprovement.length > 0
      ? categoriesNeedingImprovement[categoriesNeedingImprovement.length - 1]
      : null

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="container max-w-4xl mx-auto">
        <div className="w-full flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 font-heading">
            {quiz.title} - Detailed Analysis
          </h1>
          <Button asChild variant="outline">
            <Link
              href={`/quizzes/${params.id}/results`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Results List
            </Link>
          </Button>
        </div>

        {/* Assessment Details Card */}
        <Card className="mb-6 bg-white/90 border-white/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Assessment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-600">Student:</span>
                  <span className="text-gray-800">
                    {result.name || "Anonymous Student"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-600">Date:</span>
                  <span className="text-gray-800">
                    {new Date(result.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <BookText className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-600">Score:</span>
                  </div>
                  <span className="text-gray-800 font-semibold">
                    {result.score}/{result.totalQuestions}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Percentage:
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {Math.round((result.score / result.totalQuestions) * 100)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={Math.round(
                      (result.score / result.totalQuestions) * 100
                    )}
                    className="h-2 mt-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strongest and Weakest Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4 bg-green-50 border-green-100 rounded-lg">
            <div className="flex gap-2 items-center mb-3">
              <Award className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-green-800">
                Strongest Areas
              </h3>
            </div>

            {strongestCategory && (
              <div className="mb-3">
                <p className="text-sm text-green-700 font-medium">Category</p>
                <div className="flex justify-between items-center">
                  <p className="text-base text-green-800 capitalize">
                    {strongestCategory.category}
                  </p>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {strongestCategory.percentage}%
                  </span>
                </div>
              </div>
            )}

            {strongestSubcategory && (
              <div>
                <p className="text-sm text-green-700 font-medium">
                  Subcategory
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-base text-green-800 capitalize">
                    {strongestSubcategory.subcategory}
                  </p>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {strongestSubcategory.percentage}%
                  </span>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-4 bg-amber-50 border-amber-100 rounded-lg">
            <div className="flex gap-2 items-center mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-medium text-amber-800">
                Areas for Improvement
              </h3>
            </div>

            {weakestCategory ? (
              <>
                <div className="mb-3">
                  <p className="text-sm text-amber-700 font-medium">Category</p>
                  <div className="flex justify-between items-center">
                    <p className="text-base text-amber-800 capitalize">
                      {weakestCategory.category}
                    </p>
                    <span className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                      {weakestCategory.percentage}%
                    </span>
                  </div>
                </div>

                {weakestSubcategory && (
                  <div>
                    <p className="text-sm text-amber-700 font-medium">
                      Subcategory
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-base text-amber-800 capitalize">
                        {weakestSubcategory.subcategory}
                      </p>
                      <span className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        {weakestSubcategory.percentage}%
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-amber-700">
                  Congratulations! You scored 100% in all areas.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* AI Insights Card */}
        <AIInsightsCard result={result} className="mb-6" />

        {/* Our custom learning path component with student-style design */}
        <StudentStyleLearningPath
          result={result}
          resourcesFunction={getLearningResources}
        />

        {/* Question Review */}
        <Card className="bg-white/90 border-white/20 shadow-sm">
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {result.questions.map((question, index) => {
                const userAnswer = result.answers[question.id]
                const isCorrect = userAnswer === question.correctAnswer

                return (
                  <div
                    key={question.id}
                    className={`border rounded-lg p-4 ${
                      isCorrect ? "border-green-200" : "border-red-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">Question {index + 1}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {question.subcategory ||
                            question.category ||
                            "general"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          isCorrect
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </div>

                    <p className="mb-4">
                      <Latex>{question.text}</Latex>
                    </p>

                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded ${
                            optionIndex === userAnswer
                              ? isCorrect
                                ? "bg-green-100"
                                : "bg-red-100"
                              : optionIndex === question.correctAnswer &&
                                !isCorrect
                              ? "bg-green-50 border border-green-200"
                              : ""
                          }`}
                        >
                          <div className="flex gap-2">
                            <span className="font-medium">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <Latex>{option}</Latex>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
