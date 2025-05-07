"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import React from "react"
import Latex from "react-latex-next"
import "katex/dist/katex.min.css"
import { toast } from "sonner"
import SessionRestoredBanner from "@/components/session-restored-banner"
import ErrorMessage from "@/components/error-message"
import NetworkStatus from "@/components/network-status"
import Breadcrumbs from "@/components/breadcrumbs"
import { parseSocketError, getReconnectionAdvice } from "@/lib/error-helpers"
import {
  connectSocket,
  disconnectSocket,
  leaveRoom,
  submitAnswer,
  onQuestionStarted,
  onQuizStopped,
  removeAllListeners,
  joinRoom,
  onQuizStarted,
  onError,
  getSocket,
  getSocketStatus,
  getSocketDiagnostics
} from "@/lib/socket"
import { WifiOff } from "lucide-react"

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
}

// Dummy questions for testing - will be replaced with real questions from API
const dummyQuestions: Question[] = [
  {
    id: "q1",
    text: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1
  }
]

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development"

export default function StudentLiveQuizPage() {
  const params = useParams()
  const [quizId, setQuizId] = useState<string>("")
  const [roomCode, setRoomCode] = useState<string>("")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string>("")
  const [errorInfo, setErrorInfo] = useState<{
    type: "connection" | "server" | "general"
    message: string
  } | null>(null)
  const [quizStarted, setQuizStarted] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [allAnswers, setAllAnswers] = useState<Record<string, number>>({})
  const [studentName, setStudentName] = useState<string>("")
  const [isRestoringSession, setIsRestoringSession] = useState(false)
  const [showRestoredBanner, setShowRestoredBanner] = useState(false)
  const router = useRouter()

  // Save current quiz state to localStorage
  const saveQuizState = useCallback(() => {
    if (!quizId || !roomCode) return

    const quizState = {
      quizId,
      roomCode,
      questionIndex,
      allAnswers,
      quizStarted,
      quizCompleted,
      timestamp: new Date().getTime()
    }

    localStorage.setItem(`quizState_${quizId}`, JSON.stringify(quizState))
    console.log("Quiz state saved to localStorage")
  }, [quizId, roomCode, questionIndex, allAnswers, quizStarted, quizCompleted])

  // Restore quiz state from localStorage
  const restoreQuizState = useCallback(() => {
    if (!quizId) return false

    const savedState = localStorage.getItem(`quizState_${quizId}`)
    if (!savedState) return false

    try {
      const parsedState = JSON.parse(savedState)

      // Check if state is less than 24 hours old
      const now = new Date().getTime()
      const stateAge = now - parsedState.timestamp
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours

      if (stateAge > maxAge) {
        console.log("Saved state is too old, not restoring")
        localStorage.removeItem(`quizState_${quizId}`)
        return false
      }

      // Restore state
      setIsRestoringSession(true)
      setShowRestoredBanner(true)
      setRoomCode(parsedState.roomCode)
      setQuizStarted(parsedState.quizStarted)
      setQuizCompleted(parsedState.quizCompleted)
      setAllAnswers(parsedState.allAnswers)

      // We'll set the question index after questions are loaded
      const savedQuestionIndex = parsedState.questionIndex

      console.log("Quiz state restored from localStorage")
      setDebugInfo((prev) => prev + "\nRestored previous session")
      toast.info("Previous session restored")

      return { success: true, questionIndex: savedQuestionIndex }
    } catch (error) {
      console.error("Error restoring quiz state:", error)
      return false
    }
  }, [
    quizId,
    setIsRestoringSession,
    setShowRestoredBanner,
    setRoomCode,
    setQuizStarted,
    setQuizCompleted,
    setAllAnswers,
    setDebugInfo
  ])

  // Auto-save state on important changes
  useEffect(() => {
    if (isRestoringSession) return // Don't save while restoring

    saveQuizState()
  }, [
    questionIndex,
    allAnswers,
    quizStarted,
    quizCompleted,
    isRestoringSession,
    saveQuizState
  ])

  // Auto-save when user leaves/refreshes page
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveQuizState()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [
    quizId,
    roomCode,
    questionIndex,
    allAnswers,
    quizStarted,
    quizCompleted,
    saveQuizState
  ])

  // Set quizId once when component mounts
  useEffect(() => {
    const id = params?.id
    if (typeof id === "string") {
      setQuizId(id)
    }

    // Get room code from localStorage - set by the join page
    const storedRoomCode = localStorage.getItem("currentRoomCode")
    if (storedRoomCode) {
      setRoomCode(storedRoomCode)
      console.log("Retrieved room code from localStorage:", storedRoomCode)
    } else {
      const errorData = parseSocketError("Room code not found")
      setErrorInfo(errorData)
      setError("Room code not found. Please rejoin the quiz.")
      console.error("Room code not found in localStorage")
    }
  }, [params])

  // Try to restore session after quizId is set
  useEffect(() => {
    if (!quizId) return

    const restoredState = restoreQuizState()
    if (!restoredState) {
      console.log("No saved state to restore")
    }
  }, [quizId, restoreQuizState])

  // Fetch questions when quiz is started
  useEffect(() => {
    if (quizStarted && quizId) {
      console.log("Quiz started, fetching questions for quiz:", quizId)
      setDebugInfo((prev) => prev + "\nFetching questions for quiz: " + quizId)

      // Use the new public endpoint
      fetch(`/api/quizzes/${quizId}/questions`)
        .then((response) => {
          if (!response.ok) {
            const statusText = response.statusText || "Unknown error"
            console.error(`API error: ${response.status} ${statusText}`)
            setDebugInfo(
              (prev) => prev + `\nAPI error: ${response.status} ${statusText}`
            )
            throw new Error(
              `Failed to fetch quiz questions: ${response.status} ${statusText}`
            )
          }
          return response.json()
        })
        .then((data) => {
          console.log("Fetched quiz data:", data)
          setDebugInfo(
            (prev) =>
              prev +
              "\nFetched quiz data with " +
              (data.questions?.length || 0) +
              " questions"
          )

          if (data.questions && data.questions.length > 0) {
            // Store all questions
            setAllQuestions(data.questions)

            // If we're restoring a session, set to the saved question index
            if (isRestoringSession) {
              const savedState = JSON.parse(
                localStorage.getItem(`quizState_${quizId}`) || "{}"
              )
              const savedIndex = savedState.questionIndex || 0

              // Make sure the index is valid
              const validIndex = Math.min(savedIndex, data.questions.length - 1)
              setQuestionIndex(validIndex)
              setCurrentQuestion(data.questions[validIndex])
              setIsRestoringSession(false)
              console.log(`Restored to question ${validIndex + 1}`)

              // Show notification that session was restored
              toast.info("Your previous session has been restored")
            } else {
              // Questions are already sorted by order in the API
              const firstQuestion = data.questions[0]
              setCurrentQuestion(firstQuestion)
              setQuestionIndex(0)
            }
          } else {
            // If no questions, use dummy questions for testing
            console.log("No questions found, using dummy question")
            setDebugInfo(
              (prev) => prev + "\nNo questions found, using dummy question"
            )
            setAllQuestions(dummyQuestions)
            setCurrentQuestion(dummyQuestions[0])
            setQuestionIndex(0)
          }
        })
        .catch((err) => {
          console.error("Error fetching quiz questions:", err)
          setDebugInfo(
            (prev) => prev + "\nError fetching questions: " + err.message
          )

          // Parse the error using our helper
          const errorData = parseSocketError(err)
          setErrorInfo(errorData)
          setError(errorData.message)

          // For non-critical connection errors, we can still try to use dummy questions
          if (errorData.type === "connection") {
            toast.error(errorData.message, {
              description: getReconnectionAdvice(errorData)
            })

            // After error, wait 3 seconds and try to use dummy questions instead
            setTimeout(() => {
              console.log("Using dummy questions after API error")
              setDebugInfo(
                (prev) => prev + "\nUsing dummy questions after API error"
              )
              setAllQuestions(dummyQuestions)
              setCurrentQuestion(dummyQuestions[0])
              setQuestionIndex(0)
            }, 3000)
          }
        })
    }
  }, [quizStarted, quizId, isRestoringSession])

  useEffect(() => {
    // Only run this effect when both quizId and roomCode are available
    if (!quizId || !roomCode) return

    console.log("Setting up socket with quizId:", quizId, "roomCode:", roomCode)
    setDebugInfo(
      "Setting up socket with quizId: " + quizId + ", roomCode: " + roomCode
    )

    // Connect to socket
    const socket = connectSocket()

    // Setup direct event handler to ensure we catch quiz-started events
    socket.on("quiz-started", () => {
      console.log("Direct socket quiz-started event caught!")
      setDebugInfo(
        (prev) => prev + "\nDirect socket quiz-started event caught!"
      )
      setQuizStarted(true)
    })

    socket.on("connect", () => {
      console.log("Socket connected, joining room:", roomCode)
      setDebugInfo(
        (prev) => prev + "\nSocket connected, joining room: " + roomCode
      )
      setIsConnected(true)
      // Join the room once connected using the room code (not quiz ID)
      joinRoom(roomCode)

      // Ensure we're listening for all events
      socket.removeAllListeners("quiz-started")
      socket.on("quiz-started", () => {
        console.log("Socket quiz-started event after connect!")
        setDebugInfo(
          (prev) => prev + "\nSocket quiz-started event after connect!"
        )
        setQuizStarted(true)
      })
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
      setDebugInfo((prev) => prev + "\nSocket disconnected")
    })

    // Set up event listeners
    onError((errorMsg) => {
      console.error("Socket error:", errorMsg)
      setDebugInfo((prev) => prev + "\nSocket error: " + errorMsg)

      // Parse error using our helper
      const errorData = parseSocketError(errorMsg)
      setErrorInfo(errorData)
      setError(errorData.message)

      // Show a toast with connection advice for less severe errors
      if (errorData.type !== "server") {
        toast.error(errorData.message, {
          description: getReconnectionAdvice(errorData)
        })
      }
    })

    onQuizStarted(() => {
      console.log("onQuizStarted callback fired!")
      setDebugInfo((prev) => prev + "\nonQuizStarted callback fired!")
      setQuizStarted(true)
    })

    onQuestionStarted((question) => {
      console.log("Question started event received:", question)
      setDebugInfo((prev) => prev + "\nQuestion started event received")
      setCurrentQuestion(question as Question)
      setSelectedAnswer(null)
      setIsSubmitted(false)
    })

    onQuizStopped(() => {
      console.log("Quiz stopped, redirecting to home")
      setDebugInfo((prev) => prev + "\nQuiz stopped, redirecting home")
      // Clear localStorage when quiz is stopped
      localStorage.removeItem("currentRoomCode")
      router.push("/")
    })

    // Force check quiz status 5 seconds after connecting
    const timer = setTimeout(() => {
      if (!quizStarted) {
        console.log(
          "No quiz-started event received after 5 seconds, checking status manually"
        )
        setDebugInfo(
          (prev) =>
            prev + "\nNo quiz-started event after 5s, fetching questions anyway"
        )
        // Try to load questions even if we didn't get the quiz-started event
        setQuizStarted(true)
      }
    }, 5000)

    // Cleanup on unmount
    return () => {
      clearTimeout(timer)
      removeAllListeners()
      leaveRoom(roomCode)
      disconnectSocket()
    }
  }, [router, quizId, roomCode, quizStarted])

  // Add a reconnection mechanism to handle network issues
  useEffect(() => {
    if (!roomCode || !quizId) return

    let reconnectTimer: NodeJS.Timeout | null = null

    // Function to attempt reconnection
    const attemptReconnect = () => {
      if (isConnected) {
        console.log("Already connected, no need to reconnect")
        return
      }

      console.log("Attempting to reconnect socket...")
      setDebugInfo((prev) => prev + "\nAttempting to reconnect socket...")

      // Disconnect any existing socket first
      disconnectSocket()

      // Short delay before reconnecting
      setTimeout(() => {
        // Connect again
        const socket = connectSocket()

        // Join room on connect
        socket.on("connect", () => {
          console.log("Reconnected! Joining room:", roomCode)
          setDebugInfo(
            (prev) => prev + "\nReconnected! Joining room: " + roomCode
          )
          setIsConnected(true)
          joinRoom(roomCode)
          toast.success("Reconnected to quiz")
        })
      }, 1000)
    }

    // Listen for online/offline events
    const handleOnline = () => {
      console.log("Browser is online, attempting reconnect")
      setDebugInfo((prev) => prev + "\nBrowser is online, attempting reconnect")
      attemptReconnect()
    }

    const handleOffline = () => {
      console.log("Browser is offline")
      setDebugInfo((prev) => prev + "\nBrowser is offline")
      setIsConnected(false)
      toast.error("You are offline. Reconnecting when possible...")
    }

    // Set up periodic connection check
    reconnectTimer = setInterval(() => {
      if (!isConnected && navigator.onLine) {
        console.log("Periodic connection check - attempting reconnect")
        setDebugInfo(
          (prev) => prev + "\nPeriodic connection check - attempting reconnect"
        )
        attemptReconnect()
      }
    }, 10000) // Check every 10 seconds

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Cleanup
    return () => {
      if (reconnectTimer) clearInterval(reconnectTimer)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [roomCode, quizId, isConnected])

  // Add debugging heartbeat to check socket status
  useEffect(() => {
    if (!roomCode) return

    const heartbeatInterval = setInterval(() => {
      const socket = getSocket()
      if (socket) {
        const connStatus = socket.connected ? "connected" : "disconnected"
        console.log(
          `Socket heartbeat - Socket is ${connStatus} - ID: ${socket.id}`
        )
        setDebugInfo(
          (prev) =>
            prev +
            `\nSocket heartbeat: ${connStatus} - ID: ${socket.id || "none"}`
        )
      } else {
        console.log("Socket heartbeat - No socket instance found")
        setDebugInfo((prev) => prev + "\nSocket heartbeat: No socket instance")
      }
    }, 3000)

    return () => clearInterval(heartbeatInterval)
  }, [roomCode])

  // Use effect to load saved name if available
  useEffect(() => {
    // Try to get the name from localStorage
    const savedName = localStorage.getItem("studentName") || "Guest"
    setStudentName(savedName)
  }, [])

  // Update the handleSubmit function to track answers
  const handleSubmit = () => {
    if (selectedAnswer === null || !currentQuestion || !roomCode) return

    console.log("Submitting answer:", {
      roomCode: roomCode,
      questionId: currentQuestion.id,
      answer: selectedAnswer
    })

    // Set submitted state first so UI updates immediately
    setIsSubmitted(true)

    // Track the answer in our local state
    setAllAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer
    }))

    // Save state immediately after recording answer
    saveQuizState()

    submitAnswer({
      roomCode: roomCode,
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      timestamp: Date.now()
    })

    // Log submission success
    console.log("Answer submitted successfully")
    setDebugInfo((prev) => prev + "\nAnswer submitted: " + selectedAnswer)

    // Check if this is the last question
    if (questionIndex === allQuestions.length - 1) {
      // This is the last question - submit all answers to our API
      submitAllAnswers()
    } else {
      // Not the last question - move to next question after a short delay
      setTimeout(() => {
        goToNextQuestion()
      }, 1000) // Delay of 1 second before moving to next question
    }
  }

  // Add a function to submit all answers to our API
  const submitAllAnswers = async () => {
    try {
      console.log("Submitting all answers to API")
      setDebugInfo((prev) => prev + "\nSubmitting all answers to API")

      // Need to wait a moment to make sure the last answer is included
      const answers = {
        ...allAnswers,
        [currentQuestion!.id]: selectedAnswer
      }

      const response = await fetch("/api/quizzes/live-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          quizId,
          name: studentName,
          answers
        })
      })

      if (!response.ok) {
        throw new Error("Failed to submit answers")
      }

      const data = await response.json()
      console.log("All answers submitted, participant ID:", data.participantId)
      setDebugInfo(
        (prev) =>
          prev +
          "\nAll answers submitted, participant ID: " +
          data.participantId
      )

      // Store participant ID in localStorage for access on results page
      localStorage.setItem("liveQuizParticipantId", data.participantId)

      // Clear quiz state since we're done
      localStorage.removeItem(`quizState_${quizId}`)

      // Redirect directly to results page instead of showing completion screen
      console.log("Redirecting to results page")
      setDebugInfo((prev) => prev + "\nRedirecting to results page")
      router.push(`/quizzes/${quizId}/results/student`)
    } catch (error) {
      console.error("Error submitting all answers:", error)
      setDebugInfo((prev) => prev + "\nError submitting answers: " + error)

      // Show error message but still try to redirect
      toast.error(
        "There was a problem submitting your answers, but we'll still try to show your results."
      )
      setTimeout(() => {
        router.push(`/quizzes/${quizId}/results/student`)
      }, 2000)
    }
  }

  // Navigation for questions (now used only internally)
  const goToNextQuestion = useCallback(() => {
    if (questionIndex < allQuestions.length - 1) {
      setQuestionIndex((prev) => prev + 1)
      setCurrentQuestion(allQuestions[questionIndex + 1])
      setSelectedAnswer(null)
      setIsSubmitted(false)
    }
  }, [
    questionIndex,
    allQuestions,
    setCurrentQuestion,
    setSelectedAnswer,
    setIsSubmitted
  ])

  // Return to home page
  const handleFinish = () => {
    // Clear quiz state when finishing
    localStorage.removeItem(`quizState_${quizId}`)
    localStorage.removeItem("currentRoomCode")
    router.push("/")
  }

  // Force start button for testing
  const handleForceStart = () => {
    console.log("Manually forcing quiz to start")
    setDebugInfo((prev) => prev + "\nManually forcing quiz to start")
    setQuizStarted(true)
  }

  // Function to render text with LaTeX support
  const renderWithLatex = (text: string) => {
    // Replace $...$ with LaTeX content
    return <Latex>{text}</Latex>
  }

  // Auto-select existing answer if we have one (for restored sessions)
  useEffect(() => {
    if (!currentQuestion) return

    // Look for any existing answers to the current question
    const existingAnswer = allAnswers[currentQuestion.id]

    if (
      existingAnswer !== undefined &&
      selectedAnswer === null &&
      quizStarted
    ) {
      setSelectedAnswer(existingAnswer)
      if (!isSubmitted) {
        setIsSubmitted(true)
        // Wait a moment then go to next question if not the last
        if (questionIndex < allQuestions.length - 1) {
          const timer = setTimeout(() => {
            goToNextQuestion()
          }, 1000)
          return () => clearTimeout(timer)
        }
      }
    }
  }, [
    currentQuestion,
    allAnswers,
    selectedAnswer,
    isSubmitted,
    quizStarted,
    questionIndex,
    allQuestions.length,
    goToNextQuestion
  ])

  // Handle retrying after an error
  const handleRetryConnection = () => {
    setError("")
    setErrorInfo(null)

    // Try to reconnect the socket
    const socket = connectSocket()

    // Setup listeners again
    socket.on("connect", () => {
      setIsConnected(true)
      toast.success("Reconnected successfully!")

      // Join the room
      if (roomCode) {
        joinRoom(roomCode)
      } else {
        // Try to get the room code from localStorage again
        const storedRoomCode = localStorage.getItem("currentRoomCode")
        if (storedRoomCode) {
          setRoomCode(storedRoomCode)
          joinRoom(storedRoomCode)
        } else {
          router.push("/join")
        }
      }
    })
  }

  // Go back to join page
  const handleGoToJoin = () => {
    router.push("/join")
  }

  // Define a new function to show debugging information
  const handleShowDiagnostics = () => {
    // Get the socket status and diagnostics
    const status = getSocketStatus()
    const diagnostics = getSocketDiagnostics()

    // Display a debug dialog with connection information
    const debugInfo = `
Connection Status: ${status.connected ? "Connected" : "Disconnected"}
Socket ID: ${status.id || "None"}
Connection Attempts: ${status.connectionAttempts}
Recent Errors: ${
      status.lastErrors.length
        ? "\n- " + status.lastErrors.join("\n- ")
        : "None"
    }

Full Diagnostics:
${diagnostics}
    `

    // Show a dialog with the information (for simplicity using alert, in production you'd use a modal)
    alert(debugInfo)
  }

  if (errorInfo && errorInfo.type === "server") {
    return (
      <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="container max-w-2xl mx-auto">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: "Join", href: "/join" },
                { label: "Live Quiz", current: true }
              ]}
            />
          </div>

          <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorMessage
                type="server"
                message={error}
                backAction={handleGoToJoin}
                backLabel="Return to Join Page"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error && !isConnected) {
    return (
      <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="container max-w-2xl mx-auto">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: "Join", href: "/join" },
                { label: "Live Quiz", current: true }
              ]}
            />
          </div>

          <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Connection Error</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorMessage
                type="connection"
                message={error}
                retryAction={handleRetryConnection}
                backAction={handleGoToJoin}
                backLabel="Return to Join Page"
              />
            </CardContent>
          </Card>
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
                { label: "Live Quiz", current: true }
              ]}
            />
          </div>

          <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorMessage
                type="general"
                message={error}
                retryAction={handleRetryConnection}
                backAction={handleGoToJoin}
                backLabel="Return to Join Page"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!quizStarted || !currentQuestion) {
    return (
      <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="container max-w-2xl mx-auto">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: "Join", href: "/join" },
                { label: "Live Quiz", current: true }
              ]}
            />
          </div>

          <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Waiting for Quiz to Start</CardTitle>
              <NetworkStatus isConnected={isConnected} />
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">
                Please wait for the teacher to start the quiz...
              </p>
              <div className="flex flex-col gap-4 items-center">
                {!isConnected && (
                  <div className="w-full p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-amber-700 text-center text-sm font-medium">
                      Connecting to server...
                    </p>
                    <p className="text-amber-600 text-center text-xs mt-1">
                      If this persists, check your internet connection or
                      refresh the page.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 w-full gap-3 p-4 rounded-lg bg-gray-50 text-gray-600">
                  <div className="text-sm">
                    <span className="font-medium">Room code:</span>
                    <p className="text-gray-700">{roomCode || "Not found"}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Quiz ID:</span>
                    <p className="text-gray-700">{quizId || "Not found"}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Only show Force Start button in development mode */}
                  {isDevelopment && (
                    <Button variant="secondary" onClick={handleForceStart}>
                      Force Start (Testing)
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowDiagnostics}
                  >
                    Connection Diagnostics
                  </Button>
                </div>

                {/* Only show debug info in development mode */}
                {isDevelopment && (
                  <div className="w-full">
                    <p className="text-xs text-gray-500 mb-1">
                      Debug Information:
                    </p>
                    <pre className="text-xs text-gray-500 max-h-40 overflow-auto p-2 bg-gray-50 rounded w-full border border-gray-200">
                      {debugInfo}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Quiz completion screen
  if (quizCompleted) {
    return (
      <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="container max-w-2xl mx-auto">
          <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-heading text-center text-gray-800">
                Quiz Completed!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-green-100 text-center">
                  <p className="text-green-700 font-medium text-lg mb-2">
                    Thank you for participating in this quiz
                  </p>
                  <p className="text-green-600">
                    Your answers have been submitted successfully.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 text-center border border-blue-100">
                  <p className="text-blue-700">
                    You have completed all {allQuestions.length} questions.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <Button
                    onClick={() =>
                      router.push(`/quizzes/${quizId}/results/student`)
                    }
                    className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/20"
                  >
                    View Results & Analytics
                  </Button>

                  <Button
                    onClick={handleFinish}
                    variant="outline"
                    className="flex-1"
                  >
                    Return to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {showRestoredBanner && allQuestions.length > 0 && (
        <SessionRestoredBanner
          isVisible={showRestoredBanner}
          questionNumber={questionIndex + 1}
          totalQuestions={allQuestions.length}
          onDismiss={() => setShowRestoredBanner(false)}
        />
      )}
      <div className="container max-w-2xl mx-auto">
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: "Join", href: "/join" },
              { label: "Live Quiz", current: true }
            ]}
          />
        </div>

        <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-heading text-gray-800">
                Question {questionIndex + 1}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {questionIndex + 1} of {allQuestions.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 text-blue-800 font-semibold py-1 px-3 rounded-full">
                {questionIndex + 1} / {allQuestions.length}
              </div>
              <NetworkStatus
                isConnected={isConnected}
                showLabel={false}
                className="bg-white/70"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-lg font-medium p-4 rounded-lg bg-white/50">
                {renderWithLatex(currentQuestion.text)}
              </div>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? "default" : "outline"}
                    className={`w-full justify-start p-4 h-auto ${
                      selectedAnswer === index
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        : "bg-white/50 hover:bg-white/70"
                    }`}
                    onClick={() => !isSubmitted && setSelectedAnswer(index)}
                    disabled={isSubmitted}
                  >
                    {renderWithLatex(option)}
                  </Button>
                ))}
              </div>
              {!isConnected && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <p className="text-amber-700 text-sm flex items-center justify-center">
                    <WifiOff className="h-4 w-4 mr-2" />
                    Connection lost. Reconnecting...
                  </p>
                </div>
              )}
              {!isSubmitted && (
                <Button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null || !isConnected}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/20"
                >
                  {!isConnected ? "Reconnecting..." : "Submit Answer"}
                </Button>
              )}
              {isSubmitted && (
                <div className="p-4 rounded-lg bg-green-100 text-center">
                  <p className="text-green-600 font-medium">
                    {questionIndex < allQuestions.length - 1
                      ? "Answer submitted! Moving to next question..."
                      : "All questions completed!"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
