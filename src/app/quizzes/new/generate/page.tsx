"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Wand2, ArrowRight, X, Plus } from "lucide-react"
import { toast } from "sonner"
import { LatexInput } from "@/components/latex-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import useTranslation from "@/hooks/useTranslation"

const MATH_CATEGORIES = [
  {
    id: "algebra",
    name: "Aljabar",
    subcategories: [
      { id: "linear", name: "Persamaan Linear" },
      { id: "quadratic", name: "Persamaan Kuadrat" },
      { id: "polynomials", name: "Polinomial" },
      { id: "functions", name: "Fungsi" },
      { id: "equations", name: "Persamaan" },
      { id: "inequalities", name: "Pertidaksamaan" }
    ]
  },
  {
    id: "geometry",
    name: "Geometri",
    subcategories: [
      { id: "triangles", name: "Segitiga" },
      { id: "circles", name: "Lingkaran" },
      { id: "polygons", name: "Poligon" },
      { id: "coordinate", name: "Geometri Koordinat" },
      { id: "transformations", name: "Transformasi" },
      { id: "area", name: "Luas dan Volume" }
    ]
  },
  {
    id: "calculus",
    name: "Kalkulus",
    subcategories: [
      { id: "limits", name: "Limit" },
      { id: "derivatives", name: "Turunan" },
      { id: "integrals", name: "Integral" },
      { id: "series", name: "Deret" },
      { id: "applications", name: "Aplikasi" }
    ]
  },
  {
    id: "statistics",
    name: "Statistika",
    subcategories: [
      { id: "probability", name: "Probabilitas" },
      { id: "distributions", name: "Distribusi" },
      { id: "hypothesis", name: "Pengujian Hipotesis" },
      { id: "regression", name: "Regresi" },
      { id: "data-analysis", name: "Analisis Data" }
    ]
  },
  {
    id: "trigonometry",
    name: "Trigonometri",
    subcategories: [
      { id: "functions", name: "Fungsi Trigonometri" },
      { id: "identities", name: "Identitas" },
      { id: "equations", name: "Persamaan Trigonometri" },
      { id: "applications", name: "Aplikasi" }
    ]
  }
]

const DIFFICULTY_LEVELS = [
  { id: "easy", name: "Mudah" },
  { id: "medium", name: "Sedang" },
  { id: "hard", name: "Sulit" }
]

const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30]

