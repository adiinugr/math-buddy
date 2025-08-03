"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy, FileText, BookOpen, Check, Edit } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { trackEvent } from "@/components/GoogleAnalytics"

interface Quiz {
  id: string
  title: string
  description: string | null
  code: string
}

export default function AssessmentPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()

  // Store quiz ID in state to avoid direct params access warning
  const [quizId, setQuizId] = useState<string>("")
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [assessmentUrl, setAssessmentUrl] = useState("")
  const [copied, setCopied] = useState(false)

  // Set up quizId when component mounts
  useEffect(() => {
    const paramsObj = params || {}
    const idValue = typeof paramsObj.id === "string" ? paramsObj.id : ""

    if (idValue) {
      setQuizId(idValue)
    }
  }, [params])

  const fetchQuizData = useCallback(async () => {
    try {
      // Fetch quiz data
      const response = await fetch(`/api/quizzes/${quizId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch quiz")
      }

      const data = await response.json()
      setQuiz(data)

      // Generate assessment URL
      const baseUrl = window.location.origin
      const assessmentLink = `${baseUrl}/assessment/take/${data.code}`
      setAssessmentUrl(assessmentLink)
    } catch (err) {
      setError("Failed to load quiz")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [quizId])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    // Only initialize when we have both authentication and quizId
    if (status === "authenticated" && quizId) {
      fetchQuizData()
    }
  }, [status, quizId, router, fetchQuizData])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(assessmentUrl)
    setCopied(true)
    toast.success("Assessment link copied to clipboard!")
    trackEvent("copy_assessment_link", "quiz", quizId)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyCodeToClipboard = () => {
    if (quiz) {
      navigator.clipboard.writeText(quiz.code)
      toast.success("Assessment code copied to clipboard!")
      trackEvent("copy_quiz_code", "quiz", quizId)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="container max-w-5xl mx-auto">
          <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <p>Loading assessment...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="container max-w-5xl mx-auto">
          <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <p className="text-red-500">{error}</p>
                <Button onClick={() => router.push("/quizzes")}>
                  Return to Quizzes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="container max-w-5xl mx-auto">
        <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center">
              <Link
                href="/quizzes"
                className="mr-4 p-2 rounded-full hover:bg-gray-200/50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <CardTitle className="text-2xl font-heading">
                  Assessment: {quiz?.title}
                </CardTitle>
                {quiz?.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {quiz.description}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-8">
              <div className="bg-white/50 p-6 rounded-lg border border-purple-100 shadow-sm">
                <div className="flex items-center text-purple-700 mb-4">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <h3 className="font-semibold">Assessment Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Assessment Code:
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-100 py-2 px-4 rounded font-mono text-purple-800">
                          {quiz?.code}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyCodeToClipboard}
                          className="h-8"
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Direct Link:
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="bg-white py-2 px-4 rounded text-sm text-purple-800 border border-purple-100 w-full truncate">
                          {assessmentUrl}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          className={`h-8 whitespace-nowrap ${
                            copied ? "bg-green-100 text-green-700" : ""
                          }`}
                        >
                          {copied ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50/80 p-4 rounded-lg text-purple-800 flex flex-col justify-center">
                    <h4 className="font-medium mb-2">How students can join:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-purple-200 rounded-full p-1 mr-2 mt-0.5">
                          1
                        </span>
                        <span>
                          Share the assessment code or direct link with students
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-purple-200 rounded-full p-1 mr-2 mt-0.5">
                          2
                        </span>
                        <span>
                          Students enter the code or click the link to access
                          the assessment
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-purple-200 rounded-full p-1 mr-2 mt-0.5">
                          3
                        </span>
                        <span>
                          Each student can complete the assessment at their own
                          pace
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => router.push(`/quizzes/${quizId}/results`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Results
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/quizzes/${quizId}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
