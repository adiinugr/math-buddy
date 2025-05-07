"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import ResultsLayout from "@/components/ResultsLayout"
import Breadcrumbs from "@/components/breadcrumbs"

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
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

// Learning resources function
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

export default function StudentResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchResult()
  }, [])

  const fetchResult = async () => {
    try {
      // Get participant ID from localStorage
      const participantId = localStorage.getItem("liveQuizParticipantId")

      if (!participantId) {
        setError("No participant ID found. Please complete the quiz first.")
        setLoading(false)
        return
      }

      const response = await fetch(
        `/api/quizzes/live-result?participantId=${participantId}`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch results")
      }

      const data = await response.json()

      // Get student name from localStorage if available
      const studentName =
        localStorage.getItem("studentName") ||
        localStorage.getItem("quizStudentName") ||
        "Anonymous Student"

      // Add student name to result object
      setResult({
        ...data,
        studentName
      })
    } catch (error) {
      console.error("Error fetching results:", error)
      setError("Failed to load quiz results")
      toast.error("Failed to load quiz results")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="container max-w-2xl mx-auto">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: "Join", href: "/join" },
                { label: "Live Quiz", href: "/quizzes/[id]/live/student" },
                { label: "Results", current: true }
              ]}
            />
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="container max-w-2xl mx-auto">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: "Join", href: "/join" },
                { label: "Live Quiz", href: "/quizzes/[id]/live/student" },
                { label: "Results", current: true }
              ]}
            />
          </div>
          <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => router.push("/")}>Return to Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="container max-w-2xl mx-auto">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: "Join", href: "/join" },
                { label: "Live Quiz", href: "/quizzes/[id]/live/student" },
                { label: "Results", current: true }
              ]}
            />
          </div>
          <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>No Results Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                We could not find your quiz results.
              </p>
              <Button onClick={() => router.push("/")}>Return to Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="container max-w-7xl mx-auto">
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: "Join", href: "/join" },
              { label: "Live Quiz", href: "/quizzes/[id]/live/student" },
              { label: "Results", current: true }
            ]}
          />
        </div>
        <ResultsLayout
          result={result}
          resourcesFunction={getLearningResources}
          title="Quiz Results"
          backUrl="/"
          backLabel="Return to Home"
        />
      </div>
    </div>
  )
}