export default function GenerateQuizPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quizType = (searchParams.get("type") as "live" | "assessment") || "live"
  const { t } = useTranslation()

  const [requirements, setRequirements] = useState("")
  const [loading, setLoading] = useState(false)

  // Replace single category/subcategory with multiple selections
  const [selectedTopics, setSelectedTopics] = useState<
    Array<{
      category: string
      categoryName: string
      subcategory: string
      subcategoryName: string
      weight: number
    }>
  >([])

  // Temporary state for current selection
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [level, setLevel] = useState("medium")
  const [questionCount, setQuestionCount] = useState(10)
  const [distributionMethod, setDistributionMethod] = useState<
    "equal" | "weighted"
  >("equal")

  const addTopic = () => {
    if (!category || !subcategory) {
      toast.error("Silakan pilih kategori dan subtopik")
      return
    }

    // Check if already selected
    if (
      selectedTopics.some(
        (t) => t.category === category && t.subcategory === subcategory
      )
    ) {
      toast.error("Topik ini sudah dipilih")
      return
    }

    const categoryObj = MATH_CATEGORIES.find((c) => c.id === category)
    const subcategoryObj = categoryObj?.subcategories.find(
      (s) => s.id === subcategory
    )

    if (categoryObj && subcategoryObj) {
      setSelectedTopics([
        ...selectedTopics,
        {
          category,
          categoryName: categoryObj.name,
          subcategory,
          subcategoryName: subcategoryObj.name,
          weight: 1
        }
      ])

      // Clear selection for next topic
      setSubcategory("")
    }
  }

  const removeTopic = (index: number) => {
    setSelectedTopics(selectedTopics.filter((_, i) => i !== index))
  }

  const updateTopicWeight = (index: number, weight: number) => {
    const updatedTopics = [...selectedTopics]
    updatedTopics[index].weight = weight
    setSelectedTopics(updatedTopics)
  }

  const handleGenerate = async () => {
    if (selectedTopics.length === 0) {
      toast.error("Silakan pilih minimal satu topik")
      return
    }

    if (!level) {
      toast.error("Silakan pilih tingkat kesulitan")
      return
    }

    setLoading(true)
    try {
      // Define type for topics with question counts
      type TopicWithCount = {
        category: string
        categoryName: string
        subcategory: string
        subcategoryName: string
        weight: number
        questionCount: number
      }

      // Calculate question distribution based on weights
      let topicsWithQuestionCounts: TopicWithCount[] = selectedTopics.map(
        (topic) => ({
          ...topic,
          questionCount: 0 // Default value, will be set below
        })
      )

      if (distributionMethod === "equal") {
        // Distribute questions equally
        const baseQuestionsPerTopic = Math.floor(
          questionCount / selectedTopics.length
        )
        const extraQuestions = questionCount % selectedTopics.length

        topicsWithQuestionCounts = topicsWithQuestionCounts.map(
          (topic, index) => ({
            ...topic,
            questionCount:
              baseQuestionsPerTopic + (index < extraQuestions ? 1 : 0)
          })
        )
      } else {
        // Distribute based on weights
        const totalWeight = selectedTopics.reduce(
          (sum, topic) => sum + topic.weight,
          0
        )

        topicsWithQuestionCounts = topicsWithQuestionCounts.map((topic) => ({
          ...topic,
          questionCount: Math.max(
            1,
            Math.round((topic.weight / totalWeight) * questionCount)
          )
        }))

        // Adjust to match exact question count
        const totalAssigned = topicsWithQuestionCounts.reduce(
          (sum, topic) => sum + topic.questionCount,
          0
        )

        if (totalAssigned !== questionCount) {
          const diff = questionCount - totalAssigned
          if (diff > 0) {
            // Add remaining questions to topics with highest weights
            const sortedByWeight = [...topicsWithQuestionCounts].sort(
              (a, b) => b.weight - a.weight
            )
            for (let i = 0; i < diff; i++) {
              const index = topicsWithQuestionCounts.findIndex(
                (t) =>
                  t.category ===
                    sortedByWeight[i % sortedByWeight.length].category &&
                  t.subcategory ===
                    sortedByWeight[i % sortedByWeight.length].subcategory
              )
              if (index !== -1) {
                topicsWithQuestionCounts[index].questionCount++
              }
            }
          } else {
            // Remove excess questions from topics with lowest weights
            const sortedByWeight = [...topicsWithQuestionCounts].sort(
              (a, b) => a.weight - b.weight
            )
            for (let i = 0; i < Math.abs(diff); i++) {
              const topic = sortedByWeight[i % sortedByWeight.length]
              if (topic.questionCount > 1) {
                const index = topicsWithQuestionCounts.findIndex(
                  (t) =>
                    t.category === topic.category &&
                    t.subcategory === topic.subcategory
                )
                if (index !== -1) {
                  topicsWithQuestionCounts[index].questionCount--
                }
              }
            }
          }
        }
      }

      const response = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: quizType,
          topics: topicsWithQuestionCounts,
          level,
          questionCount,
          requirements
        })
      })

      if (!response.ok) {
        throw new Error("Failed to generate quiz")
      }

      const data = await response.json()

      // Store the generated quiz in localStorage
      localStorage.setItem("generatedQuiz", JSON.stringify(data))

      // Redirect to manual page with the generated content
      router.push(`/quizzes/new/manual?type=${quizType}&generated=true`)
    } catch (error) {
      console.error("Failed to generate quiz:", error)
      toast.error("Gagal membuat soal. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = MATH_CATEGORIES.find((c) => c.id === category)

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex flex-col gap-8 items-center w-full max-w-2xl mx-auto relative">
        <div className="w-full backdrop-blur-lg bg-white/30 p-6 rounded-xl border border-white/20 shadow-lg">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-3 rounded-full bg-blue-500/20 mb-4">
              <Wand2 className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-heading">
              {t("generate.title")}
            </h2>
            <p className="text-gray-700 text-base mb-6">
              {t("generate.settingsDescription")}
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("generate.category")}
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("generate.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {MATH_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topik
                </label>
                <Select
                  value={subcategory}
                  onValueChange={setSubcategory}
                  disabled={!category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih topik" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory?.subcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={addTopic}
              variant="outline"
              className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
              disabled={!category || !subcategory}
            >
              <Plus className="h-4 w-4 mr-2" /> Tambah Topik
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("generate.difficulty")}
                </label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("generate.selectDifficulty")} />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((lvl) => (
                      <SelectItem key={lvl.id} value={lvl.id}>
                        {lvl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("generate.questionCount")}
                </label>
                <Select
                  value={questionCount.toString()}
                  onValueChange={(v) => setQuestionCount(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("generate.selectCount")} />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_COUNTS.map((count) => (
                      <SelectItem key={count} value={count.toString()}>
                        {count} soal
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedTopics.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distribusi Soal
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="equal"
                      checked={distributionMethod === "equal"}
                      onCheckedChange={() => setDistributionMethod("equal")}
                    />
                    <label htmlFor="equal" className="text-sm">
                      Distribusi merata
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="weighted"
                      checked={distributionMethod === "weighted"}
                      onCheckedChange={() => setDistributionMethod("weighted")}
                    />
                    <label htmlFor="weighted" className="text-sm">
                      Distribusi berbobot
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Persyaratan Tambahan
              </label>
              <LatexInput
                value={requirements}
                onChange={setRequirements}
                placeholder="Masukkan persyaratan khusus (mis. fokus pada soal cerita, sertakan solusi grafis, dll.)"
                className="w-full bg-white/50 border-gray-200/50 focus:bg-white/70"
              />
            </div>

            {/* Selected Topics Section - Moved to the bottom */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                Topik Terpilih
              </div>
              {selectedTopics.length === 0 ? (
                <div className="text-sm text-gray-500 italic border border-dashed border-gray-300 p-3 rounded-md bg-white/30">
                  Belum ada topik terpilih. Tambahkan minimal satu topik di
                  atas.
                </div>
              ) : (
                <div className="bg-white/30 border border-gray-200/50 rounded-md p-3 space-y-2">
                  {selectedTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/40 p-2 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50">
                          {topic.categoryName}
                        </Badge>
                        <span className="text-sm font-medium">
                          {topic.subcategoryName}
                        </span>
                      </div>

                      {distributionMethod === "weighted" && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500">
                            Bobot:
                          </label>
                          <Select
                            value={topic.weight.toString()}
                            onValueChange={(v) =>
                              updateTopicWeight(index, parseInt(v))
                            }
                          >
                            <SelectTrigger className="h-7 w-16">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((w) => (
                                <SelectItem key={w} value={w.toString()}>
                                  {w}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeTopic(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={selectedTopics.length === 0 || !level || loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/20 group"
            >
              {loading ? (
                t("generate.generating")
              ) : (
                <>
                  {t("generate.generate")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
