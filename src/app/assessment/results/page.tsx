"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"
import { Bar } from "react-chartjs-2"
import { useTranslation } from "@/hooks/useTranslation"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Search } from "lucide-react"
import ShareResults from "@/components/ui/share-results"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MathJax from "@/components/MathJax"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type AssessmentResults = {
  totalScore: number
  totalQuestions: number
  categories: {
    algebra: { correct: number; total: number }
    geometry: { correct: number; total: number }
    arithmetic: { correct: number; total: number }
    calculus: { correct: number; total: number }
  }
  difficulties: {
    easy: { correct: number; total: number }
    medium: { correct: number; total: number }
    hard: { correct: number; total: number }
  }
  timestamp: string
  answers?: Record<string, string> // Jawaban siswa untuk setiap pertanyaan
}

export default function ResultsPage() {
  const router = useRouter()
  const { lang } = useTranslation()
  const [results, setResults] = useState<AssessmentResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [questions, setQuestions] = useState<
    {
      id: number
      text: string
      correctAnswer: string
      category: "algebra" | "geometry" | "arithmetic" | "calculus"
      difficulty: "easy" | "medium" | "hard"
      options: string[]
    }[]
  >([])

  useEffect(() => {
    // Check if user completed assessment
    const storedResults = localStorage.getItem("assessmentResults")
    const studentName = localStorage.getItem("studentName")
    const storedQuestions = localStorage.getItem("assessmentQuestions")

    if (!storedResults || !studentName) {
      router.push("/assessment/start")
      return
    }

    try {
      const parsedResults = JSON.parse(storedResults)
      setResults(parsedResults)
      setName(studentName)

      // Mencoba memuat pertanyaan dari localStorage jika tersedia
      let questionData = []
      if (storedQuestions) {
        try {
          questionData = JSON.parse(storedQuestions)
          console.log("Loaded stored questions:", questionData)
        } catch (err) {
          console.error("Error parsing stored questions:", err)
        }
      }

      // Jika tidak ada pertanyaan tersimpan, gunakan data sampel
      if (!questionData || questionData.length === 0) {
        const sampleQuestions =
          lang === "en"
            ? [
                {
                  id: 1,
                  text: "Solve for x: 2x + 5 = 13",
                  options: ["x = 3", "x = 4", "x = 8", "x = 9"],
                  correctAnswer: "x = 4",
                  category: "algebra" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "easy" as "easy" | "medium" | "hard"
                },
                {
                  id: 2,
                  text: "What is the area of a circle with radius 4 units?",
                  options: [
                    "8π square units",
                    "16π square units",
                    "4π square units",
                    "12π square units"
                  ],
                  correctAnswer: "16π square units",
                  category: "geometry" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "easy" as "easy" | "medium" | "hard"
                },
                {
                  id: 3,
                  text: "Simplify: (3 × 4) + (6 ÷ 2)",
                  options: ["15", "24", "18", "21"],
                  correctAnswer: "15",
                  category: "arithmetic" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "easy" as "easy" | "medium" | "hard"
                },
                {
                  id: 4,
                  text: "Find the derivative of f(x) = x² + 3x + 2",
                  options: [
                    "f'(x) = 2x + 3",
                    "f'(x) = x² + 3",
                    "f'(x) = 2x",
                    "f'(x) = 3"
                  ],
                  correctAnswer: "f'(x) = 2x + 3",
                  category: "calculus" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "medium" as "easy" | "medium" | "hard"
                },
                {
                  id: 5,
                  text: "Solve the system of equations: 2x + y = 5 and x - y = 1",
                  options: [
                    "x = 2, y = 1",
                    "x = 3, y = -1",
                    "x = 1, y = 3",
                    "x = 0, y = 5"
                  ],
                  correctAnswer: "x = 2, y = 1",
                  category: "algebra" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "medium" as "easy" | "medium" | "hard"
                },
                {
                  id: 6,
                  text: "What is the perimeter of a rectangle with length 8 units and width 5 units?",
                  options: ["13 units", "26 units", "40 units", "20 units"],
                  correctAnswer: "26 units",
                  category: "geometry" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "easy" as "easy" | "medium" | "hard"
                },
                {
                  id: 7,
                  text: "Evaluate: 25 ÷ (3 + 2) × 4",
                  options: ["5", "20", "100", "1"],
                  correctAnswer: "20",
                  category: "arithmetic" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "medium" as "easy" | "medium" | "hard"
                },
                {
                  id: 8,
                  text: "Find the integral of f(x) = 2x + 3",
                  options: [
                    "F(x) = x² + 3x + C",
                    "F(x) = 2x² + 3x + C",
                    "F(x) = x² + 3x",
                    "F(x) = x² + 3"
                  ],
                  correctAnswer: "F(x) = x² + 3x + C",
                  category: "calculus" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "hard" as "easy" | "medium" | "hard"
                },
                {
                  id: 9,
                  text: "If a triangle has sides of 3, 4, and 5 units, what is its area?",
                  options: [
                    "6 square units",
                    "10 square units",
                    "7.5 square units",
                    "6.5 square units"
                  ],
                  correctAnswer: "6 square units",
                  category: "geometry" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "medium" as "easy" | "medium" | "hard"
                },
                {
                  id: 10,
                  text: "Solve for x: log₃(x) = 2",
                  options: ["x = 6", "x = 9", "x = 8", "x = 5"],
                  correctAnswer: "x = 9",
                  category: "algebra" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "hard" as "easy" | "medium" | "hard"
                }
              ]
            : [
                {
                  id: 1,
                  text: "Selesaikan x: 2x + 5 = 13",
                  options: ["x = 3", "x = 4", "x = 8", "x = 9"],
                  correctAnswer: "x = 4",
                  category: "algebra" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "easy" as "easy" | "medium" | "hard"
                },
                {
                  id: 2,
                  text: "Berapa luas lingkaran dengan jari-jari 4 satuan?",
                  options: [
                    "8π satuan persegi",
                    "16π satuan persegi",
                    "4π satuan persegi",
                    "12π satuan persegi"
                  ],
                  correctAnswer: "16π satuan persegi",
                  category: "geometry" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "easy" as "easy" | "medium" | "hard"
                },
                {
                  id: 3,
                  text: "Sederhanakan: (3 × 4) + (6 ÷ 2)",
                  options: ["15", "24", "18", "21"],
                  correctAnswer: "15",
                  category: "arithmetic" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "easy" as "easy" | "medium" | "hard"
                },
                {
                  id: 4,
                  text: "Tentukan turunan dari f(x) = x² + 3x + 2",
                  options: [
                    "f'(x) = 2x + 3",
                    "f'(x) = x² + 3",
                    "f'(x) = 2x",
                    "f'(x) = 3"
                  ],
                  correctAnswer: "f'(x) = 2x + 3",
                  category: "calculus" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "medium" as "easy" | "medium" | "hard"
                },
                {
                  id: 5,
                  text: "Selesaikan sistem persamaan: 2x + y = 5 dan x - y = 1",
                  options: [
                    "x = 2, y = 1",
                    "x = 3, y = -1",
                    "x = 1, y = 3",
                    "x = 0, y = 5"
                  ],
                  correctAnswer: "x = 2, y = 1",
                  category: "algebra" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "medium" as "easy" | "medium" | "hard"
                },
                {
                  id: 6,
                  text: "Berapa keliling persegi panjang dengan panjang 8 satuan dan lebar 5 satuan?",
                  options: ["13 satuan", "26 satuan", "40 satuan", "20 satuan"],
                  correctAnswer: "26 satuan",
                  category: "geometry" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "easy" as "easy" | "medium" | "hard"
                },
                {
                  id: 7,
                  text: "Hitung: 25 ÷ (3 + 2) × 4",
                  options: ["5", "20", "100", "1"],
                  correctAnswer: "20",
                  category: "arithmetic" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "medium" as "easy" | "medium" | "hard"
                },
                {
                  id: 8,
                  text: "Tentukan integral dari f(x) = 2x + 3",
                  options: [
                    "F(x) = x² + 3x + C",
                    "F(x) = 2x² + 3x + C",
                    "F(x) = x² + 3x",
                    "F(x) = x² + 3"
                  ],
                  correctAnswer: "F(x) = x² + 3x + C",
                  category: "calculus" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "hard" as "easy" | "medium" | "hard"
                },
                {
                  id: 9,
                  text: "Jika sebuah segitiga memiliki sisi-sisi 3, 4, dan 5 satuan, berapa luasnya?",
                  options: [
                    "6 satuan persegi",
                    "10 satuan persegi",
                    "7,5 satuan persegi",
                    "6,5 satuan persegi"
                  ],
                  correctAnswer: "6 satuan persegi",
                  category: "geometry" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "medium" as "easy" | "medium" | "hard"
                },
                {
                  id: 10,
                  text: "Selesaikan untuk x: log₃(x) = 2",
                  options: ["x = 6", "x = 9", "x = 8", "x = 5"],
                  correctAnswer: "x = 9",
                  category: "algebra" as
                    | "algebra"
                    | "geometry"
                    | "arithmetic"
                    | "calculus",
                  difficulty: "hard" as "easy" | "medium" | "hard"
                }
              ]

        questionData = sampleQuestions
        // Simpan pertanyaan sampel ke localStorage untuk penggunaan berikutnya
        localStorage.setItem(
          "assessmentQuestions",
          JSON.stringify(sampleQuestions)
        )
      }

      setQuestions(questionData)

      // Debug - tampilkan di konsol untuk memastikan data tersedia
      console.log("Loaded results:", parsedResults)
      console.log("Loaded questions:", questionData)
    } catch (err) {
      console.error("Error parsing results", err)
      router.push("/assessment/start")
      return
    }

    setLoading(false)
  }, [router, lang])

  // Category translations
  const categoryLabels = {
    en: ["Algebra", "Geometry", "Arithmetic", "Calculus"],
    id: ["Aljabar", "Geometri", "Aritmatika", "Kalkulus"]
  }

  // Difficulty translations
  const difficultyLabels = {
    en: ["Easy", "Medium", "Hard"],
    id: ["Mudah", "Sedang", "Sulit"]
  }

  // Set page translations
  const pageTranslations = {
    title: lang === "en" ? "Assessment Results" : "Hasil Penilaian",
    loading: lang === "en" ? "Loading..." : "Memuat...",
    loadingDescription:
      lang === "en"
        ? "Please wait while we prepare your results"
        : "Mohon tunggu sementara kami menyiapkan hasil Anda",
    studentName: lang === "en" ? "Student Name" : "Nama Siswa",
    score: lang === "en" ? "Score" : "Skor",
    percentage: lang === "en" ? "Percentage" : "Persentase",
    performanceByCategory:
      lang === "en"
        ? "Performance by Category"
        : "Performa berdasarkan Kategori",
    performanceByDifficulty:
      lang === "en"
        ? "Performance by Difficulty"
        : "Performa berdasarkan Tingkat Kesulitan",
    correct: lang === "en" ? "Correct" : "Benar",
    incorrect: lang === "en" ? "Incorrect" : "Salah",
    recommendation:
      lang === "en"
        ? "Thank you for completing the assessment. You can retake it anytime to track your progress."
        : "Terima kasih telah menyelesaikan penilaian. Anda dapat mengambil kembali kapan saja untuk melacak kemajuan Anda.",
    retake: lang === "en" ? "Retake Assessment" : "Ambil Penilaian Kembali",
    overview: {
      title: lang === "en" ? "Performance Overview" : "Gambaran Umum Performa",
      strengths: lang === "en" ? "Strengths" : "Kelebihan",
      weaknesses:
        lang === "en" ? "Areas for Improvement" : "Area untuk Ditingkatkan",
      recommendations: lang === "en" ? "Recommendations" : "Rekomendasi",
      noStrengths:
        lang === "en"
          ? "Keep practicing to develop your strengths in mathematics."
          : "Terus berlatih untuk mengembangkan kelebihan Anda dalam matematika.",
      noWeaknesses:
        lang === "en"
          ? "Great job! Keep challenging yourself with more advanced problems."
          : "Kerja bagus! Terus tantang diri Anda dengan masalah yang lebih canggih."
    },
    learningResources: {
      title: lang === "en" ? "Learning Resources" : "Sumber Belajar",
      description:
        lang === "en"
          ? "Here are some resources to help you improve in the areas you need to work on:"
          : "Berikut adalah beberapa sumber untuk membantu Anda meningkatkan kemampuan di area yang perlu ditingkatkan:",
      visitResource: lang === "en" ? "Visit Resource" : "Kunjungi Sumber",
      generalMath:
        lang === "en"
          ? "General Mathematics Resources"
          : "Sumber Matematika Umum"
    },
    detailedAnalysis: {
      title:
        lang === "en"
          ? "Detailed Question Analysis"
          : "Analisis Pertanyaan Terperinci",
      showDetails:
        lang === "en"
          ? "Show Question Analysis"
          : "Tampilkan Analisis Pertanyaan",
      hideDetails:
        lang === "en"
          ? "Hide Question Analysis"
          : "Sembunyikan Analisis Pertanyaan",
      question: lang === "en" ? "Question" : "Pertanyaan",
      yourAnswer: lang === "en" ? "Your Answer" : "Jawaban Anda",
      correctAnswer: lang === "en" ? "Correct Answer" : "Jawaban Benar",
      category: lang === "en" ? "Category" : "Kategori",
      difficulty: lang === "en" ? "Difficulty" : "Tingkat Kesulitan",
      status: lang === "en" ? "Status" : "Status",
      correct: lang === "en" ? "Correct" : "Benar",
      incorrect: lang === "en" ? "Incorrect" : "Salah",
      timeSpent:
        lang === "en"
          ? "Average time spent"
          : "Waktu rata-rata yang dihabiskan",
      seconds: lang === "en" ? "seconds" : "detik",
      mastery: lang === "en" ? "Mastery Level" : "Tingkat Penguasaan",
      masteryLevels: {
        excellent: lang === "en" ? "Excellent" : "Sangat Baik",
        good: lang === "en" ? "Good" : "Baik",
        satisfactory: lang === "en" ? "Satisfactory" : "Memuaskan",
        needsImprovement:
          lang === "en" ? "Needs Improvement" : "Perlu Peningkatan",
        struggling: lang === "en" ? "Struggling" : "Kesulitan"
      },
      skillGap:
        lang === "en"
          ? "Skill Gap Analysis"
          : "Analisis Kesenjangan Keterampilan",
      frequentMistakes:
        lang === "en" ? "Frequent Mistakes" : "Kesalahan yang Sering Terjadi",
      questionAnalysis:
        lang === "en" ? "Question Analysis" : "Analisis Pertanyaan"
    }
  }

  // Definisikan objek untuk terjemahan kategori
  const categoryTranslations = {
    algebra: lang === "en" ? "Algebra" : "Aljabar",
    geometry: lang === "en" ? "Geometry" : "Geometri",
    arithmetic: lang === "en" ? "Arithmetic" : "Aritmatika",
    calculus: lang === "en" ? "Calculus" : "Kalkulus"
  }

  // Definisikan objek untuk terjemahan tingkat kesulitan
  const difficultyTranslations = {
    easy: lang === "en" ? "Easy" : "Mudah",
    medium: lang === "en" ? "Medium" : "Sedang",
    hard: lang === "en" ? "Hard" : "Sulit"
  }

  if (loading || !results) {
    return (
      <div className="p-8 pb-20 sm:p-20 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">
            {pageTranslations.loading}
          </h2>
          <p>{pageTranslations.loadingDescription}</p>
        </div>
      </div>
    )
  }

  // Prepare data for category chart
  const categoryData = {
    labels: lang === "en" ? categoryLabels.en : categoryLabels.id,
    datasets: [
      {
        label: pageTranslations.correct,
        data: [
          results.categories.algebra.correct,
          results.categories.geometry.correct,
          results.categories.arithmetic.correct,
          results.categories.calculus.correct
        ],
        backgroundColor: "rgba(37, 99, 235, 0.7)"
      },
      {
        label: pageTranslations.incorrect,
        data: [
          results.categories.algebra.total - results.categories.algebra.correct,
          results.categories.geometry.total -
            results.categories.geometry.correct,
          results.categories.arithmetic.total -
            results.categories.arithmetic.correct,
          results.categories.calculus.total -
            results.categories.calculus.correct
        ],
        backgroundColor: "rgba(239, 68, 68, 0.7)"
      }
    ]
  }

  // Prepare data for difficulty chart
  const difficultyData = {
    labels: lang === "en" ? difficultyLabels.en : difficultyLabels.id,
    datasets: [
      {
        label: pageTranslations.correct,
        data: [
          results.difficulties.easy.correct,
          results.difficulties.medium.correct,
          results.difficulties.hard.correct
        ],
        backgroundColor: "rgba(37, 99, 235, 0.7)"
      },
      {
        label: pageTranslations.incorrect,
        data: [
          results.difficulties.easy.total - results.difficulties.easy.correct,
          results.difficulties.medium.total -
            results.difficulties.medium.correct,
          results.difficulties.hard.total - results.difficulties.hard.correct
        ],
        backgroundColor: "rgba(239, 68, 68, 0.7)"
      }
    ]
  }

  // Calculate percentage score
  const percentage = Math.round(
    (results.totalScore / results.totalQuestions) * 100
  )

  // Format the date
  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date)
  }

  // Generate strengths and weaknesses analysis based on categories
  const generateAnalysis = () => {
    if (!results) return null

    type PerformanceItem = {
      category: string
      percent: number
    }

    const strengths: PerformanceItem[] = []
    const weaknesses: PerformanceItem[] = []

    // Check performance in each category
    const categories = [
      { key: "algebra", name: lang === "en" ? "Algebra" : "Aljabar" },
      { key: "geometry", name: lang === "en" ? "Geometry" : "Geometri" },
      { key: "arithmetic", name: lang === "en" ? "Arithmetic" : "Aritmatika" },
      { key: "calculus", name: lang === "en" ? "Calculus" : "Kalkulus" }
    ]

    categories.forEach((category) => {
      const { correct, total } =
        results.categories[category.key as keyof typeof results.categories]
      if (total === 0) return

      const percentageCorrect = (correct / total) * 100

      if (percentageCorrect >= 75) {
        strengths.push({
          category: category.name,
          percent: percentageCorrect
        })
      } else if (percentageCorrect < 50) {
        weaknesses.push({
          category: category.name,
          percent: percentageCorrect
        })
      }
    })

    // Sort by performance
    strengths.sort((a, b) => b.percent - a.percent)
    weaknesses.sort((a, b) => a.percent - b.percent)

    return { strengths, weaknesses }
  }

  // Generate recommendations based on weaknesses
  const generateRecommendations = (
    weaknessesData: { category: string; percent: number }[]
  ) => {
    if (!weaknessesData.length) return []

    return weaknessesData.map((weakness) => {
      const category = weakness.category.toLowerCase()

      // Generate category-specific recommendations
      if (category.includes("algebra")) {
        return lang === "en"
          ? `Focus on practicing algebraic equations and expressions. Try solving more problems involving variables and formulas.`
          : `Fokus berlatih persamaan dan ekspresi aljabar. Cobalah menyelesaikan lebih banyak masalah yang melibatkan variabel dan rumus.`
      } else if (category.includes("geometry")) {
        return lang === "en"
          ? `Review geometric principles and formulas. Practice with problems involving shapes, angles, and spatial relationships.`
          : `Tinjau prinsip dan rumus geometri. Berlatih dengan masalah yang melibatkan bentuk, sudut, dan hubungan spasial.`
      } else if (category.includes("arithmetic")) {
        return lang === "en"
          ? `Work on basic arithmetic operations. Practice with addition, subtraction, multiplication, division, and order of operations.`
          : `Kerjakan operasi aritmatika dasar. Berlatih dengan penjumlahan, pengurangan, perkalian, pembagian, dan urutan operasi.`
      } else if (category.includes("calculus")) {
        return lang === "en"
          ? `Review the fundamentals of calculus including derivatives and functions. Practice with rate of change problems.`
          : `Tinjau dasar-dasar kalkulus termasuk turunan dan fungsi. Berlatih dengan masalah laju perubahan.`
      } else {
        return lang === "en"
          ? `Continue practicing general math problems with a focus on ${weakness.category}.`
          : `Lanjutkan berlatih masalah matematika umum dengan fokus pada ${weakness.category}.`
      }
    })
  }

  // Generate learning resources based on weaknesses
  const generateLearningResources = (
    weaknessesData: { category: string; percent: number }[]
  ) => {
    if (!weaknessesData.length) {
      // General learning resources if no specific weaknesses
      return [
        {
          category: pageTranslations.learningResources.generalMath,
          resources: [
            {
              title: "Zenius Education",
              description:
                lang === "en"
                  ? "Indonesian educational platform with comprehensive math lessons in Indonesian language."
                  : "Platform pendidikan Indonesia dengan pelajaran matematika komprehensif dalam bahasa Indonesia.",
              url: "https://www.zenius.net/pelajaran/matematika"
            },
            {
              title: "Ruangguru",
              description:
                lang === "en"
                  ? "Complete math courses with video tutorials in Indonesian language."
                  : "Kursus matematika lengkap dengan tutorial video dalam bahasa Indonesia.",
              url: "https://www.ruangguru.com/"
            },
            {
              title:
                lang === "en"
                  ? "Khan Academy - Mathematics"
                  : "Khan Academy - Matematika",
              description:
                lang === "en"
                  ? "Free online courses, lessons and practice for various mathematics topics."
                  : "Kursus online gratis, pelajaran, dan latihan untuk berbagai topik matematika.",
              url:
                lang === "en"
                  ? "https://www.khanacademy.org/math"
                  : "https://id.khanacademy.org/math"
            },
            {
              title: "Quipper",
              description:
                lang === "en"
                  ? "Indonesian learning platform with math lessons aligned with the national curriculum."
                  : "Platform belajar Indonesia dengan pelajaran matematika yang sesuai dengan kurikulum nasional.",
              url: "https://www.quipper.com/id/courses/"
            }
          ]
        }
      ]
    }

    return weaknessesData.map((weakness) => {
      const category = weakness.category.toLowerCase()

      if (category.includes("algebra")) {
        return {
          category: weakness.category,
          resources: [
            {
              title: "Zenius Education - Aljabar",
              description:
                lang === "en"
                  ? "Algebra videos and practice exercises in Indonesian language."
                  : "Video dan latihan aljabar dalam bahasa Indonesia.",
              url: "https://www.zenius.net/pelajaran/matematika/aljabar"
            },
            {
              title: "Ruangguru - Aljabar",
              description:
                lang === "en"
                  ? "Indonesian platform with algebra lessons and interactive exercises."
                  : "Platform Indonesia dengan pelajaran aljabar dan latihan interaktif.",
              url: "https://www.ruangguru.com/"
            },
            {
              title:
                lang === "en"
                  ? "Khan Academy - Algebra"
                  : "Khan Academy - Aljabar",
              description:
                lang === "en"
                  ? "Learn algebra through interactive problems and instructional videos."
                  : "Pelajari aljabar melalui soal interaktif dan video pembelajaran.",
              url:
                lang === "en"
                  ? "https://www.khanacademy.org/math/algebra"
                  : "https://id.khanacademy.org/math/algebra"
            },
            {
              title: "Matematika Dasar - Tutorial Aljabar",
              description:
                lang === "en"
                  ? "Indonesian math website with algebra tutorials and examples."
                  : "Situs matematika Indonesia dengan tutorial aljabar dan contoh-contoh.",
              url: "https://www.matematikadasar.info/category/aljabar"
            }
          ]
        }
      } else if (category.includes("geometry")) {
        return {
          category: weakness.category,
          resources: [
            {
              title: "Zenius Education - Geometri",
              description:
                lang === "en"
                  ? "Geometry lessons with examples and practice problems in Indonesian language."
                  : "Pelajaran geometri dengan contoh dan soal latihan dalam bahasa Indonesia.",
              url: "https://www.zenius.net/pelajaran/matematika/geometri"
            },
            {
              title: "Quipper - Geometri",
              description:
                lang === "en"
                  ? "Indonesian platform with geometry lessons following the national curriculum."
                  : "Platform Indonesia dengan pelajaran geometri mengikuti kurikulum nasional.",
              url: "https://www.quipper.com/id/courses/"
            },
            {
              title:
                lang === "en"
                  ? "Khan Academy - Geometry"
                  : "Khan Academy - Geometri",
              description:
                lang === "en"
                  ? "Learn geometry through interactive problems and instructional videos."
                  : "Pelajari geometri melalui soal interaktif dan video pembelajaran.",
              url:
                lang === "en"
                  ? "https://www.khanacademy.org/math/geometry"
                  : "https://id.khanacademy.org/math/geometry"
            },
            {
              title: "GeoGebra",
              description:
                lang === "en"
                  ? "Interactive geometry tools with Indonesian language support."
                  : "Alat geometri interaktif dengan dukungan bahasa Indonesia.",
              url: "https://www.geogebra.org/?lang=id"
            }
          ]
        }
      } else if (category.includes("arithmetic")) {
        return {
          category: weakness.category,
          resources: [
            {
              title: "Ruangguru - Aritmatika",
              description:
                lang === "en"
                  ? "Indonesian platform with arithmetic lessons and practice."
                  : "Platform Indonesia dengan pelajaran dan latihan aritmatika.",
              url: "https://www.ruangguru.com/"
            },
            {
              title: "Zenius Education - Operasi Dasar Matematika",
              description:
                lang === "en"
                  ? "Basic arithmetic operations explained in Indonesian language."
                  : "Operasi dasar aritmatika dijelaskan dalam bahasa Indonesia.",
              url: "https://www.zenius.net/pelajaran/matematika/operasi-dasar"
            },
            {
              title:
                lang === "en"
                  ? "Khan Academy - Arithmetic"
                  : "Khan Academy - Aritmatika",
              description:
                lang === "en"
                  ? "Fundamental arithmetic operations and practice exercises."
                  : "Operasi aritmatika fundamental dan latihan praktik.",
              url:
                lang === "en"
                  ? "https://www.khanacademy.org/math/arithmetic"
                  : "https://id.khanacademy.org/math/arithmetic"
            },
            {
              title: "Math.id - Aritmatika",
              description:
                lang === "en"
                  ? "Indonesian math website with arithmetic lessons and problems."
                  : "Situs matematika Indonesia dengan pelajaran dan soal aritmatika.",
              url: "https://math.id/"
            }
          ]
        }
      } else if (category.includes("calculus")) {
        return {
          category: weakness.category,
          resources: [
            {
              title: "Zenius Education - Kalkulus",
              description:
                lang === "en"
                  ? "Calculus lessons and examples in Indonesian language."
                  : "Pelajaran dan contoh kalkulus dalam bahasa Indonesia.",
              url: "https://www.zenius.net/pelajaran/matematika/kalkulus"
            },
            {
              title: "Ruangguru - Kalkulus",
              description:
                lang === "en"
                  ? "Indonesian platform with calculus video tutorials."
                  : "Platform Indonesia dengan tutorial video kalkulus.",
              url: "https://www.ruangguru.com/"
            },
            {
              title:
                lang === "en"
                  ? "Khan Academy - Calculus"
                  : "Khan Academy - Kalkulus",
              description:
                lang === "en"
                  ? "Calculus concepts explained with practice problems."
                  : "Konsep kalkulus dijelaskan dengan soal latihan.",
              url:
                lang === "en"
                  ? "https://www.khanacademy.org/math/calculus-1"
                  : "https://id.khanacademy.org/math/calculus-1"
            },
            {
              title: "FMIPA UI - Tutorial Kalkulus",
              description:
                lang === "en"
                  ? "Calculus materials from University of Indonesia's Faculty of Mathematics."
                  : "Materi kalkulus dari Fakultas Matematika dan Ilmu Pengetahuan Alam Universitas Indonesia.",
              url: "https://scele.ui.ac.id/course/view.php?id=2120"
            }
          ]
        }
      } else {
        return {
          category: weakness.category,
          resources: [
            {
              title: "Zenius Education",
              description:
                lang === "en"
                  ? "Indonesian educational platform with comprehensive math lessons."
                  : "Platform pendidikan Indonesia dengan pelajaran matematika komprehensif.",
              url: "https://www.zenius.net/pelajaran/matematika"
            },
            {
              title: "Ruangguru",
              description:
                lang === "en"
                  ? "Indonesian learning platform with math courses and practice."
                  : "Platform belajar Indonesia dengan kursus matematika dan latihan.",
              url: "https://www.ruangguru.com/"
            },
            {
              title:
                lang === "en"
                  ? "Khan Academy - Mathematics"
                  : "Khan Academy - Matematika",
              description:
                lang === "en"
                  ? "Comprehensive math learning platform covering multiple topics."
                  : "Platform pembelajaran matematika komprehensif yang mencakup berbagai topik.",
              url:
                lang === "en"
                  ? "https://www.khanacademy.org/math"
                  : "https://id.khanacademy.org/math"
            }
          ]
        }
      }
    })
  }

  const analysis = results ? generateAnalysis() : null
  const recommendations = analysis?.weaknesses
    ? generateRecommendations(analysis.weaknesses)
    : []
  const learningResources = analysis?.weaknesses
    ? generateLearningResources(analysis.weaknesses)
    : generateLearningResources([])

  // Calculate mastery level based on performance
  const calculateMasteryLevel = (percentCorrect: number) => {
    if (percentCorrect >= 90)
      return pageTranslations.detailedAnalysis.masteryLevels.excellent
    if (percentCorrect >= 75)
      return pageTranslations.detailedAnalysis.masteryLevels.good
    if (percentCorrect >= 60)
      return pageTranslations.detailedAnalysis.masteryLevels.satisfactory
    if (percentCorrect >= 40)
      return pageTranslations.detailedAnalysis.masteryLevels.needsImprovement
    return pageTranslations.detailedAnalysis.masteryLevels.struggling
  }

  // Get overall mastery level
  const getOverallMasteryLevel = () => {
    if (!results) return ""
    const percentage = (results.totalScore / results.totalQuestions) * 100
    return calculateMasteryLevel(percentage)
  }

  // Identify frequent mistakes patterns
  const identifyFrequentMistakes = () => {
    if (!results || !questions || !results.answers) return []

    const categoryMistakes: Record<string, number> = {
      algebra: 0,
      geometry: 0,
      arithmetic: 0,
      calculus: 0
    }

    // Count mistakes by category
    questions.forEach((question, index) => {
      if (results.answers?.[index.toString()] !== question.correctAnswer) {
        categoryMistakes[question.category] += 1
      }
    })

    // Convert to array and sort by frequency
    const sortedMistakes = Object.entries(categoryMistakes)
      .filter((entry) => entry[1] > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => {
        const categoryKey = category as keyof typeof results.categories
        const totalInCategory = results.categories[categoryKey].total
        const mistakeRate = (count / totalInCategory) * 100

        // Get translated category name
        const categoryMap: Record<string, string> = {
          algebra: lang === "en" ? "Algebra" : "Aljabar",
          geometry: lang === "en" ? "Geometry" : "Geometri",
          arithmetic: lang === "en" ? "Arithmetic" : "Aritmatika",
          calculus: lang === "en" ? "Calculus" : "Kalkulus"
        }

        return {
          category: categoryMap[category] || category,
          count,
          rate: mistakeRate
        }
      })

    return sortedMistakes
  }

  return (
    <div className="p-8 pb-20 sm:p-20">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-card p-8 rounded-xl shadow-md border border-border mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary font-heading">
              {pageTranslations.title}
            </h1>
            <div className="text-sm text-muted-foreground">
              {formatDate(results.timestamp)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-primary/5 p-6 rounded-lg text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2 font-heading">
                {pageTranslations.studentName}
              </h3>
              <p className="text-2xl font-bold">{name}</p>
            </div>

            <div className="bg-primary/5 p-6 rounded-lg text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2 font-heading">
                {pageTranslations.score}
              </h3>
              <p className="text-2xl font-bold">
                {results.totalScore} / {results.totalQuestions}
              </p>
            </div>

            <div className="bg-primary/5 p-6 rounded-lg text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2 font-heading">
                {pageTranslations.percentage}
              </h3>
              <p className="text-2xl font-bold">{percentage}%</p>
            </div>
          </div>

          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-1 mb-2 text-xs font-medium rounded bg-primary/10 text-primary">
              {pageTranslations.detailedAnalysis.mastery}
            </div>
            <h2 className="text-3xl font-bold font-heading">
              {getOverallMasteryLevel()}
            </h2>
            <div className="mt-2 text-sm text-muted-foreground">
              {percentage}% {lang === "en" ? "correct" : "benar"}
            </div>
          </div>

          <div className="mb-12 bg-primary/5 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-6 font-heading">
              {pageTranslations.overview.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">
                  {pageTranslations.overview.strengths}
                </h3>

                {analysis && analysis.strengths.length > 0 ? (
                  <ul className="space-y-2 list-disc pl-5">
                    {analysis.strengths.map((strength, index) => (
                      <li
                        key={index}
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {strength.category} ({Math.round(strength.percent)}%)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    {pageTranslations.overview.noStrengths}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-600 dark:text-orange-400">
                  {pageTranslations.overview.weaknesses}
                </h3>

                {analysis && analysis.weaknesses.length > 0 ? (
                  <ul className="space-y-2 list-disc pl-5">
                    {analysis.weaknesses.map((weakness, index) => (
                      <li
                        key={index}
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {weakness.category} ({Math.round(weakness.percent)}%)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    {pageTranslations.overview.noWeaknesses}
                  </p>
                )}
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">
                  {pageTranslations.overview.recommendations}
                </h3>

                <ul className="space-y-3 list-disc pl-5">
                  {recommendations.map((recommendation, index) => (
                    <li
                      key={index}
                      className="text-gray-700 dark:text-gray-300"
                    >
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold font-heading">
                {pageTranslations.learningResources.title}
              </h2>
            </div>
            <p className="mb-4 text-gray-600 dark:text-gray-400 text-sm">
              {pageTranslations.learningResources.description}
            </p>

            <Accordion type="single" collapsible className="w-full">
              {learningResources.map((categoryResources, categoryIndex) => (
                <AccordionItem
                  key={categoryIndex}
                  value={`category-${categoryIndex}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg mb-3 overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 bg-primary/5 hover:bg-primary/10 hover:no-underline">
                    <span className="font-medium">
                      {categoryResources.category}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="p-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
                      {categoryResources.resources.map(
                        (resource, resourceIndex) => (
                          <a
                            key={resourceIndex}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                          >
                            <h4 className="font-medium text-base mb-1 text-primary">
                              {resource.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 flex-grow mb-2 line-clamp-2">
                              {resource.description}
                            </p>
                            <div className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 mt-auto">
                              {pageTranslations.learningResources.visitResource}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 ml-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </div>
                          </a>
                        )
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mb-12 text-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Search className="mr-2 h-5 w-5" />
                  {pageTranslations.detailedAnalysis.showDetails}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold mb-6">
                    {pageTranslations.detailedAnalysis.title}
                  </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="mistakes" className="mb-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mistakes">
                      {pageTranslations.detailedAnalysis.frequentMistakes}
                    </TabsTrigger>
                    <TabsTrigger value="questions">
                      {pageTranslations.detailedAnalysis.questionAnalysis}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="mistakes">
                    <div className="bg-primary/5 p-5 rounded-lg">
                      <div className="grid gap-4">
                        {identifyFrequentMistakes().length > 0 ? (
                          identifyFrequentMistakes().map((mistake, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm"
                            >
                              <div>
                                <span className="font-medium">
                                  {mistake.category}
                                </span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  ({Math.round(mistake.rate)}%{" "}
                                  {lang === "en"
                                    ? "error rate"
                                    : "tingkat kesalahan"}
                                  )
                                </span>
                              </div>
                              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                  className="bg-orange-500 h-2.5 rounded-full"
                                  style={{ width: `${mistake.rate}%` }}
                                ></div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-600 dark:text-gray-400 italic">
                            {lang === "en"
                              ? "No significant mistake patterns identified or no answer data available."
                              : "Tidak ada pola kesalahan signifikan yang teridentifikasi atau tidak ada data jawaban tersedia."}
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="questions">
                    <div className="space-y-4">
                      {questions && questions.length > 0 && results?.answers ? (
                        questions.map((question, index) => {
                          // Pastikan results dan answers ada sebelum mencoba akses
                          const idx = index.toString()
                          const userAnswer =
                            results?.answers?.[idx] || "No answer"
                          const isCorrect =
                            userAnswer === question.correctAnswer

                          return (
                            <div
                              key={index}
                              className={`border ${
                                isCorrect
                                  ? "border-green-200 bg-green-50 dark:bg-green-900/10"
                                  : "border-red-200 bg-red-50 dark:bg-red-900/10"
                              } rounded-lg p-4`}
                            >
                              <div className="flex justify-between mb-3">
                                <span className="font-semibold">
                                  {pageTranslations.detailedAnalysis.question}{" "}
                                  {index + 1}
                                </span>
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full ${
                                    isCorrect
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  }`}
                                >
                                  {isCorrect
                                    ? pageTranslations.detailedAnalysis.correct
                                    : pageTranslations.detailedAnalysis
                                        .incorrect}
                                </span>
                              </div>

                              <div className="mb-3 font-medium">
                                <MathJax math={question.text} />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                                <div>
                                  <span className="text-sm text-muted-foreground block mb-1">
                                    {
                                      pageTranslations.detailedAnalysis
                                        .yourAnswer
                                    }
                                    :
                                  </span>
                                  <span
                                    className={`block p-2 rounded ${
                                      isCorrect
                                        ? "bg-green-100 dark:bg-green-900/20"
                                        : "bg-red-100 dark:bg-red-900/20"
                                    }`}
                                  >
                                    <MathJax math={userAnswer} />
                                  </span>
                                </div>

                                {!isCorrect && (
                                  <div>
                                    <span className="text-sm text-muted-foreground block mb-1">
                                      {
                                        pageTranslations.detailedAnalysis
                                          .correctAnswer
                                      }
                                      :
                                    </span>
                                    <span className="block p-2 bg-green-100 dark:bg-green-900/20 rounded">
                                      <MathJax math={question.correctAnswer} />
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    {pageTranslations.detailedAnalysis.category}
                                    :
                                  </span>{" "}
                                  {categoryTranslations[question.category]}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    {
                                      pageTranslations.detailedAnalysis
                                        .difficulty
                                    }
                                    :
                                  </span>{" "}
                                  {difficultyTranslations[question.difficulty]}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-10">
                          <div className="bg-primary/5 p-8 rounded-lg mb-4">
                            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                              {lang === "en"
                                ? "Question data couldn't be loaded. This may happen if you're viewing a previous assessment or if the question data has been reset."
                                : "Data pertanyaan tidak dapat dimuat. Ini mungkin terjadi jika Anda melihat penilaian sebelumnya atau jika data pertanyaan telah diatur ulang."}
                            </p>
                            <Button
                              variant="outline"
                              onClick={() => router.push("/assessment/start")}
                              className="mx-auto"
                            >
                              {lang === "en"
                                ? "Retake Assessment"
                                : "Ambil Ulang Penilaian"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-primary/5 p-4 rounded-lg">
                <h2 className="text-lg font-bold mb-3 font-heading">
                  {pageTranslations.performanceByCategory}
                </h2>
                <div className="h-48">
                  <Bar
                    data={categoryData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                          labels: {
                            boxWidth: 12,
                            font: {
                              size: 11
                            }
                          }
                        },
                        tooltip: {
                          titleFont: {
                            size: 11
                          },
                          bodyFont: {
                            size: 11
                          }
                        }
                      },
                      scales: {
                        x: {
                          stacked: true,
                          ticks: {
                            font: {
                              size: 10
                            }
                          }
                        },
                        y: {
                          stacked: true,
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                            font: {
                              size: 10
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg">
                <h2 className="text-lg font-bold mb-3 font-heading">
                  {pageTranslations.performanceByDifficulty}
                </h2>
                <div className="h-48">
                  <Bar
                    data={difficultyData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                          labels: {
                            boxWidth: 12,
                            font: {
                              size: 11
                            }
                          }
                        },
                        tooltip: {
                          titleFont: {
                            size: 11
                          },
                          bodyFont: {
                            size: 11
                          }
                        }
                      },
                      scales: {
                        x: {
                          stacked: true,
                          ticks: {
                            font: {
                              size: 10
                            }
                          }
                        },
                        y: {
                          stacked: true,
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                            font: {
                              size: 10
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
              <Button
                onClick={() => router.push("/assessment/start")}
                size="lg"
              >
                {pageTranslations.retake}
              </Button>
              <ShareResults
                studentName={name}
                lang={lang as "en" | "id"}
                score={results.totalScore}
                totalQuestions={results.totalQuestions}
                strengthCategories={
                  analysis?.strengths.map((s) => s.category) || []
                }
                timestamp={results.timestamp}
                results={results}
              />
            </div>
            <p className="text-muted-foreground mt-4">
              {pageTranslations.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
