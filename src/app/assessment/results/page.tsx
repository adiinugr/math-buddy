"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import ResultsLayout from "@/components/ResultsLayout"

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  category: string
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
      },
      {
        title: "Math is Fun - Inequalities",
        url: "https://www.mathsisfun.com/algebra/inequality.html",
        description:
          "Introduction to inequalities with examples and practice problems."
      }
    ],
    functions: [
      {
        title: "Ruang Guru - Fungsi",
        url: "https://www.ruangguru.com/blog/matematika-kelas-10-fungsi",
        description: "Pembahasan lengkap tentang fungsi, domain, dan range."
      },
      {
        title: "Zenius - Fungsi",
        url: "https://www.zenius.net/blog/fungsi",
        description: "Video pembelajaran fungsi matematika dengan contoh soal."
      },
      {
        title: "Khan Academy - Functions",
        url: "https://www.khanacademy.org/math/algebra/functions",
        description:
          "Comprehensive guide to understanding functions and their properties."
      },
      {
        title: "Math is Fun - Functions",
        url: "https://www.mathsisfun.com/sets/function.html",
        description: "Introduction to functions with interactive examples."
      }
    ],
    polynomials: [
      {
        title: "Ruang Guru - Polinomial",
        url: "https://www.ruangguru.com/blog/matematika-kelas-11-polinomial",
        description: "Materi lengkap tentang polinomial dan operasinya."
      },
      {
        title: "Zenius - Polinomial",
        url: "https://www.zenius.net/blog/polinomial",
        description: "Video pembelajaran polinomial dengan contoh soal."
      },
      {
        title: "Khan Academy - Polynomials",
        url: "https://www.khanacademy.org/math/algebra/polynomials",
        description:
          "Learn about polynomial expressions, operations, and factoring."
      },
      {
        title: "Math is Fun - Polynomials",
        url: "https://www.mathsisfun.com/algebra/polynomials.html",
        description:
          "Introduction to polynomials with examples and practice problems."
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
        title: "Quipper - Persamaan Kuadrat",
        url: "https://www.quipper.com/id/blog/mapel/matematika/persamaan-kuadrat/",
        description: "Penjelasan konsep persamaan kuadrat beserta contoh soal."
      },
      {
        title: "Khan Academy - Quadratic Equations",
        url: "https://www.khanacademy.org/math/algebra/quadratics",
        description:
          "Learn how to solve quadratic equations and understand their graphs."
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
        title: "Quipper - Geometri",
        url: "https://www.quipper.com/id/blog/mapel/matematika/geometri/",
        description: "Materi dasar geometri untuk siswa SMA dan contoh soalnya."
      },
      {
        title: "Khan Academy - Geometry",
        url: "https://www.khanacademy.org/math/geometry",
        description: "Learn about shapes, angles, and geometric proofs."
      }
    ],
    circles: [
      {
        title: "Ruang Guru - Lingkaran",
        url: "https://www.ruangguru.com/blog/matematika-lingkaran",
        description: "Materi lengkap tentang lingkaran dan sifat-sifatnya."
      },
      {
        title: "Zenius - Lingkaran",
        url: "https://www.zenius.net/blog/lingkaran",
        description:
          "Video pembelajaran tentang konsep lingkaran dan penerapannya."
      },
      {
        title: "Quipper - Lingkaran",
        url: "https://www.quipper.com/id/blog/mapel/matematika/lingkaran/",
        description:
          "Penjelasan lengkap tentang konsep lingkaran dan rumus-rumusnya."
      },
      {
        title: "Khan Academy - Circles",
        url: "https://www.khanacademy.org/math/geometry/hs-geo-circles",
        description: "Comprehensive lessons on circle geometry and properties."
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
        title: "Quipper - Konsep Aljabar",
        url: "https://www.quipper.com/id/blog/mapel/matematika/konsep-aljabar/",
        description:
          "Penjelasan konsep dasar aljabar beserta contoh soal dan pembahasan."
      },
      {
        title: "Khan Academy - Algebra",
        url: "https://www.khanacademy.org/math/algebra",
        description: "Complete algebra course covering all essential topics."
      }
    ],
    calculus: [
      {
        title: "Ruang Guru - Kalkulus",
        url: "https://www.ruangguru.com/blog/matematika-kelas-12-kalkulus",
        description: "Materi lengkap kalkulus dasar untuk siswa SMA."
      },
      {
        title: "Zenius - Kalkulus",
        url: "https://www.zenius.net/blog/kalkulus",
        description: "Video pembelajaran kalkulus dengan contoh soal."
      },
      {
        title: "Quipper - Kalkulus",
        url: "https://www.quipper.com/id/blog/mapel/matematika/kalkulus-dasar/",
        description: "Konsep dasar kalkulus dan aplikasinya dalam matematika."
      },
      {
        title: "Khan Academy - Calculus",
        url: "https://www.khanacademy.org/math/calculus-1",
        description: "Introduction to calculus concepts and applications."
      }
    ],
    trigonometry: [
      {
        title: "Ruang Guru - Trigonometri",
        url: "https://www.ruangguru.com/blog/matematika-kelas-10-trigonometri",
        description: "Penjelasan dasar-dasar trigonometri dengan contoh soal."
      },
      {
        title: "Zenius - Fungsi Trigonometri",
        url: "https://www.zenius.net/materi-belajar/matematika/trigonometri",
        description: "Video pembelajaran dan latihan soal fungsi trigonometri."
      },
      {
        title: "Quipper - Trigonometri",
        url: "https://www.quipper.com/id/blog/mapel/matematika/trigonometri/",
        description: "Konsep dasar trigonometri dan rumus-rumus dasarnya."
      },
      {
        title: "Khan Academy - Trigonometry",
        url: "https://www.khanacademy.org/math/trigonometry",
        description:
          "Comprehensive lessons on trigonometric functions and identities."
      }
    ],
    probability: [
      {
        title: "Ruang Guru - Statistika dan Peluang",
        url: "https://www.ruangguru.com/blog/matematika-kelas-11-statistika-peluang",
        description:
          "Materi lengkap dan pembahasan soal statistika dan peluang."
      },
      {
        title: "Zenius - Peluang dan Statistika",
        url: "https://www.zenius.net/materi-belajar/matematika/peluang",
        description: "Video pembelajaran dan latihan soal peluang."
      },
      {
        title: "Quipper - Peluang",
        url: "https://www.quipper.com/id/blog/mapel/matematika/peluang/",
        description: "Materi dasar peluang dengan contoh soal dan pembahasan."
      },
      {
        title: "Khan Academy - Probability",
        url: "https://www.khanacademy.org/math/statistics-probability",
        description: "Learn about probability concepts and applications."
      }
    ]
  }

  // Handle undefined subcategory
  if (subcategory === "undefined") {
    // Default to general algebra resources as a fallback
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

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const participantId =
          urlParams.get("participantId") ||
          localStorage.getItem("participantId")

        if (!participantId) {
          console.error("No participant ID found")
          router.push("/assessment/start")
          return
        }

        const response = await fetch(
          `/api/quizzes/result?participantId=${participantId}`
        )
        if (!response.ok) {
          throw new Error("Failed to fetch results")
        }

        const data = await response.json()

        // Get student name from localStorage if available
        const studentName =
          localStorage.getItem("studentName") || "Anonymous Student"

        // Add student name to result object
        setResult({
          ...data,
          studentName
        })
      } catch (error) {
        console.error("Error fetching results:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Memuat Hasil...</h2>
          <p>Mohon tunggu sementara kami mengambil hasil penilaian Anda.</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Hasil Tidak Ditemukan</h2>
          <p>Kami tidak dapat menemukan hasil penilaian Anda.</p>
          <Button
            className="mt-4"
            onClick={() => router.push("/assessment/start")}
          >
            Mulai Penilaian Baru
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ResultsLayout
      result={result}
      resourcesFunction={getLearningResources}
      title="Hasil Penilaian"
      backUrl="/"
      backLabel="Kembali ke Beranda"
    />
  )
}
