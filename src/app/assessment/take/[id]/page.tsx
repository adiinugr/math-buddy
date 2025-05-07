"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import "katex/dist/katex.min.css"
import Latex from "react-latex-next"
import { useSession } from "next-auth/react"

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  category: string
  subcategory?: string
}

interface Quiz {
  id: string
  title: string
  description: string | null
  questions: Question[]
}

export default function TakeAssessmentPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = typeof params?.id === "string" ? params.id : ""
  const { data: session } = useSession()

  // Get participant ID from URL query param
  const participantId = searchParams?.get("participant") || ""

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [activeParticipantId, setActiveParticipantId] = useState(participantId)
  const [currentStep, setCurrentStep] = useState<"details" | "questions">(
    participantId ? "questions" : "details"
  )
  const [answers, setAnswers] = useState<Record<string, number>>({})

  // This effect runs once on mount to collect information from localStorage or query params
  useEffect(() => {
    try {
      console.log("===== TAKE PAGE INIT =====")
      console.log("URL participantId:", participantId)

      // Check if we have a participant ID from URL
      if (participantId) {
        console.log("Participant ID found in URL:", participantId)
        setActiveParticipantId(participantId)
        setCurrentStep("questions")

        // We still want to get the name for display purposes
        const storedName = localStorage.getItem("studentName")
        console.log("localStorage studentName:", storedName)

        if (storedName) {
          console.log("Setting name from localStorage:", storedName)
          setName(storedName)
        }

        // We can also recover participant from sessionStorage if needed
        sessionStorage.setItem("currentParticipantId", participantId)
        console.log("Saved participantId to sessionStorage")
        return
      }

      // Otherwise check if we have participant ID in sessionStorage
      const sessionParticipantId = sessionStorage.getItem(
        "currentParticipantId"
      )
      console.log("sessionStorage participantId:", sessionParticipantId)

      if (sessionParticipantId) {
        console.log(
          "Participant ID found in sessionStorage:",
          sessionParticipantId
        )
        setActiveParticipantId(sessionParticipantId)
        setCurrentStep("questions")
      }

      // Get name from authenticated user or localStorage
      if (session?.user?.name) {
        console.log("Name found in session:", session.user.name)
        setName(session.user.name)
      } else {
        const storedName = localStorage.getItem("studentName")
        console.log("localStorage studentName:", storedName)

        if (storedName) {
          console.log("Name found in localStorage:", storedName)
          setName(storedName)
        } else {
          console.log("No name found in localStorage")
        }
      }
    } catch (err) {
      console.error("Error initializing assessment page:", err)
    }
  }, [participantId, session])

  // This effect loads the quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id) return

      try {
        setLoading(true)
        console.log(`Fetching assessment with code: ${id}`)
        const response = await fetch(`/api/quizzes/verify-room?code=${id}`)

        if (!response.ok) {
          const errorData = await response.json()
          console.error("API Error:", errorData)
          throw new Error(errorData.error || "Assessment not found")
        }

        const data = await response.json()
        console.log("Assessment data:", data)
        setQuiz(data)

        // Auto-join if we have name but not participant ID
        if (!activeParticipantId && name && name.trim()) {
          console.log("Automatically joining with name:", name)
          await joinAssessment(name, id)
        } else if (activeParticipantId) {
          console.log("Already have participant ID, no need to join again")
        } else {
          console.log(
            "Not auto-joining: missing name or already have participantId"
          )
        }
      } catch (err) {
        console.error("Error fetching assessment:", err)
        setError("Assessment not found or no longer available")
      } finally {
        setLoading(false)
      }
    }

    // Only fetch the quiz once when the component mounts or ID changes
    fetchQuiz()
    // We explicitly don't want to re-run this effect when name or activeParticipantId change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Function to join assessment
  const joinAssessment = async (studentName: string, quizCode: string) => {
    console.log(
      `Attempting to join assessment with name: ${studentName}, code: ${quizCode}`
    )
    try {
      setSubmitting(true)
      const response = await fetch("/api/quizzes/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code: quizCode, name: studentName })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Join API Error:", errorData)
        throw new Error(errorData.error || "Failed to join assessment")
      }

      const data = await response.json()
      console.log("Successfully joined assessment:", data)
      setActiveParticipantId(data.participantId)

      // Store participant ID for future reference
      sessionStorage.setItem("currentParticipantId", data.participantId)

      setCurrentStep("questions")
      return true
    } catch (err) {
      console.error("Error joining assessment:", err)
      toast.error("Failed to join assessment. Please try again.")
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartAssessment = async (e: React.FormEvent) => {
    e.preventDefault()

    // If user is authenticated, use their name; otherwise use the input name
    const nameToUse = session?.user?.name || name.trim()

    if (!nameToUse) {
      toast.error("Please enter your name")
      return
    }

    // Save the name to localStorage for future use
    localStorage.setItem("studentName", nameToUse)

    // Join the assessment
    await joinAssessment(nameToUse, id)
  }

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if all questions are answered
    if (quiz && Object.keys(answers).length !== quiz.questions.length) {
      toast.error("Please answer all questions before submitting")
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch("/api/quizzes/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          participantId: activeParticipantId,
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer
          }))
        })
      })

      if (!response.ok) {
        throw new Error("Failed to submit answers")
      }

      await response.json()
      toast.success("Assessment submitted successfully!")
      router.push(`/assessment/results?participantId=${activeParticipantId}`)
    } catch (err) {
      console.error("Error submitting assessment:", err)
      toast.error("Failed to submit assessment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Force questions step if we have a participant ID
  useEffect(() => {
    if (activeParticipantId) {
      console.log(
        "Forcing questions step because we have a participant ID:",
        activeParticipantId
      )
      setCurrentStep("questions")
    }
  }, [activeParticipantId])

  if (loading) {
    return (
      <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
          <Card className="w-full backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardContent className="pt-6 flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
              <p>Memuat penilaian...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
          <Card className="w-full backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-red-700">
                  Penilaian Tidak Ditemukan
                </h3>
                <p className="text-gray-600">{error}</p>
                <Button
                  onClick={() => router.push("/assessment/join")}
                  className="mt-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  Kembali ke Halaman Gabung
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return null
  }

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="w-full max-w-3xl mx-auto">
        <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-heading">
              {quiz.title}
            </CardTitle>
            {quiz.description && (
              <p className="text-gray-600 mt-1">{quiz.description}</p>
            )}
            {name && currentStep === "questions" && (
              <div className="mt-2 text-sm text-gray-600">
                Peserta: <span className="font-medium">{name}</span>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {!activeParticipantId && currentStep === "details" ? (
              <form onSubmit={handleStartAssessment} className="space-y-4">
                {session?.user ? (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-blue-700">
                      Selamat datang, <strong>{session.user.name}</strong>! Anda
                      dapat memulai penilaian sekarang.
                    </p>
                  </div>
                ) : name ? (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-blue-700">
                      Selamat datang kembali, <strong>{name}</strong>! Anda
                      dapat memulai penilaian sekarang.
                    </p>
                  </div>
                ) : null}

                {!session?.user && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Anda</Label>
                    <Input
                      id="name"
                      placeholder={
                        name ? "Nama sudah dimasukkan" : "Masukkan nama Anda"
                      }
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`bg-white/50 border-gray-200/50 focus:bg-white/70 ${
                        name ? "border-green-300" : ""
                      }`}
                      required
                    />
                    {name && (
                      <p className="text-xs text-green-600">
                        Nama Anda telah dimuat dari sesi sebelumnya.
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memulai Penilaian...
                    </>
                  ) : (
                    "Mulai Penilaian"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {quiz.questions.map((question, questionIndex) => (
                  <div
                    key={question.id}
                    className="p-4 bg-white/50 rounded-lg border border-gray-200/50 space-y-4"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 text-blue-800 font-medium rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        {questionIndex + 1}
                      </div>
                      <h3 className="text-lg font-medium">
                        <Latex>{question.text}</Latex>
                      </h3>
                    </div>

                    <div className="space-y-3 pl-8">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-start space-x-2"
                        >
                          <input
                            type="radio"
                            id={`question-${question.id}-option-${optionIndex}`}
                            name={`question-${question.id}`}
                            className="mt-1"
                            checked={answers[question.id] === optionIndex}
                            onChange={() =>
                              handleAnswer(question.id, optionIndex)
                            }
                          />
                          <label
                            htmlFor={`question-${question.id}-option-${optionIndex}`}
                            className="text-gray-700"
                          >
                            <Latex>{option}</Latex>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirimkan Penilaian...
                    </>
                  ) : (
                    "Kirim Penilaian"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
