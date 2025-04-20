"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/hooks/useTranslation"
import { Button } from "@/components/ui/button"
import { MathJax } from "@/components/MathJax"

// Define the question types
type Question = {
  id: number
  text: string
  latex?: boolean // Flag untuk mengidentifikasi jika pertanyaan menggunakan LaTeX
  options: string[]
  optionsLatex?: boolean // Flag untuk mengidentifikasi jika opsi jawaban menggunakan LaTeX
  correctAnswer: string
  category: "algebra" | "geometry" | "arithmetic" | "calculus"
  difficulty: "easy" | "medium" | "hard"
}

// Sample questions with LaTeX
const mathQuestions: Question[] = [
  {
    id: 1,
    text: "Solve for x: 2x + 5 = 13",
    options: ["x = 3", "x = 4", "x = 8", "x = 9"],
    correctAnswer: "x = 4",
    category: "algebra",
    difficulty: "easy"
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
    category: "geometry",
    difficulty: "easy"
  },
  {
    id: 3,
    text: "Simplify: (3 × 4) + (6 ÷ 2)",
    options: ["15", "24", "18", "21"],
    correctAnswer: "15",
    category: "arithmetic",
    difficulty: "easy"
  },
  {
    id: 4,
    text: "Find the derivative of f(x) = x² + 3x",
    options: [
      "f'(x) = 2x + 3",
      "f'(x) = x² + 3",
      "f'(x) = 2x",
      "f'(x) = x + 3"
    ],
    correctAnswer: "f'(x) = 2x + 3",
    category: "calculus",
    difficulty: "medium"
  },
  {
    id: 5,
    text: "Solve the inequality: 2x - 7 > 5",
    options: ["x > 6", "x > 5", "x < 6", "x < 5"],
    correctAnswer: "x > 6",
    category: "algebra",
    difficulty: "medium"
  },
  {
    id: 6,
    text: "In a right triangle, if one leg is 5 units and the hypotenuse is 13 units, what is the length of the other leg?",
    options: ["8 units", "10 units", "12 units", "11 units"],
    correctAnswer: "12 units",
    category: "geometry",
    difficulty: "medium"
  },
  {
    id: 7,
    text: "What is the result of \\sqrt{25} + \\sqrt{16}?",
    options: ["9", "41", "10", "11"],
    correctAnswer: "9",
    category: "arithmetic",
    difficulty: "easy"
  },
  {
    id: 8,
    text: "If f(x) = 2x³ - 4x, find f'(1)",
    options: ["2", "6", "8", "10"],
    correctAnswer: "6",
    category: "calculus",
    difficulty: "hard"
  },
  {
    id: 9,
    text: "Factor the expression: x^2 - 9",
    options: ["(x + 3)(x - 3)", "(x + 9)(x - 9)", "(x + 3)^2", "(x - 3)^2"],
    optionsLatex: true,
    correctAnswer: "(x + 3)(x - 3)",
    category: "algebra",
    difficulty: "medium"
  },
  {
    id: 10,
    text: "What is the volume of a cube with side length 3 units?",
    options: [
      "9 cubic units",
      "27 cubic units",
      "18 cubic units",
      "12 cubic units"
    ],
    correctAnswer: "27 cubic units",
    category: "geometry",
    difficulty: "easy"
  }
]

// Indonesian translation of the questions with LaTeX
const mathQuestionsId: Question[] = [
  {
    id: 1,
    text: "Selesaikan x: 2x + 5 = 13",
    options: ["x = 3", "x = 4", "x = 8", "x = 9"],
    correctAnswer: "x = 4",
    category: "algebra",
    difficulty: "easy"
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
    category: "geometry",
    difficulty: "easy"
  },
  {
    id: 3,
    text: "Sederhanakan: (3 × 4) + (6 ÷ 2)",
    options: ["15", "24", "18", "21"],
    correctAnswer: "15",
    category: "arithmetic",
    difficulty: "easy"
  },
  {
    id: 4,
    text: "Tentukan turunan dari f(x) = x² + 3x",
    options: [
      "f'(x) = 2x + 3",
      "f'(x) = x² + 3",
      "f'(x) = 2x",
      "f'(x) = x + 3"
    ],
    correctAnswer: "f'(x) = 2x + 3",
    category: "calculus",
    difficulty: "medium"
  },
  {
    id: 5,
    text: "Selesaikan pertidaksamaan: 2x - 7 > 5",
    options: ["x > 6", "x > 5", "x < 6", "x < 5"],
    correctAnswer: "x > 6",
    category: "algebra",
    difficulty: "medium"
  },
  {
    id: 6,
    text: "Dalam segitiga siku-siku, jika satu sisi adalah 5 satuan dan sisi miring adalah 13 satuan, berapa panjang sisi lainnya?",
    options: ["8 satuan", "10 satuan", "12 satuan", "11 satuan"],
    correctAnswer: "12 satuan",
    category: "geometry",
    difficulty: "medium"
  },
  {
    id: 7,
    text: "Berapa hasil dari \\sqrt{25} + \\sqrt{16}?",
    options: ["9", "41", "10", "11"],
    correctAnswer: "9",
    category: "arithmetic",
    difficulty: "easy"
  },
  {
    id: 8,
    text: "Jika f(x) = 2x³ - 4x, tentukan f'(1)",
    options: ["2", "6", "8", "10"],
    correctAnswer: "6",
    category: "calculus",
    difficulty: "hard"
  },
  {
    id: 9,
    text: "Faktorkan ekspresi: x^2 - 9",
    options: ["(x + 3)(x - 3)", "(x + 9)(x - 9)", "(x + 3)^2", "(x - 3)^2"],
    optionsLatex: true,
    correctAnswer: "(x + 3)(x - 3)",
    category: "algebra",
    difficulty: "medium"
  },
  {
    id: 10,
    text: "Berapa volume kubus dengan panjang sisi 3 satuan?",
    options: [
      "9 satuan kubik",
      "27 satuan kubik",
      "18 satuan kubik",
      "12 satuan kubik"
    ],
    correctAnswer: "27 satuan kubik",
    category: "geometry",
    difficulty: "easy"
  }
]

