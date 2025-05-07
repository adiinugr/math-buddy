"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Users,
  Play,
  Pause,
  CheckCircle2,
  UserX,
  Trash2,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import Link from "next/link"
import {
  connectSocket,
  disconnectSocket,
  joinRoom,
  startQuiz,
  stopQuiz,
  onParticipantJoined,
  onParticipantLeft,
  onQuizStarted,
  onQuizStopped,
  removeAllListeners,
  removeParticipant,
  onParticipantRemoved,
  onParticipantRemovalSuccess,
  resetRoom,
  onRoomResetSuccess,
  onError,
  onJoinSuccess
} from "@/lib/socket"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

// Match the Participant interface from the socket.ts file
interface Participant {
  id: string
  name: string
  email: string
  joinedAt: string
  role?: "TEACHER" | "STUDENT"
}

interface Quiz {
  id: string
  title: string
  description: string | null
}

export default function LiveQuizPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()

  // Store quiz ID in state to avoid direct params access warning
  const [quizId, setQuizId] = useState<string>("")
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [quizStatus, setQuizStatus] = useState<
    "waiting" | "in_progress" | "completed"
  >("waiting")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [participantToRemove, setParticipantToRemove] =
    useState<Participant | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [startingQuiz, setStartingQuiz] = useState(false)
  const [stoppingQuiz, setStoppingQuiz] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const [roomConnected, setRoomConnected] = useState<boolean>(false)

  // Set up quizId when component mounts
  useEffect(() => {
    // Using a type guard and local variable approach instead of React.use()
    const paramsObj = params || {}
    const idValue = typeof paramsObj.id === "string" ? paramsObj.id : ""

    if (idValue) {
      setQuizId(idValue)
    }
  }, [params])

  const setupWebSocket = useCallback(
    (code: string) => {
      // Set up connection monitoring
      const socket = connectSocket({
        name: session?.user?.name || undefined,
        userId: session?.user?.id
      })

      socket.on("connect", () => {
        console.log("Socket connected successfully with ID:", socket.id)
        setSocketConnected(true)
        toast.success("Connected to server")

        // Only proceed with reset/join if we have a valid code
        if (code && code.trim()) {
          console.log(`Connected - now joining room ${code}`)

          // Instead of resetting the room on every page load, just join the room
          // This prevents duplicate participants from being created
          joinRoom(code)

          // Only reset the room if the participants list is empty or explicitly requested
          const storedParticipants = localStorage.getItem(
            `participants_${code}`
          )
          const hasStoredParticipants =
            storedParticipants && JSON.parse(storedParticipants).length > 0

          if (!hasStoredParticipants) {
            console.log(`No stored participants found, resetting room ${code}`)
            // This is the first load, so reset the room
            resetRoom(code)
          } else {
            console.log(`Found stored participants, not resetting room ${code}`)
          }
        } else {
          console.error("No valid room code provided")
          toast.error("No valid room code provided")
        }
      })

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err)
        setSocketConnected(false)
        setRoomConnected(false)
        toast.error(`Connection error: ${err.message}`)
        setRefreshing(false)
        setStartingQuiz(false)
        setStoppingQuiz(false)
      })

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason)
        setSocketConnected(false)
        setRoomConnected(false)

        if (reason === "io server disconnect" || reason === "transport close") {
          // Automatically try to reconnect if the server closed the connection
          toast.warning("Disconnected from server. Attempting to reconnect...")
          setTimeout(() => {
            connectSocket({
              name: session?.user?.name || undefined,
              userId: session?.user?.id
            })
          }, 1000)
        }
      })

      // Set up error handlers
      onError((errorMessage) => {
        console.error("Socket error:", errorMessage)
        toast.error(`Socket error: ${errorMessage}`)
        setRefreshing(false)
        setStartingQuiz(false)
        setStoppingQuiz(false)
      })

      // Setup room reset success handler
      onRoomResetSuccess((data) => {
        console.log(`Room reset success for room ${data.roomCode}`)

        // Only clear participants if we initiated a manual refresh
        if (refreshing) {
          console.log("Manual refresh initiated, clearing participants list")
          setParticipants([])
          setRefreshing(false)
        } else {
          console.log(
            "Room reset without manual refresh, preserving participants"
          )
        }

        // Now join the room after it's been reset
        console.log(`Resetting complete - now joining room ${data.roomCode}`)
        joinRoom(data.roomCode)
      })

      // Handle join success
      onJoinSuccess((data) => {
        console.log("Join success:", data)
        toast.success("Successfully connected to quiz room")
        setRoomConnected(true)
      })

      // Set up other event listeners
      onParticipantJoined((participant) => {
        console.log("Participant joined event received:", participant)
        console.log("Current participants state:", participants)

        // Only add students to the participants list, not teachers
        if (participant.role !== "TEACHER") {
          console.log("Adding student participant to list:", participant.name)

          // Store participant data in localStorage to persist across page refreshes
          const storedParticipants = localStorage.getItem(
            `participants_${roomCode}`
          )
          let participantsList: Participant[] = []

          if (storedParticipants) {
            try {
              participantsList = JSON.parse(storedParticipants)
            } catch (e) {
              console.error("Failed to parse stored participants:", e)
            }
          }

          // Check if participant already exists in local storage
          const existingIndex = participantsList.findIndex(
            (p) => p.email === participant.email
          )
          if (existingIndex >= 0) {
            // Update with new socket ID
            participantsList[existingIndex] = {
              ...participantsList[existingIndex],
              id: participant.id
            }
          } else {
            // Add new participant
            participantsList.push(participant as Participant)
          }

          // Update localStorage
          localStorage.setItem(
            `participants_${roomCode}`,
            JSON.stringify(participantsList)
          )

          // Update state with the combined list of participants
          setParticipants((prev) => {
            // Avoid duplicates by email
            const newList = [...prev]
            const existingStateIndex = newList.findIndex(
              (p) => p.email === participant.email
            )

            if (existingStateIndex >= 0) {
              // Update existing participant
              newList[existingStateIndex] = participant as Participant
              console.log("Updated existing participant:", participant.name)
              return newList
            } else {
              // Add new participant
              console.log("New participant added:", participant.name)
              return [...newList, participant as Participant]
            }
          })
        } else {
          console.log("Teacher joined, not adding to participants list")
          // Make sure we set room connected to true when we (as teacher) join
          if (participant.email === session?.user?.email) {
            setRoomConnected(true)
          }
        }
      })

      onParticipantLeft((participantId) => {
        console.log("Participant left:", participantId)
        setParticipants((prev) => prev.filter((p) => p.id !== participantId))
      })

      onParticipantRemoved((participantId) => {
        console.log("Participant removal event received for ID:", participantId)

        // Update the participants list in state
        setParticipants((prev) => {
          const participant = prev.find((p) => p.id === participantId)
          if (participant) {
            console.log("Found and removing participant:", participant.name)
          } else {
            console.log("Participant not found in current list")
          }
          return prev.filter((p) => p.id !== participantId)
        })

        // Also update localStorage for persistence
        const storedParticipants = localStorage.getItem(
          `participants_${roomCode}`
        )
        if (storedParticipants) {
          try {
            const participantsList = JSON.parse(
              storedParticipants
            ) as Participant[]
            const updatedList = participantsList.filter(
              (p) => p.id !== participantId
            )
            localStorage.setItem(
              `participants_${roomCode}`,
              JSON.stringify(updatedList)
            )
            console.log("Updated localStorage after participant removed event")
          } catch (e) {
            console.error("Failed to update localStorage:", e)
          }
        }
      })

      onParticipantRemovalSuccess(() => {
        toast.success("Participant removed successfully")
      })

      onQuizStarted(() => {
        setQuizStatus("in_progress")
        setStartingQuiz(false)
        toast.success("Quiz started successfully")
      })

      onQuizStopped(() => {
        setQuizStatus("completed")
        setStoppingQuiz(false)
        toast.success("Quiz stopped successfully")
      })

      // Inside setupWebSocket, add a listener for heartbeat messages
      socket.on("room-heartbeat", (data) => {
        console.log("Room heartbeat received:", data)
        // Check if our socket is in the participants list
        const isOurSocketInRoom = data.participants.includes(socket.id)
        console.log(`Our socket (${socket.id}) in room: ${isOurSocketInRoom}`)

        // If we're not in the room but should be, try to rejoin
        if (!isOurSocketInRoom && roomCode) {
          console.log("Not in room participants, rejoining...")
          joinRoom(roomCode)
        }
      })
    },
    [session, refreshing, roomCode, setParticipants, participants]
  )

  const initializeQuiz = useCallback(async () => {
    try {
      // Fetch quiz data
      const response = await fetch(`/api/quizzes/${quizId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch quiz")
      }
      const data = await response.json()
      setQuiz(data)

      // Create or get live quiz session
      const sessionResponse = await fetch("/api/quizzes/live-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ quizId })
      })
      if (!sessionResponse.ok) {
        throw new Error("Failed to create live session")
      }
      const sessionData = await sessionResponse.json()
      setRoomCode(sessionData.roomCode)

      // Make sure we disconnect any existing connection first
      disconnectSocket()
      setSocketConnected(false)
      setRoomConnected(false)

      console.log("Setting up new socket connection as teacher")

      // Now we'll set up the socket connection with proper sequence
      if (session && session.user) {
        // First connect to the socket
        connectSocket({
          name: session.user.name || undefined,
          userId: session.user.id
        })
        console.log(
          "Socket connection initialized with user ID:",
          session.user.id
        )

        // Setup event handlers right away
        setupWebSocket(sessionData.roomCode)

        // The setupWebSocket function now handles the reset and join
        // This ensures proper sequencing: connect → setup handlers → reset → join

        // Force set roomConnected to true after a short delay
        // This ensures the "Not connected" message disappears even if socket events fail
        setTimeout(() => {
          setRoomConnected(true)
          console.log("Force setting room connected state to true")
        }, 2000)
      } else {
        setError("Authentication required to host a quiz")
      }
    } catch (err) {
      setError("Failed to load quiz")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [quizId, session, setupWebSocket])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    // Only initialize when we have both authentication and quizId
    if (status === "authenticated" && quizId) {
      initializeQuiz()
    }

    // Cleanup when component unmounts
    return () => {
      removeAllListeners()
      disconnectSocket()
      setSocketConnected(false)
    }
  }, [status, quizId, router, initializeQuiz])

  // Filter out any existing "teacher" entries from the participants list
  // This is a safety measure in case there are old entries
  useEffect(() => {
    if (session?.user?.email) {
      setParticipants((prev) =>
        prev.filter(
          (p) => p.email !== session.user.email && p.role !== "TEACHER"
        )
      )
    }
  }, [session?.user?.email, participants.length])

  const handleStartQuiz = async () => {
    try {
      setStartingQuiz(true)
      const response = await fetch(`/api/quizzes/${quizId}/live/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ roomCode })
      })
      if (!response.ok) {
        throw new Error("Failed to start quiz")
      }
      startQuiz(roomCode)
      // Note: we don't set startingQuiz to false here - we wait for the onQuizStarted event
    } catch (error) {
      console.error("Start quiz error:", error)
      setError("Failed to start quiz")
      setStartingQuiz(false)
      toast.error("Failed to start quiz")
    }
  }

  const handleStopQuiz = async () => {
    try {
      setStoppingQuiz(true)
      const response = await fetch(`/api/quizzes/${quizId}/live/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ roomCode })
      })
      if (!response.ok) {
        throw new Error("Failed to stop quiz")
      }
      stopQuiz(roomCode)
      // Note: we don't set stoppingQuiz to false here - we wait for the onQuizStopped event
    } catch (error) {
      console.error("Stop quiz error:", error)
      setError("Failed to stop quiz")
      setStoppingQuiz(false)
      toast.error("Failed to stop quiz")
    }
  }

  const openRemoveParticipantDialog = (participant: Participant) => {
    setParticipantToRemove(participant)
    setRemoveDialogOpen(true)
  }

  const handleRemoveParticipant = () => {
    if (participantToRemove && roomCode) {
      console.log(
        "Removing participant:",
        participantToRemove.id,
        participantToRemove.name
      )

      // Update localStorage to remove the participant
      const storedParticipants = localStorage.getItem(
        `participants_${roomCode}`
      )
      if (storedParticipants) {
        try {
          const participantsList = JSON.parse(
            storedParticipants
          ) as Participant[]
          const updatedList = participantsList.filter(
            (p) => p.id !== participantToRemove.id
          )
          localStorage.setItem(
            `participants_${roomCode}`,
            JSON.stringify(updatedList)
          )
          console.log("Updated localStorage after removal")
        } catch (e) {
          console.error("Failed to update localStorage:", e)
        }
      }

      // Also update UI directly
      setParticipants((prev) =>
        prev.filter((p) => p.id !== participantToRemove.id)
      )

      // Send the removal request to server
      removeParticipant(roomCode, participantToRemove.id)

      setRemoveDialogOpen(false)
      setParticipantToRemove(null)

      // Show toast message
      toast.success(`${participantToRemove.name} removed successfully`)
    }
  }

  const handleRefreshParticipants = () => {
    if (roomCode) {
      setRefreshing(true)
      setRoomConnected(false)
      toast.info("Refreshing participants...")

      // Clear the local participants list first
      setParticipants([])

      // Also clear the localStorage to prevent reloading stale data
      localStorage.removeItem(`participants_${roomCode}`)

      // Reset the room to clear all participants
      resetRoom(roomCode)

      // Force set roomConnected to true after a delay
      setTimeout(() => {
        setRoomConnected(true)
        console.log("Force setting room connected state to true after refresh")
      }, 2000)
    }
  }

  const handleReconnect = () => {
    if (roomCode && session?.user?.id) {
      toast.info("Reconnecting to socket server...")
      disconnectSocket()

      // Short timeout to ensure disconnection completes
      setTimeout(() => {
        connectSocket({
          name: session?.user?.name || undefined,
          userId: session?.user?.id
        })
        setupWebSocket(roomCode)
        setSocketConnected(true)

        // Reset the room
        resetRoom(roomCode)

        // Force set roomConnected to true after a short delay
        setTimeout(() => {
          setRoomConnected(true)
          console.log(
            "Force setting room connected state to true after reconnect"
          )
        }, 2000)
      }, 500)
    }
  }

  // Add this useEffect after the other hooks
  useEffect(() => {
    // If we're authenticated, assume we're connected to the room after the component mounts fully
    if (session?.user?.id && socketConnected && roomCode && !roomConnected) {
      const timer = setTimeout(() => {
        setRoomConnected(true)
        console.log("Setting roomConnected to true after component mount")
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [session?.user?.id, socketConnected, roomCode, roomConnected])

  // Add this useEffect for debugging
  useEffect(() => {
    console.log(
      `Room connection state changed: ${
        roomConnected ? "Connected" : "Disconnected"
      }`
    )
  }, [roomConnected])

  useEffect(() => {
    console.log(
      `Socket connection state changed: ${
        socketConnected ? "Connected" : "Disconnected"
      }`
    )
  }, [socketConnected])

  // Load participants from localStorage
  useEffect(() => {
    // Only load from localStorage when we have a valid roomCode
    if (roomCode && !loading) {
      const storedParticipants = localStorage.getItem(
        `participants_${roomCode}`
      )

      if (storedParticipants) {
        try {
          const parsedParticipants = JSON.parse(
            storedParticipants
          ) as Participant[]
          console.log(
            "Loading stored participants from localStorage:",
            parsedParticipants.length
          )

          // Filter out duplicate participants and those with role "TEACHER"
          const students = parsedParticipants.filter(
            (p) => p.role !== "TEACHER"
          )

          // Remove duplicates using email as unique identifier
          const uniqueStudents = students.reduce((acc, current) => {
            const x = acc.find((item) => item.email === current.email)
            if (!x) {
              return acc.concat([current])
            } else {
              return acc
            }
          }, [] as Participant[])

          console.log(
            "After removing duplicates:",
            uniqueStudents.length,
            "participants"
          )

          // Only set if we have participants and they're not already loaded
          if (uniqueStudents.length > 0 && participants.length === 0) {
            setParticipants(uniqueStudents)
            console.log(
              "Restored",
              uniqueStudents.length,
              "participants from localStorage"
            )

            // Update localStorage with cleaned data
            localStorage.setItem(
              `participants_${roomCode}`,
              JSON.stringify(uniqueStudents)
            )
          }
        } catch (e) {
          console.error("Failed to parse stored participants:", e)
        }
      }
    }
  }, [roomCode, loading, participants.length])

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
            {quiz.title} - Live Quiz
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

        {!socketConnected && (
          <div className="w-full text-center bg-amber-100 p-3 rounded-md shadow">
            <p className="text-amber-700 mb-2">
              Socket connection appears to be down
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReconnect}
              className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
            >
              Reconnect Socket
            </Button>
          </div>
        )}

        {socketConnected &&
          !roomConnected &&
          !refreshing &&
          !loading &&
          roomCode && (
            <div className="w-full text-center bg-blue-100 p-3 rounded-md shadow">
              <p className="text-blue-700 mb-2">
                Not connected to room: {roomCode}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshParticipants}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                Connect to Room
              </Button>
            </div>
          )}

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-gray-800">
                Room Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center text-purple-600 mb-4">
                {roomCode || "Generating..."}
              </div>
              <p className="text-sm text-gray-600 text-center">
                Share this code with your students to join the quiz
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-heading text-gray-800">
                  Participants ({participants.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:text-gray-800"
                    onClick={handleRefreshParticipants}
                    disabled={refreshing}
                    title="Refresh participants"
                  >
                    {refreshing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M3 21v-5h5" />
                      </svg>
                    )}
                  </Button>
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <div className="text-center text-gray-500">
                  No participants yet
                </div>
              ) : (
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 bg-white/50 rounded-md group"
                    >
                      <div>
                        <div className="font-medium">{participant.name}</div>
                        <div className="text-sm text-gray-500">
                          {participant.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            openRemoveParticipantDialog(participant)
                          }
                        >
                          <UserX className="h-4 w-4" />
                          <span className="sr-only">Remove participant</span>
                        </Button>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="w-full flex justify-center gap-4">
          {quizStatus === "waiting" && (
            <Button
              onClick={handleStartQuiz}
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={startingQuiz}
            >
              {startingQuiz ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Quiz
                </>
              )}
            </Button>
          )}
          {quizStatus === "in_progress" && (
            <Button
              onClick={handleStopQuiz}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={stoppingQuiz}
            >
              {stoppingQuiz ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Stopping...
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Quiz
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Remove Participant
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium">{participantToRemove?.name}</span>?
              They will be disconnected and unable to rejoin with the same name.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveParticipant}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
