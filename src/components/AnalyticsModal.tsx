"use client"

import { formatDistanceToNow } from "date-fns"
import "katex/dist/katex.min.css"
import { BookOpen } from "lucide-react"
import {
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  category?: string
  subcategory?: string
}

interface QuizResult {
  id: string
  name: string
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
}

interface LearningResource {
  title: string
  url: string
  description: string
}

interface AnalyticsModalProps {
  result: QuizResult
  resourcesFunction?: (subcategory: string) => LearningResource[]
  title?: string
}

// Default learning resources function
const defaultGetLearningResources = (
  subcategory: string
): LearningResource[] => {
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
      }
    ],
    quadratics: [
      {
        title: "Ruang Guru - Persamaan Kuadrat",
        url: "https://www.ruangguru.com/blog/matematika-kelas-10-persamaan-kuadrat",
        description:
          "Pembahasan lengkap persamaan kuadrat dan cara menyelesaikannya."
      },
      {
        title: "Zenius - Persamaan Kuadrat",
        url: "https://www.zenius.net/blog/persamaan-kuadrat",
        description: "Video pembelajaran persamaan kuadrat dengan contoh soal."
      },
      {
        title: "Khan Academy - Quadratic Equations",
        url: "https://www.khanacademy.org/math/algebra/quadratics",
        description:
          "Learn how to solve quadratic equations and understand their graphs."
      }
    ],
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
    ],
    geometry: [
      {
        title: "Ruang Guru - Geometri",
        url: "https://www.ruangguru.com/blog/matematika-kelas-10-geometri",
        description: "Materi lengkap tentang geometri dasar dan bangun ruang."
      },
      {
        title: "Zenius - Geometri",
        url: "https://www.zenius.net/blog/geometri",
        description: "Video pembelajaran geometri dengan contoh soal."
      },
      {
        title: "Khan Academy - Geometry",
        url: "https://www.khanacademy.org/math/geometry",
        description: "Learn about shapes, angles, and geometric proofs."
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

  return partialMatch ? partialMatch[1] : []
}

// Helper functions
const calculatePercentage = (correct: number, total: number) => {
  return total > 0 ? Math.round((correct / total) * 100) : 0
}

const getTimeAgo = (date: string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// Analyze response patterns
const getResponsePatterns = (quizResult: QuizResult) => {
  const patterns = {
    correctAnswerPreference: Array(4).fill(0), // Assuming max 4 options
    incorrectAnswerPreference: Array(4).fill(0), // Assuming max 4 options
    consistentMistakes: [] as string[],
    answeredAllQuestions: true
  }

  // Check for any skipped questions
  const skippedQuestions = quizResult.questions.filter(
    (q) => quizResult.answers[q.id] === undefined
  )
  patterns.answeredAllQuestions = skippedQuestions.length === 0

  // Count correct and incorrect answer distributions by position
  quizResult.questions.forEach((question) => {
    const userAnswer = quizResult.answers[question.id]
    if (userAnswer !== undefined) {
      if (userAnswer === question.correctAnswer) {
        patterns.correctAnswerPreference[userAnswer]++
      } else {
        patterns.incorrectAnswerPreference[userAnswer]++
      }
    }
  })

  // Find if there are consistent mistakes in specific subcategories
  const subcategoryMistakes: Record<
    string,
    { mistakes: number; total: number }
  > = {}

  quizResult.questions.forEach((question) => {
    const subcategory = question.subcategory || "general"

    if (!subcategoryMistakes[subcategory]) {
      subcategoryMistakes[subcategory] = { mistakes: 0, total: 0 }
    }

    subcategoryMistakes[subcategory].total++

    if (quizResult.answers[question.id] !== question.correctAnswer) {
      subcategoryMistakes[subcategory].mistakes++
    }
  })

  // Find subcategories with >70% mistakes
  patterns.consistentMistakes = Object.entries(subcategoryMistakes)
    .filter(
      ([, stats]) => stats.mistakes / stats.total > 0.7 && stats.total >= 2
    )
    .map(([subcategory]) => subcategory)

  return patterns
}

// Generate learning recommendations based on student performance
const getPersonalizedRecommendations = (quizResult: QuizResult) => {
  const weakCategories = []

  for (const [category, stats] of Object.entries(quizResult.categories)) {
    const categoryPercentage = calculatePercentage(stats.correct, stats.total)

    if (categoryPercentage < 60 && stats.total >= 2) {
      weakCategories.push({
        category,
        percentage: categoryPercentage,
        subcategories: Object.entries(stats.subcategories)
          .filter(
            ([, subStats]) =>
              calculatePercentage(subStats.correct, subStats.total) < 60 &&
              subStats.total >= 1
          )
          .map(([subName]) => subName)
      })
    }
  }

  return weakCategories
}

export const AnalyticsModal = ({
  result,
  resourcesFunction = defaultGetLearningResources,
  title = "Quiz Analytics"
}: AnalyticsModalProps) => {
  // Get response patterns for analysis
  const responsePatterns = getResponsePatterns(result)

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
      </DialogHeader>

      {/* Overall Performance Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold">
                {result.score}/{result.totalQuestions}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Percentage</p>
              <p className="text-2xl font-bold">
                {calculatePercentage(result.score, result.totalQuestions)}%
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Date Completed</p>
              <p className="text-lg">
                {new Date(result.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {getTimeAgo(result.createdAt)}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-medium">
                {calculatePercentage(result.score, result.totalQuestions)}%
              </span>
            </div>
            <Progress
              value={calculatePercentage(result.score, result.totalQuestions)}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Response Patterns Analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Response Pattern Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!responsePatterns.answeredAllQuestions && (
              <div className="p-4 bg-amber-50 rounded-lg">
                <h3 className="font-medium text-amber-800">
                  Incomplete Assessment
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Not all questions were answered. This may affect the overall
                  analysis.
                </p>
              </div>
            )}

            {responsePatterns.consistentMistakes.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-medium text-red-800">
                  Consistent Difficulty Areas
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Shows consistent difficulty with:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {responsePatterns.consistentMistakes.map((area: string) => (
                    <span
                      key={area}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm capitalize"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-medium">Answer Choice Patterns</h3>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 mb-4">
                  Response Distribution Analysis
                </h4>

                <div className="space-y-4">
                  {/* Option Selection Summary */}
                  <div className="border rounded-md p-3 bg-white">
                    <p className="text-sm font-medium mb-2">
                      Option Selection Summary
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {["A", "B", "C", "D"].map((letter, idx) => {
                        const correctCount =
                          responsePatterns.correctAnswerPreference[idx] || 0
                        const incorrectCount =
                          responsePatterns.incorrectAnswerPreference[idx] || 0
                        const totalSelected = correctCount + incorrectCount

                        return (
                          <div
                            key={letter}
                            className="flex flex-col items-center"
                          >
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 font-medium mb-1">
                              {letter}
                            </div>
                            <div className="text-xs text-center">
                              <div>{totalSelected} selected</div>
                              {totalSelected > 0 && (
                                <div className="text-green-600">
                                  {correctCount} correct
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topic Performance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Topic Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(result.categories).map(([category, stats]) => {
              const percentage = calculatePercentage(stats.correct, stats.total)

              return (
                <div key={category} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium capitalize text-lg">
                      {category}
                    </h3>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />

                  {/* Detailed Math Subcategory Analysis */}
                  {Object.keys(stats.subcategories).length > 0 && (
                    <div className="mt-4 border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subcategory
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Score
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Performance
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {Object.entries(stats.subcategories)
                            .sort(
                              ([, a], [, b]) =>
                                calculatePercentage(b.correct, b.total) -
                                calculatePercentage(a.correct, a.total)
                            )
                            .map(([subcategory, subStats]) => {
                              const subPercentage = calculatePercentage(
                                subStats.correct,
                                subStats.total
                              )

                              // Determine performance text and style
                              let performanceText = ""
                              let performanceClass = ""

                              if (subPercentage >= 80) {
                                performanceText = "Excellent"
                                performanceClass = "text-green-600"
                              } else if (subPercentage >= 60) {
                                performanceText = "Good"
                                performanceClass = "text-yellow-600"
                              } else {
                                performanceText = "Needs Improvement"
                                performanceClass = "text-red-600"
                              }

                              return (
                                <tr
                                  key={subcategory}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-4 py-3 text-sm capitalize">
                                    {subcategory}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    {subStats.correct}/{subStats.total} (
                                    {subPercentage}%)
                                  </td>
                                  <td
                                    className={`px-4 py-3 text-sm font-medium ${performanceClass}`}
                                  >
                                    {performanceText}
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Optimized Study Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recommended Learning Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Get recommendations based on performance */}
          {(() => {
            const recommendations = getPersonalizedRecommendations(result)

            if (recommendations.length === 0) {
              return (
                <p className="text-muted-foreground">
                  Great job! You&apos;re doing well in all topics. Keep
                  practicing to maintain your skills.
                </p>
              )
            }

            return (
              <div className="space-y-4">
                {recommendations.slice(0, 3).map(
                  (
                    item: {
                      category: string
                      percentage: number
                      subcategories: string[]
                    },
                    index: number
                  ) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-white/70"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium capitalize">
                            {item.category}
                          </h3>
                          <p className="text-sm text-red-600">
                            {item.percentage}% accuracy - Needs improvement
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                          Priority {index + 1}
                        </span>
                      </div>

                      {item.subcategories.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-2">
                            Focus areas:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.subcategories.map((subcat: string) => (
                              <span
                                key={subcat}
                                className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs capitalize"
                              >
                                {subcat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resources for this topic */}
                      {(() => {
                        const [, subcategory] = item.category.split(" - ")
                        const subcategoryName =
                          subcategory === "undefined"
                            ? item.category.split(" - ")[0].toLowerCase() // Use category if subcategory is undefined
                            : subcategory?.toLowerCase()

                        const resources = resourcesFunction(
                          subcategoryName || item.category.toLowerCase()
                        )

                        return resources.length > 0 ? (
                          <div>
                            <p className="text-sm font-medium mb-2">
                              Learning resources:
                            </p>
                            <div className="space-y-2">
                              {resources.slice(0, 3).map((resource, i) => (
                                <a
                                  key={i}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block p-2 border border-blue-100 rounded hover:bg-blue-50 transition-colors"
                                >
                                  <div className="font-medium text-blue-700">
                                    {resource.title}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {resource.description}
                                  </p>
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : null
                      })()}
                    </div>
                  )
                )}
              </div>
            )
          })()}
        </CardContent>
      </Card>
    </DialogContent>
  )
}