export default function QuestionsPage() {
  const router = useRouter()
  const { lang } = useTranslation()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")

  // Select questions based on language
  const questions = lang === "en" ? mathQuestions : mathQuestionsId

  useEffect(() => {
    // Check if user has entered their name
    const studentName = localStorage.getItem("studentName")
    if (!studentName) {
      router.push("/assessment/start")
      return
    }

    setName(studentName)
    setLoading(false)
  }, [router])

  const handleAnswer = (option: string) => {
    // Record answer
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: option
    }))

    // Move to next question or results
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      // Calculate results and redirect
      const results = calculateResults()
      localStorage.setItem("assessmentResults", JSON.stringify(results))
      router.push("/assessment/results")
    }
  }

  const calculateResults = () => {
    const categories = {
      algebra: { correct: 0, total: 0 },
      geometry: { correct: 0, total: 0 },
      arithmetic: { correct: 0, total: 0 },
      calculus: { correct: 0, total: 0 }
    }

    const difficulties = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 }
    }

    let totalCorrect = 0

    questions.forEach((question, index) => {
      const userAnswer = answers[index]
      const isCorrect = userAnswer === question.correctAnswer

      // Update category stats
      categories[question.category].total += 1
      if (isCorrect) {
        categories[question.category].correct += 1
        totalCorrect += 1
      }

      // Update difficulty stats
      difficulties[question.difficulty].total += 1
      if (isCorrect) {
        difficulties[question.difficulty].correct += 1
      }
    })

    return {
      totalScore: totalCorrect,
      totalQuestions: questions.length,
      categories,
      difficulties,
      answers,
      timestamp: new Date().toISOString()
    }
  }

  // Map category names for translation display
  const categoryTranslations = {
    algebra: lang === "en" ? "Algebra" : "Aljabar",
    geometry: lang === "en" ? "Geometry" : "Geometri",
    arithmetic: lang === "en" ? "Arithmetic" : "Aritmatika",
    calculus: lang === "en" ? "Calculus" : "Kalkulus"
  }

  // Map difficulty levels for translation display
  const difficultyTranslations = {
    easy: lang === "en" ? "Easy" : "Mudah",
    medium: lang === "en" ? "Medium" : "Sedang",
    hard: lang === "en" ? "Hard" : "Sulit"
  }

  // Set page translations
  const pageTranslations = {
    title: lang === "en" ? "Mathematics Assessment" : "Penilaian Matematika",
    loading: lang === "en" ? "Loading..." : "Memuat...",
    loadingDescription:
      lang === "en"
        ? "Please wait while we prepare your questions"
        : "Mohon tunggu sementara kami menyiapkan pertanyaan Anda",
    questionCount:
      lang === "en"
        ? `Question ${currentQuestion + 1} of ${questions.length}`
        : `Pertanyaan ${currentQuestion + 1} dari ${questions.length}`,
    answeringAs: lang === "en" ? "Answering as" : "Menjawab sebagai"
  }

  if (loading) {
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

  const question = questions[currentQuestion]

  return (
    <div className="p-8 pb-20 sm:p-20">
      <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
        <div className="w-full bg-card p-8 rounded-xl shadow-md border border-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary font-heading">
              {pageTranslations.title}
            </h2>
            <div className="text-sm text-muted-foreground">
              {pageTranslations.questionCount}
            </div>
          </div>

          <div className="mb-8">
            <div className="h-2 w-full bg-muted rounded-full">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`
                }}
              ></div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-primary/5 rounded-lg">
              {question.id === 7 ? (
                <div className="text-lg font-medium">
                  {lang === "en" ? (
                    <>
                      What is the result of{" "}
                      <MathJax math="\sqrt{25} + \sqrt{16}" />?
                    </>
                  ) : (
                    <>
                      Berapa hasil dari <MathJax math="\sqrt{25} + \sqrt{16}" />
                      ?
                    </>
                  )}
                </div>
              ) : question.id === 9 ? (
                <div className="text-lg font-medium">
                  {lang === "en" ? (
                    <>
                      Factor the expression: <MathJax math="x^2 - 9" />
                    </>
                  ) : (
                    <>
                      Faktorkan ekspresi: <MathJax math="x^2 - 9" />
                    </>
                  )}
                </div>
              ) : question.latex ? (
                <div className="text-lg font-medium">
                  <MathJax math={question.text} />
                </div>
              ) : (
                <p className="text-lg font-medium">{question.text}</p>
              )}
            </div>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full p-4 justify-start h-auto text-left border border-border rounded-lg hover:bg-primary"
                  onClick={() => handleAnswer(option)}
                >
                  <span className="inline-block w-6 h-6 mr-3 rounded-full bg-primary/10 text-center text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {question.id === 9 && question.optionsLatex ? (
                    <MathJax math={option} />
                  ) : question.optionsLatex ? (
                    <MathJax math={option} />
                  ) : (
                    option
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {pageTranslations.answeringAs}{" "}
              <span className="font-medium text-foreground">{name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {categoryTranslations[question.category]} -{" "}
              {difficultyTranslations[question.difficulty]}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
