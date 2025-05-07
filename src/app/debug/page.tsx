"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface QuizCode {
  id: string
  code: string
  title: string
  createdAt: string
}

export default function DebugPage() {
  const [quizCodes, setQuizCodes] = useState<QuizCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [testCode, setTestCode] = useState("")
  const [testResult, setTestResult] = useState<string>("")

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const response = await fetch("/api/quizzes/list-codes")
        if (!response.ok) {
          throw new Error("Failed to fetch quiz codes")
        }

        const data = await response.json()
        setQuizCodes(data.quizzes || [])
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to load quiz codes")
      } finally {
        setLoading(false)
      }
    }

    fetchCodes()
  }, [])

  const testVerifyEndpoint = async (code: string) => {
    try {
      setTestResult("Testing...")
      const response = await fetch(`/api/quizzes/verify-room?code=${code}`)
      const data = await response.json()

      setTestResult(JSON.stringify(data, null, 2))
    } catch (err) {
      console.error("Test Error:", err)
      setTestResult(`Error: ${err}`)
    }
  }

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex flex-col gap-8 items-center w-full max-w-3xl mx-auto">
        <Card className="w-full backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle>Debug Quiz Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading quiz codes...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 font-bold border-b pb-2">
                  <div>Title</div>
                  <div>Code</div>
                  <div>Actions</div>
                </div>
                {quizCodes.map((quiz) => (
                  <div key={quiz.id} className="grid grid-cols-3 items-center">
                    <div>{quiz.title}</div>
                    <div>
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {quiz.code}
                      </code>
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testVerifyEndpoint(quiz.code)}
                      >
                        Test API
                      </Button>
                    </div>
                  </div>
                ))}
                {quizCodes.length === 0 && (
                  <p>No quiz codes found in the database.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle>Test Verify Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter quiz code to test"
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  className="bg-white/50"
                />
                <Button
                  onClick={() => testVerifyEndpoint(testCode)}
                  disabled={!testCode.trim()}
                >
                  Test
                </Button>
              </div>

              {testResult && (
                <div className="bg-gray-100 p-4 rounded-md overflow-auto">
                  <pre className="text-sm">{testResult}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
