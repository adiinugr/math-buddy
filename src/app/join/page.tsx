"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "next-auth/react"
import { connectSocket, disconnectSocket, joinRoom } from "@/lib/socket"
import {
  Rocket,
  BookOpen,
  ArrowRight,
  Key,
  CheckCircle2,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Breadcrumbs from "@/components/breadcrumbs"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"

const joinFormSchema = z.object({
  code: z
    .string()
    .min(1, { message: "Room code is required" })
    .max(10, { message: "Room code cannot exceed 10 characters" }),
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name cannot exceed 50 characters" })
})

type JoinFormValues = z.infer<typeof joinFormSchema>

export default function JoinPage() {
  const [code] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [type, setType] = useState<"live" | "assessment">("live")
  const [joined, setJoined] = useState(false)
  const [waitingMessage, setWaitingMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { status } = useSession()

  const form = useForm<JoinFormValues>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      code: "",
      name: ""
    }
  })

  // Cleanup sockets when component unmounts
  useEffect(() => {
    return () => {
      console.log("Join page unmounting - cleaning up sockets")
      disconnectSocket()
    }
  }, [])

  // Check if there's a saved name when page loads
  useEffect(() => {
    const savedName = localStorage.getItem("studentName")
    if (savedName) {
      setName(savedName)
      form.setValue("name", savedName)
    }
  }, [form])

  const handleJoin = async (values: JoinFormValues) => {
    const formCode = values.code || code
    const formName = values.name || name

    if (!formCode) {
      setError("Please enter a code")
      return
    }

    if (!formName) {
      setError("Please enter your name")
      return
    }

    setLoading(true)
    setError("")

    try {
      if (type === "live") {
        // First make sure to disconnect any existing connections
        disconnectSocket()

        // Normalize the room code to uppercase
        const normalizedCode = formCode.toUpperCase()
        console.log("Verifying room code:", normalizedCode)

        // Verify the room code exists
        const response = await fetch("/api/quizzes/verify-room", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ roomCode: normalizedCode })
        })

        if (!response.ok) {
          throw new Error("Invalid room code")
        }

        const data = await response.json()
        const currentQuizId = data.quizId

        console.log("Room verified, quiz ID:", currentQuizId)
        console.log("Connecting socket with name:", formName)

        // Store the room code in localStorage for the student page to use
        localStorage.setItem("currentRoomCode", normalizedCode)
        localStorage.setItem("studentName", formName)
        console.log("Stored room code in localStorage:", normalizedCode)

        // Connect to socket for live quiz with guest name
        disconnectSocket() // Make sure we fully disconnect first
        const socket = connectSocket({ name: formName })
        console.log(
          "Socket connected with name:",
          formName,
          "Socket ID:",
          socket.id
        )

        // Reset any previous listeners
        socket.removeAllListeners()
        console.log("All previous listeners removed")

        console.log("Setting up event listeners")

        // Set up event listeners
        socket.on("connect", () => {
          console.log(
            "Socket connected with ID:",
            socket.id,
            "joining room:",
            normalizedCode
          )
          // Only join room after socket is connected
          joinRoom(normalizedCode)
          console.log("Emitted join-room event for room:", normalizedCode)

          // Debug after 1 second to check socket state
          setTimeout(() => {
            console.log("Socket state after 1s:", {
              id: socket.id,
              connected: socket.connected,
              disconnected: socket.disconnected
            })
          }, 1000)
        })

        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err)
          setError(`Connection error: ${err.message}`)
          setLoading(false)
          toast.error(`Connection error: ${err.message}`)
        })

        socket.on("participant-joined", (participant) => {
          console.log("Participant joined:", participant)
        })

        socket.on("error", (errorMsg) => {
          console.error("Socket error:", errorMsg)
          setError(errorMsg)
          setLoading(false)
          toast.error(`Error: ${errorMsg}`)
        })

        socket.on("quiz-started", () => {
          console.log(
            "Quiz started, navigating to:",
            `/quizzes/${currentQuizId}/live/student`
          )
          router.push(`/quizzes/${currentQuizId}/live/student`)
        })

        socket.on("quiz-stopped", () => {
          console.log("Quiz stopped, returning to home")
          router.push("/")
        })

        socket.on("join-success", (data) => {
          console.log("Join success:", data)
          setJoined(true)
          setWaitingMessage(data.message)
          setLoading(false)
          toast.success("Successfully joined quiz")
        })

        socket.on("room-heartbeat", (data) => {
          console.log("Room heartbeat received:", data)
          const isInRoom = data.participants.includes(socket.id)
          console.log(`My socket (${socket.id}) in room: ${isInRoom}`)

          // If not in room, try to rejoin
          if (!isInRoom) {
            console.log("Not found in room participants, rejoining...")
            joinRoom(normalizedCode)
          }
        })
      } else {
        // Assessment flow - updated to use our new pattern
        const cleanName = formName.trim()
        const assessmentCode = formCode.toUpperCase()

        console.log("Assessment join - saving name to localStorage:", cleanName)
        localStorage.setItem("studentName", cleanName)

        // First, verify the assessment exists
        const verifyResponse = await fetch(
          `/api/quizzes/verify-room?code=${assessmentCode}`
        )

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json()
          throw new Error(errorData.error || "Invalid assessment code")
        }

        console.log("Assessment verified, joining with code:", assessmentCode)

        // Join the assessment
        const joinResponse = await fetch("/api/quizzes/join", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ code: assessmentCode, name: cleanName })
        })

        if (!joinResponse.ok) {
          const errorData = await joinResponse.json()
          throw new Error(errorData.error || "Failed to join assessment")
        }

        const joinData = await joinResponse.json()
        console.log(
          "Successfully joined, got participantId:",
          joinData.participantId
        )

        // Store participant ID in sessionStorage for the assessment page
        sessionStorage.setItem("currentParticipantId", joinData.participantId)
        console.log("Stored participantId in sessionStorage, redirecting")

        toast.success("Successfully joined assessment!")

        // Redirect directly to the take page with participant ID
        router.push(
          `/assessment/take/${assessmentCode}?participant=${joinData.participantId}`
        )
      }
    } catch (error) {
      console.error("Error joining:", error)
      setError(error instanceof Error ? error.message : "Failed to join")
      setLoading(false)
      toast.error(
        `Failed to join: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      )
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="flex flex-col gap-8 items-center justify-center w-full h-full max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute top-1 left-1 w-14 h-14 border-4 border-t-transparent border-r-blue-300 border-b-transparent border-l-purple-300 rounded-full animate-spin animate-reverse"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mt-6">
              Memuat...
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Harap tunggu sementara kami menyiapkan sesi Anda
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (joined) {
    return (
      <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="flex flex-col gap-8 items-center w-full max-w-2xl mx-auto relative">
          <div className="w-full">
            <Breadcrumbs items={[{ label: "Gabung", current: true }]} />
          </div>

          <div className="w-full backdrop-blur-lg bg-white/30 p-6 rounded-xl border border-white/20 shadow-lg">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-3 rounded-full bg-green-500/20 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4 font-heading">
                Berhasil Bergabung!
              </h2>
              <p className="text-gray-700 text-base mb-6">{waitingMessage}</p>
              <div className="flex items-center justify-center gap-2 p-4 bg-blue-100 rounded-lg">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <span className="text-blue-700">
                  Menunggu guru memulai kuis...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex flex-col gap-8 items-center w-full max-w-2xl mx-auto relative">
        <div className="w-full">
          <Breadcrumbs items={[{ label: "Gabung", current: true }]} />
        </div>

        <div className="w-full backdrop-blur-lg bg-white/30 p-6 rounded-xl border border-white/20 shadow-lg">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-2 rounded-full bg-blue-500/20 mb-3">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3 font-heading">
              Gabung {type === "live" ? "Kuis Langsung" : "Penilaian"}
            </h2>
            <p className="text-gray-700 text-base">
              {type === "live"
                ? "Masukkan kode kuis yang diberikan oleh guru Anda untuk bergabung dengan sesi langsung"
                : "Masukkan kode penilaian untuk memulai evaluasi Anda"}
            </p>
          </div>

          <div className="space-y-4">
            <Tabs
              defaultValue="live"
              onValueChange={(value) => setType(value as "live" | "assessment")}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="live" className="flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  Kuis Langsung
                </TabsTrigger>
                <TabsTrigger
                  value="assessment"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Penilaian
                </TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="space-y-4">
                <div className="space-y-3">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleJoin)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kode Ruangan</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Masukkan kode ruangan"
                                autoComplete="off"
                                {...field}
                                value={field.value.toUpperCase()}
                                onChange={(e) =>
                                  field.onChange(e.target.value.toUpperCase())
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Anda</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Masukkan nama Anda"
                                autoComplete="name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                          {error}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Bergabung...
                          </>
                        ) : (
                          <>
                            Gabung Kuis
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>

              <TabsContent value="assessment" className="space-y-4">
                <div className="space-y-3">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleJoin)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kode Penilaian</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Masukkan kode penilaian"
                                autoComplete="off"
                                {...field}
                                value={field.value.toUpperCase()}
                                onChange={(e) =>
                                  field.onChange(e.target.value.toUpperCase())
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Anda</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Masukkan nama Anda"
                                autoComplete="name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                          {error}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Bergabung...
                          </>
                        ) : (
                          <>
                            Gabung Penilaian
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="w-full backdrop-blur-lg bg-white/30 p-6 rounded-xl border border-white/20 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 font-heading">
              No account required
            </h3>
            <p className="text-gray-600 text-sm max-w-md">
              Join quizzes and assessments instantly without creating an
              account. Your progress will be saved for future reference.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
