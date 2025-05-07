"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { io, Socket } from "socket.io-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function SocketTestPage() {
  const [status, setStatus] = useState<string>("Disconnected")
  const [socketId, setSocketId] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [roomCode, setRoomCode] = useState<string>("TEST123")
  const [showRoomHelp, setShowRoomHelp] = useState(false)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  const connectSocket = () => {
    addLog("Connecting to socket server...")

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
    addLog(`Using socket URL: ${socketUrl}`)

    try {
      const newSocket = io(socketUrl, {
        withCredentials: true,
        auth: { name: "TestUser" }
      })

      newSocket.on("connect", () => {
        setStatus("Connected")
        setSocketId(newSocket.id || null)
        addLog(`Socket connected with ID: ${newSocket.id}`)
      })

      newSocket.on("connect_error", (err) => {
        setStatus(`Error: ${err.message}`)
        addLog(`Connection error: ${err.message}`)
      })

      newSocket.on("disconnect", (reason) => {
        setStatus(`Disconnected: ${reason}`)
        setSocketId(null)
        addLog(`Socket disconnected: ${reason}`)
      })

      newSocket.on("error", (errorMsg) => {
        addLog(`Socket error: ${errorMsg}`)
        if (errorMsg === "Invalid room code") {
          setShowRoomHelp(true)
        }
      })

      newSocket.on("participant-joined", (data) => {
        addLog(`Participant joined: ${JSON.stringify(data)}`)
        setShowRoomHelp(false)
      })

      newSocket.on("join-success", (data) => {
        addLog(`Join success: ${JSON.stringify(data)}`)
        setShowRoomHelp(false)
      })

      newSocket.on("room-reset-success", (data) => {
        addLog(`Room reset success: ${JSON.stringify(data)}`)
      })

      setSocket(newSocket)
    } catch (err) {
      addLog(`Error initializing socket: ${err}`)
      setStatus(`Initialization error`)
    }
  }

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      addLog("Socket manually disconnected")
    }
  }

  const joinRoom = () => {
    if (socket) {
      addLog(`Attempting to join room: ${roomCode}`)
      socket.emit("join-room", roomCode)
    } else {
      addLog("Cannot join room: Socket not connected")
    }
  }

  const resetRoom = () => {
    if (socket) {
      addLog(`Attempting to reset room: ${roomCode}`)
      socket.emit("reset-room", roomCode)
    } else {
      addLog("Cannot reset room: Socket not connected")
    }
  }

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [socket])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Socket Connection Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Socket Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-semibold">
                  Status:{" "}
                  <span
                    className={
                      status === "Connected"
                        ? "text-green-500"
                        : status.startsWith("Error")
                        ? "text-red-500"
                        : "text-amber-500"
                    }
                  >
                    {status}
                  </span>
                </p>
                {socketId && (
                  <p className="text-sm text-gray-500">Socket ID: {socketId}</p>
                )}
              </div>

              <div className="space-x-2">
                <Button onClick={connectSocket} disabled={!!socket}>
                  Connect
                </Button>
                <Button
                  onClick={disconnectSocket}
                  disabled={!socket}
                  variant="outline"
                >
                  Disconnect
                </Button>
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex space-x-2 items-center">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Room code"
                  />
                </div>

                {showRoomHelp && (
                  <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm flex items-start space-x-2 border border-amber-200">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>You must use a valid room code from a live quiz.</p>
                      <p className="mt-1">
                        <Link
                          href="/quizzes"
                          className="underline hover:text-amber-900"
                        >
                          Go to your quizzes
                        </Link>{" "}
                        and start a live session to get a valid room code.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-x-2">
                  <Button
                    onClick={joinRoom}
                    disabled={!socket}
                    variant="secondary"
                  >
                    Join Room
                  </Button>
                  <Button
                    onClick={resetRoom}
                    disabled={!socket}
                    variant="destructive"
                  >
                    Reset Room
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] overflow-y-auto border rounded-md p-2 text-sm font-mono">
              {logs.length === 0 ? (
                <p className="text-gray-400">No logs yet...</p>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 py-1 last:border-0"
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
            <Button
              onClick={() => setLogs([])}
              variant="outline"
              className="mt-2"
              size="sm"
            >
              Clear Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-md">
        <h2 className="font-semibold text-blue-700 mb-2">
          How to use this test page
        </h2>
        <ol className="list-decimal pl-5 text-blue-700 space-y-1">
          <li>Click &quot;Connect&quot; to establish a socket connection</li>
          <li>Enter a valid room code from one of your live quiz sessions</li>
          <li>Click &quot;Join Room&quot; to attempt to join the room</li>
          <li>
            If you get &quot;Invalid room code&quot;, go to your quizzes, open a
            quiz, and start a live session
          </li>
          <li>Copy the room code from the live session and try again</li>
        </ol>
        <p className="mt-3 text-blue-700">
          <Link href="/quizzes" className="underline hover:text-blue-900">
            Go to your quizzes →
          </Link>
        </p>
      </div>
    </div>
  )
}
