"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Brain, Book, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

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

interface AIInsightsCardProps {
  result: QuizResult
  className?: string
}

interface StudyPlanItem {
  topic: string
  priority: "high" | "medium" | "low"
  resources: {
    title: string
    url: string
  }[]
  timeEstimate: string
}

export function AIInsightsCard({
  result,
  className = ""
}: AIInsightsCardProps) {
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [studyPlan, setStudyPlan] = useState<StudyPlanItem[]>([])
  const [generatingPlan, setGeneratingPlan] = useState(false)

  useEffect(() => {
    // Simulate AI analysis
    const generateInsights = () => {
      setLoading(true)

      setTimeout(() => {
        const generatedInsights = analyzeResults(result)
        setInsights(generatedInsights)
        setLoading(false)
      }, 1500) // Simulate API call delay
    }

    generateInsights()
  }, [result])

  // Function to analyze results and generate insights
  const analyzeResults = (result: QuizResult): string[] => {
    const insights: string[] = []

    // Overall performance insight
    const scorePercentage = Math.round(
      (result.score / result.totalQuestions) * 100
    )
    if (scorePercentage >= 90) {
      insights.push(
        "Performa keseluruhan sangat baik! Pemahaman matematika Anda sangat kuat."
      )
    } else if (scorePercentage >= 70) {
      insights.push(
        "Performa keseluruhan baik. Dengan latihan yang terarah, Anda dapat lebih meningkatkan skor Anda."
      )
    } else if (scorePercentage >= 50) {
      insights.push(
        "Anda memiliki pemahaman dasar tentang materi, tetapi masih ada ruang untuk perbaikan."
      )
    } else {
      insights.push(
        "Anda mungkin perlu meninjau kembali konsep matematika dasar dan mencari bantuan tambahan."
      )
    }

    // Analyze category performance
    const categories = Object.entries(result.categories)
      .map(([name, data]) => ({
        name,
        percentage:
          data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        correct: data.correct,
        total: data.total
      }))
      .sort((a, b) => a.percentage - b.percentage)

    // Identify strongest category
    const strongest = categories[categories.length - 1]
    if (strongest && strongest.total > 0) {
      insights.push(
        `Area terkuat Anda adalah ${
          strongest.name.charAt(0).toUpperCase() + strongest.name.slice(1)
        } (${strongest.percentage}% benar).`
      )
    }

    // Identify weakest category
    const weakest = categories[0]
    if (weakest && weakest.total > 0 && weakest.percentage < 70) {
      insights.push(
        `Fokus untuk meningkatkan keterampilan ${weakest.name} Anda, di mana Anda mendapat skor ${weakest.percentage}%.`
      )
    }

    // Pattern recognition in mistakes
    const incorrectQuestions = result.questions.filter(
      (q) =>
        result.answers[q.id] !== undefined &&
        result.answers[q.id] !== q.correctAnswer
    )

    // Check for patterns in incorrect answers
    if (incorrectQuestions.length > 0) {
      const categoryMistakes: Record<string, number> = {}

      incorrectQuestions.forEach((q) => {
        // Use the category field if available, fall back to a default
        const category = q.category || q.subcategory?.split(" ")[0] || "general"
        categoryMistakes[category] = (categoryMistakes[category] || 0) + 1
      })

      const mostMistakesCategory = Object.entries(categoryMistakes).sort(
        (a, b) => b[1] - a[1]
      )[0]

      if (mostMistakesCategory && mostMistakesCategory[1] > 1) {
        insights.push(
          `Anda membuat beberapa kesalahan di ${mostMistakesCategory[0]}. Pertimbangkan untuk meninjau topik ini.`
        )
      }
    }

    // Learning style insight
    const consistentCategories = categories.filter((c) => c.percentage > 70)
    const inconsistentCategories = categories.filter((c) => c.percentage < 50)

    if (consistentCategories.length > inconsistentCategories.length) {
      insights.push(
        "Anda menunjukkan pemahaman yang konsisten di berbagai topik, menunjukkan dasar matematika yang kuat."
      )
    } else if (inconsistentCategories.length > 1) {
      insights.push(
        "Performa Anda bervariasi di seluruh topik. Pendekatan belajar yang lebih terstruktur mungkin membantu meningkatkan konsistensi."
      )
    }

    // Time management insight (placeholder - would use actual timing data in a real implementation)
    if (result.totalQuestions > 10 && scorePercentage < 65) {
      insights.push(
        "Pertimbangkan untuk menghabiskan lebih banyak waktu pada latihan soal untuk meningkatkan kecepatan dan akurasi Anda."
      )
    }

    // Add a study recommendation
    if (weakest && weakest.percentage < 70) {
      insights.push(
        `Rekomendasi: Mulai dengan latihan ${weakest.name} dan secara bertahap pindah ke masalah yang lebih kompleks.`
      )
    } else {
      insights.push(
        "Rekomendasi: Tantang diri Anda dengan masalah yang lebih canggih untuk lebih mengembangkan keterampilan Anda."
      )
    }

    return insights
  }

  const generateStudyPlan = () => {
    setGeneratingPlan(true)

    // Simulate API call to generate study plan
    setTimeout(() => {
      const plan = createPersonalizedStudyPlan(result)
      setStudyPlan(plan)
      setGeneratingPlan(false)
    }, 2000)
  }

  const createPersonalizedStudyPlan = (result: QuizResult): StudyPlanItem[] => {
    const plan: StudyPlanItem[] = []

    // Get categories sorted by performance (worst first)
    const categories = Object.entries(result.categories)
      .map(([name, data]) => ({
        name,
        percentage:
          data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        correct: data.correct,
        total: data.total,
        subcategories: data.subcategories
      }))
      .sort((a, b) => a.percentage - b.percentage)

    // Add weak areas to study plan with high priority
    categories
      .filter((cat) => cat.percentage < 60 && cat.total > 0)
      .forEach((category) => {
        plan.push({
          topic: category.name,
          priority: "high",
          resources: generateResourcesForTopic(category.name),
          timeEstimate: "3-4 hours per week"
        })

        // Add specific subcategories if they exist and are weak
        for (const [subName, subData] of Object.entries(
          category.subcategories
        )) {
          if (
            subData.total > 0 &&
            (subData.correct / subData.total) * 100 < 50
          ) {
            plan.push({
              topic: `${category.name}: ${subName}`,
              priority: "high",
              resources: generateResourcesForTopic(subName),
              timeEstimate: "2-3 hours per week"
            })
          }
        }
      })

    // Add medium performance areas
    categories
      .filter(
        (cat) => cat.percentage >= 60 && cat.percentage < 80 && cat.total > 0
      )
      .forEach((category) => {
        plan.push({
          topic: category.name,
          priority: "medium",
          resources: generateResourcesForTopic(category.name),
          timeEstimate: "2 hours per week"
        })
      })

    // Add one strong area for maintenance
    const strongArea = categories
      .filter((cat) => cat.percentage >= 80 && cat.total > 0)
      .pop()

    if (strongArea) {
      plan.push({
        topic: strongArea.name,
        priority: "low",
        resources: generateResourcesForTopic(strongArea.name),
        timeEstimate: "1 hour per week"
      })
    }

    return plan
  }

  const generateResourcesForTopic = (
    topic: string
  ): { title: string; url: string }[] => {
    // Simplified mapping of topics to resources
    const resourceMap: Record<string, { title: string; url: string }[]> = {
      algebra: [
        {
          title: "Khan Academy - Algebra",
          url: "https://www.khanacademy.org/math/algebra"
        },
        {
          title: "Brilliant - Algebra Fundamentals",
          url: "https://brilliant.org/courses/algebra-fundamentals/"
        }
      ],
      geometry: [
        {
          title: "Khan Academy - Geometry",
          url: "https://www.khanacademy.org/math/geometry"
        },
        {
          title: "Math is Fun - Geometry",
          url: "https://www.mathsisfun.com/geometry/"
        }
      ],
      calculus: [
        {
          title: "Khan Academy - Calculus",
          url: "https://www.khanacademy.org/math/calculus-1"
        },
        {
          title: "Paul&apos;s Online Math Notes",
          url: "https://tutorial.math.lamar.edu/Classes/CalcI/CalcI.aspx"
        }
      ],
      trigonometry: [
        {
          title: "Khan Academy - Trigonometry",
          url: "https://www.khanacademy.org/math/trigonometry"
        },
        {
          title: "Math is Fun - Trigonometry",
          url: "https://www.mathsisfun.com/algebra/trigonometry.html"
        }
      ],
      statistics: [
        {
          title: "Khan Academy - Statistics",
          url: "https://www.khanacademy.org/math/statistics-probability"
        },
        { title: "Stat Trek", url: "https://stattrek.com/" }
      ]
    }

    // Find best match for topic
    const normalizedTopic = topic.toLowerCase()
    for (const [key, resources] of Object.entries(resourceMap)) {
      if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
        return resources
      }
    }

    // Default resources if no match found
    return [
      { title: "Khan Academy - Math", url: "https://www.khanacademy.org/math" },
      { title: "Math is Fun", url: "https://www.mathsisfun.com/" }
    ]
  }

  return (
    <Card
      className={`${className} bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100`}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-indigo-900 flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          Wawasan berbasis AI
        </CardTitle>
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <p className="text-indigo-700">Menganalisis hasil Anda...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="bg-white bg-opacity-60 p-3 rounded-lg">
                <p className="text-gray-800">{insight}</p>
              </div>
            ))}
            <div className="mt-4 flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-indigo-700"
                    onClick={
                      studyPlan.length === 0 ? generateStudyPlan : undefined
                    }
                  >
                    <Book className="h-4 w-4 mr-2" />
                    Dapatkan Rencana Belajar Detail
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <Book className="h-5 w-5 text-indigo-600" />
                      Rencana Belajar Personal
                    </DialogTitle>
                    <DialogDescription>
                      Berdasarkan hasil penilaian Anda, kami telah membuat
                      rencana belajar personal untuk membantu Anda meningkatkan
                      kemampuan.
                    </DialogDescription>
                  </DialogHeader>

                  {generatingPlan ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
                      <p className="text-gray-700">
                        Membuat rencana belajar personal Anda...
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Ini mungkin memerlukan waktu saat kami menganalisis pola
                        performa Anda.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6 py-4">
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <h3 className="font-medium text-indigo-900 mb-2">
                          Ikhtisar Rencana Belajar
                        </h3>
                        <p className="text-gray-700">
                          Rencana ini berfokus pada peningkatan area yang lebih
                          lemah sambil mempertahankan kekuatan Anda. Kami
                          merekomendasikan belajar 5-7 jam per minggu secara
                          total.
                        </p>
                      </div>

                      {studyPlan.map((item, i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-gray-900 capitalize">
                              {item.topic}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                item.priority === "high"
                                  ? "bg-red-100 text-red-800"
                                  : item.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {item.priority === "high"
                                ? "Prioritas tinggi"
                                : item.priority === "medium"
                                ? "Prioritas sedang"
                                : "Prioritas rendah"}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">
                              Waktu yang direkomendasikan:
                            </span>{" "}
                            {item.timeEstimate.replace(
                              "hours per week",
                              "jam per minggu"
                            )}
                          </p>

                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              Sumber daya yang direkomendasikan:
                            </p>
                            {item.resources.map((resource, j) => (
                              <div key={j} className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-indigo-600 hover:underline"
                                >
                                  {resource.title}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="bg-indigo-50 p-4 rounded-lg mt-4">
                        <h3 className="font-medium text-indigo-900 mb-2">
                          Langkah Selanjutnya
                        </h3>
                        <p className="text-gray-700">
                          Setelah mengikuti rencana ini selama 2-3 minggu, ambil
                          kembali penilaian untuk mengukur kemajuan Anda dan
                          dapatkan rencana belajar yang diperbarui.
                        </p>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
