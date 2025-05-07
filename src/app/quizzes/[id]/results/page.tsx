"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BarChart, Users } from "lucide-react"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

interface Quiz {
  id: string
  title: string
  description: string | null
}

interface Result {
  id: string
  name: string
  score: number
  createdAt: string
  quizId: string
}

export default function QuizResultsPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
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
    }
  }, [params.id])

  const fetchResults = useCallback(async () => {
    try {
      const response = await fetch(`/api/quizzes/${params.id}/results`)
      if (!response.ok) {
        throw new Error("Failed to fetch results")
      }
      const data = await response.json()
      setResults(data)
    } catch {
      setError("Failed to load results")
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
    fetchResults()
  }, [status, router, fetchQuiz, fetchResults])

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
      <div className="flex flex-col gap-8 items-center w-full max-w-4xl mx-auto">
        <div className="w-full flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800 font-heading">
            {quiz.title} - Results
          </h1>
          <Button asChild variant="outline">
            <Link href="/quizzes" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Quizzes
            </Link>
          </Button>
        </div>

        {error && (
          <div className="w-full text-center text-red-500">{error}</div>
        )}

        <div className="w-full flex justify-end">
          {results.length === 0 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    className="bg-blue-500/50 hover:bg-blue-500/50 cursor-not-allowed"
                    disabled
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Create Student Groups
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>You need at least one student result to create groups</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              asChild
              variant="default"
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Link
                href={`/quizzes/${params.id}/groups`}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Create Student Groups
              </Link>
            </Button>
          )}
        </div>

        <div className="w-full space-y-6">
          {results.length === 0 ? (
            <div className="text-center text-gray-500">No results found.</div>
          ) : (
            results.map((result) => (
              <Card
                key={result.id}
                className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg"
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {result.name}
                    </CardTitle>
                    <div className="text-sm text-gray-500">
                      Score: {result.score}
                    </div>
                    <div className="text-xs text-gray-500">
                      Completed: {new Date(result.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <Button
                      asChild
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Link href={`/quizzes/${params.id}/results/${result.id}`}>
                        <BarChart className="h-4 w-4" />
                        View Detailed Analysis
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
