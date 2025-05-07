"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Loader2,
  Plus,
  Trash2,
  ArrowRight,
  SquareDot,
  BookOpen
} from "lucide-react"
import { LatexEditor } from "@/components/latex-editor"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
}

interface Quiz {
  id: string
  title: string
  description: string | null
  questions: Question[]
}

export default function EditQuizPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    fetchQuiz()
  }, [status, router, fetchQuiz])

  const updateQuestion = (
    index: number,
    field: keyof Question,
    value: string | string[] | number
  ) => {
    if (!quiz) return

    const newQuestions = [...quiz.questions]
    if (field === "options") {
      newQuestions[index].options = value as string[]
    } else {
      newQuestions[index] = { ...newQuestions[index], [field]: value }
    }
    setQuiz({ ...quiz, questions: newQuestions })
  }

  const addQuestion = () => {
    if (!quiz) return

    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          id: Date.now().toString(),
          text: "",
          options: ["", "", "", ""],
          correctAnswer: 0
        }
      ]
    })
  }

  const removeQuestion = (index: number) => {
    if (!quiz) return

    setQuiz({
      ...quiz,
      questions: quiz.questions.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quiz) return

    setSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/quizzes/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: quiz.title,
          description: quiz.description,
          questions: quiz.questions.map((q, index) => ({
            id: q.id,
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            order: index
          }))
        })
      })

      if (!response.ok) {
        throw new Error("Failed to update quiz")
      }

      router.push("/quizzes")
    } catch {
      setError("Failed to update quiz. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || "Quiz not found"}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex flex-col gap-[32px] items-center w-full max-w-4xl mx-auto relative">
        <div className="w-full">
          <div className="backdrop-blur-lg bg-white/30 p-8 rounded-xl border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-purple-500/20">
                <SquareDot className="h-5 w-5 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 font-heading">
                Edit Assessment
              </h1>
            </div>
            <p className="text-gray-600 mb-6">
              Update your assessment by editing questions and answers. Use the
              formula button in the editor to add math equations.
            </p>
            <Button asChild variant="outline">
              <Link href="/latex-tutorial" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                View LaTeX Tutorial
              </Link>
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-gray-800">
                Assessment Details
              </CardTitle>
              <CardDescription>
                Edit the title and description for your assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700">
                  Title
                </Label>
                <Input
                  id="title"
                  value={quiz.title}
                  onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                  placeholder="Enter assessment title"
                  className="bg-white/50 border-gray-200/50 focus:bg-white/70"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700">
                  Description
                </Label>
                <Input
                  id="description"
                  value={quiz.description || ""}
                  onChange={(e) =>
                    setQuiz({ ...quiz, description: e.target.value })
                  }
                  placeholder="Enter assessment description"
                  className="bg-white/50 border-gray-200/50 focus:bg-white/70"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {quiz.questions.map((question, index) => (
              <Card
                key={question.id}
                className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-heading text-gray-800">
                      Question {index + 1}
                    </CardTitle>
                    {quiz.questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor={`question-${index}`}
                      className="text-gray-700"
                    >
                      Question Text
                    </Label>
                    <div className="bg-white/50 border border-gray-200/50 rounded-md">
                      <LatexEditor
                        value={question.text}
                        onChange={(val) => updateQuestion(index, "text", val)}
                        placeholder="Enter your question"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-gray-700">Options</Label>
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          checked={question.correctAnswer === optionIndex}
                          onChange={() =>
                            updateQuestion(index, "correctAnswer", optionIndex)
                          }
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                        />
                        <div className="flex-1 bg-white/50 border border-gray-200/50 rounded-md">
                          <LatexEditor
                            value={option}
                            onChange={(val) => {
                              const newOptions = [...question.options]
                              newOptions[optionIndex] = val
                              updateQuestion(index, "options", newOptions)
                            }}
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              onClick={addQuestion}
              variant="outline"
              className="w-full sm:w-fit bg-white/50 border-gray-200/50 hover:bg-white/70"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-fit bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg shadow-purple-500/20 group"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Changes
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
