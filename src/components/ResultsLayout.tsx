"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  BookOpen,
  Award,
  AlertTriangle,
  User,
  Calendar,
  BookText
} from "lucide-react"
import "katex/dist/katex.min.css"
import Latex from "react-latex-next"
import { AIInsightsCard } from "@/components/AIInsightsCard"

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
  studentName?: string
}

interface LearningResource {
  title: string
  url: string
  description: string
}

interface ResultsLayoutProps {
  result: QuizResult
  resourcesFunction: (subcategory: string) => LearningResource[]
  title: string
  backUrl: string
  backLabel: string
}

// Helper function to calculate percentage
const calculatePercentage = (correct: number, total: number) => {
  return total > 0 ? Math.round((correct / total) * 100) : 0
}

export default function ResultsLayout({
  result,
  resourcesFunction,
  title,
  backUrl,
  backLabel
}: ResultsLayoutProps) {
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

  // Generate learning path recommendations based on weakest areas
  const generateLearningPath = () => {
    const recommendations: {
      topic: string
      resources: LearningResource[]
    }[] = []

    // Add recommendations for weakest category
    if (weakestCategory) {
      recommendations.push({
        topic: weakestCategory.category,
        resources: resourcesFunction(weakestCategory.category)
      })
    }

    // Add recommendations for weakest subcategory if it exists and is different
    if (
      weakestSubcategory &&
      (!weakestCategory ||
        weakestSubcategory.category !== weakestCategory.category)
    ) {
      recommendations.push({
        topic: `${weakestSubcategory.category}: ${weakestSubcategory.subcategory}`,
        resources: resourcesFunction(weakestSubcategory.subcategory)
      })
    }

    // Add one more recommendation for moderate area if available
    const moderateCategories = categoryPerformance.filter(
      (cat) => cat.percentage >= 40 && cat.percentage < 100
    )

    if (
      moderateCategories.length > 0 &&
      moderateCategories[0].category !== weakestCategory?.category
    ) {
      recommendations.push({
        topic: moderateCategories[0].category,
        resources: resourcesFunction(moderateCategories[0].category)
      })
    }

    return recommendations
  }

  const learningPath = generateLearningPath()

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="container max-w-4xl mx-auto">
        <div className="w-full flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 font-heading">
            {title}
          </h1>
          <Button asChild variant="outline">
            <Link href={backUrl} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        </div>

        {/* Assessment Details */}
        <Card className="mb-6 bg-white/90 border-white/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Detail Penilaian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-600">Siswa:</span>
                  <span className="text-gray-800">
                    {result.studentName || "Siswa Anonim"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-600">Tanggal:</span>
                  <span className="text-gray-800">
                    {new Date(result.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <BookText className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-600">Skor:</span>
                  </div>
                  <span className="text-gray-800 font-semibold">
                    {result.score}/{result.totalQuestions}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Persentase:
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {calculatePercentage(result.score, result.totalQuestions)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={calculatePercentage(
                      result.score,
                      result.totalQuestions
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
                Area Terkuat
              </h3>
            </div>

            {strongestCategory && (
              <div className="mb-3">
                <p className="text-sm text-green-700 font-medium">Kategori</p>
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
                  Subkategori
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
                Area untuk Perbaikan
              </h3>
            </div>

            {weakestCategory ? (
              <>
                <div className="mb-3">
                  <p className="text-sm text-amber-700 font-medium">Kategori</p>
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
                      Subkategori
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
                  Selamat! Anda mendapatkan skor 100% di semua area.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* AI Insights Card */}
        <AIInsightsCard result={result} className="mb-6" />

        {/* Learning Path Recommendations */}
        <Card className="mb-6 bg-white/90 border-white/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Rekomendasi Jalur Pembelajaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {learningPath.length > 0 ? (
                learningPath.map((recommendation, i) => (
                  <div
                    key={i}
                    className="border border-indigo-100 rounded-lg p-4 bg-indigo-50/30"
                  >
                    <h3 className="text-lg font-medium text-indigo-800 mb-3 capitalize">
                      {recommendation.topic}
                    </h3>

                    <div className="space-y-3">
                      {recommendation.resources.map((resource, j) => (
                        <div
                          key={j}
                          className="bg-white rounded-md p-3 border border-indigo-100"
                        >
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 font-medium hover:underline"
                          >
                            {resource.title}
                          </a>
                          <p className="text-sm text-gray-600 mt-1">
                            {resource.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">
                    {calculatePercentage(
                      result.score,
                      result.totalQuestions
                    ) === 100
                      ? "Kerja bagus! Anda telah menguasai semua konten dalam penilaian ini."
                      : "Tidak ada rekomendasi khusus tersedia."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card className="bg-white/90 border-white/20 shadow-sm">
          <CardHeader>
            <CardTitle>Ulasan Pertanyaan</CardTitle>
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
                            {optionIndex === userAnswer && (
                              <span className="ml-auto mr-1">
                                {isCorrect ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-green-600"
                                  >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-red-600"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                )}
                              </span>
                            )}
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
