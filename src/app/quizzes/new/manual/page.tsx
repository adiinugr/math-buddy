"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Save, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { LatexEditor } from "@/components/latex-editor"

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
}

export default function ManualQuizPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quizType = (searchParams.get("type") as "live" | "assessment") || "live"
  const isGenerated = searchParams.get("generated") === "true"

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", text: "", options: ["", "", "", ""], correctAnswer: 0 }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isGenerated) {
      const generatedQuiz = localStorage.getItem("generatedQuiz")
      if (generatedQuiz) {
        try {
          const quiz = JSON.parse(generatedQuiz)
          setTitle(quiz.title)
          setDescription(quiz.description)
          setQuestions(quiz.questions)
          localStorage.removeItem("generatedQuiz")
        } catch (error) {
          console.error("Error parsing generated quiz:", error)
          toast.error("Failed to load generated quiz")
        }
      }
    }
  }, [isGenerated])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: (questions.length + 1).toString(),
        text: "",
        options: ["", "", "", ""],
        correctAnswer: 0
      }
    ])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const updateQuestion = (
    id: string,
    field: keyof Question,
    value: string | string[] | number
  ) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    )
  }

  const handleSubmit = async () => {
    if (isSubmitting) return // Prevent duplicate submissions

    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }

    if (questions.some((q) => !q.text.trim())) {
      toast.error("Please fill in all questions")
      return
    }

    if (questions.some((q) => q.options.some((o) => !o.trim()))) {
      toast.error("Please fill in all options")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          questions,
          type: quizType
        })
      })

      if (!response.ok) {
        throw new Error("Failed to save quiz")
      }

      toast.success("Quiz saved successfully")
      router.push("/quizzes")
    } catch (error) {
      console.error("Error saving quiz:", error)
      toast.error("Failed to save quiz. Please try again.")
      setIsSubmitting(false) // Only reset on error, as we're redirecting on success
    }
  }

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex flex-col gap-8 items-center w-full max-w-4xl mx-auto relative">
        <div className="w-full backdrop-blur-lg bg-white/30 p-6 rounded-xl border border-white/20 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 font-heading">
              Create {quizType === "live" ? "Live Quiz" : "Assessment"} Manually
            </h2>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {quizType === "live" ? "Save Live Quiz" : "Save Assessment"}
                </>
              )}
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <LatexEditor
                value={title}
                onChange={setTitle}
                placeholder="Enter quiz title (e.g., Algebra Quiz: $ax^2 + bx + c = 0$)"
                className="border border-gray-400 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <LatexEditor
                value={description}
                onChange={setDescription}
                placeholder="Enter quiz description (e.g., Test your knowledge of quadratic equations $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$)"
                className="border border-gray-400 rounded-md"
              />
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card
                  key={question.id}
                  className="bg-white/50 border-gray-200/50"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">
                        Question {index + 1}
                      </h3>
                      {questions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Text
                        </label>
                        <LatexEditor
                          value={question.text}
                          onChange={(value) =>
                            updateQuestion(question.id, "text", value)
                          }
                          placeholder="Enter question text with LaTeX equations (e.g., Solve for x: $2x^2 + 5x - 3 = 0$)"
                          className="border border-gray-400 rounded-md"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Options
                        </label>
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() =>
                                updateQuestion(
                                  question.id,
                                  "correctAnswer",
                                  optionIndex
                                )
                              }
                              className="h-4 w-4 text-blue-600"
                            />
                            <LatexEditor
                              value={option}
                              onChange={(value) => {
                                const newOptions = [...question.options]
                                newOptions[optionIndex] = value
                                updateQuestion(
                                  question.id,
                                  "options",
                                  newOptions
                                )
                              }}
                              placeholder={`Option ${
                                optionIndex + 1
                              } (e.g., $x = 1$ or $x = -3$)`}
                              className="border border-gray-400 rounded-md"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                onClick={addQuestion}
                variant="outline"
                className="w-full bg-white/50 border-gray-200/50 hover:bg-white/70"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
