import { io, Socket } from "socket.io-client"

// Event names enum for type safety
export enum SocketEvent {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  ERROR = "error",
  JOIN_ROOM = "join-room",
  LEAVE_ROOM = "leave-room",
  QUIZ_STARTED = "quiz-started",
  QUIZ_STOPPED = "quiz-stopped",
  QUESTION_STARTED = "question-started",
  SUBMIT_ANSWER = "submit-answer",
  PARTICIPANT_JOINED = "participant-joined",
  PARTICIPANT_LEFT = "participant-left",
  JOIN_SUCCESS = "join-success",
  ROOM_RESET = "reset-room",
  ROOM_RESET_SUCCESS = "room-reset-success",
  REMOVE_PARTICIPANT = "remove-participant",
  REMOVED_FROM_QUIZ = "removed-from-quiz",
  PARTICIPANT_REMOVED = "participant-removed",
  PARTICIPANT_REMOVAL_SUCCESS = "participant-removal-success"
}

// Enhanced interfaces with better type safety
interface Participant {
  id: string
  name: string | null
  email: string
  joinedAt: string
  role: "TEACHER" | "STUDENT"
  status?: "active" | "inactive"
}

interface AnswerData {
  roomCode: string
  questionId: string
  answer: number
  userId?: string
  timestamp: number
}

interface JoinSuccessData {
  message: string
  userId?: string
  roomCode: string
  participants: Participant[]
}

interface RemovalData {
  participantId: string
  message: string
  roomCode: string
}

interface RoomResetData {
  roomCode: string
  timestamp: number
}

interface SocketConfig {
  name?: string
  userId?: string
  role?: "TEACHER" | "STUDENT"
  autoReconnect?: boolean
  maxReconnectAttempts?: number
  reconnectDelay?: number
}

// Connection state management
interface ConnectionState {
  isConnected: boolean
  isConnecting: boolean
  lastError?: string
  reconnectAttempts: number
  lastActivity?: number
}

// Used to store the socket instance
let socket: Socket | null = null

// Enhanced connection state tracking
const connectionState: ConnectionState = {
  isConnected: false,
  isConnecting: false,
  reconnectAttempts: 0
}

// Constants for connection management
const DEFAULT_CONFIG: SocketConfig = {
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000
}

// Event queue for offline operations
const eventQueue: Array<{
  event: string
  data: unknown
  timestamp: number
}> = []

// Enhanced error tracking with timestamps
interface SocketError {
  message: string
  timestamp: number
  type: "connection" | "operation" | "event"
}

const socketErrors: SocketError[] = []
const MAX_ERRORS = 10

/**
 * Connect to the socket server with enhanced error handling and reconnection
 */
export const connectSocket = (config: SocketConfig = {}): Socket => {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config }

    // If we already have a socket, return it
    if (socket?.connected) {
      console.log("Socket already connected, reusing connection")
      return socket
    }

    // If we have a disconnected socket, try to reconnect it
    if (socket) {
      console.log("Socket exists but disconnected, attempting to reconnect")
      socket.connect()
      return socket
    }

    // Create a new socket connection
    console.log("Creating new socket connection")
    connectionState.isConnecting = true

    const baseUrl =
      process.env.NODE_ENV === "development" ? "http://localhost:3000" : ""

    // Create the socket with enhanced options
    socket = io(baseUrl, {
      path: "/api/socketio",
      autoConnect: true,
      reconnection: finalConfig.autoReconnect,
      reconnectionAttempts: finalConfig.maxReconnectAttempts,
      reconnectionDelay: finalConfig.reconnectDelay,
      timeout: 10000,
      query: {
        name: config.name || "Anonymous",
        userId: config.userId,
        role: config.role || "STUDENT"
      }
    })

    // Enhanced event handlers
    setupSocketEventHandlers(socket)

    return socket
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logSocketError({
      message: `Connection error: ${errorMessage}`,
      type: "connection",
      timestamp: Date.now()
    })
    throw error
  }
}

/**
 * Setup enhanced socket event handlers
 */
function setupSocketEventHandlers(socket: Socket): void {
  socket.on(SocketEvent.CONNECT, () => {
    connectionState.isConnected = true
    connectionState.isConnecting = false
    connectionState.reconnectAttempts = 0
    connectionState.lastActivity = Date.now()
    logSocketEvent("Connected to socket server")
    processEventQueue()
  })

  socket.on(SocketEvent.DISCONNECT, (reason) => {
    connectionState.isConnected = false
    logSocketEvent(`Disconnected from socket server: ${reason}`)
  })

  socket.on(SocketEvent.ERROR, (error) => {
    logSocketError({
      message: `Socket error: ${error}`,
      type: "operation",
      timestamp: Date.now()
    })
  })

  // Add more event handlers as needed
}

/**
 * Process queued events when connection is restored
 */
function processEventQueue(): void {
  if (!socket?.connected) return

  while (eventQueue.length > 0) {
    const event = eventQueue.shift()
    if (event) {
      socket.emit(event.event, event.data)
    }
  }
}

/**
 * Enhanced error logging with structured data
 */
function logSocketError(error: SocketError): void {
  console.error(`[Socket Error] ${error.message}`)
  socketErrors.push(error)

  if (socketErrors.length > MAX_ERRORS) {
    socketErrors.shift()
  }

  // Store errors in localStorage for debugging
  try {
    localStorage.setItem("socketErrors", JSON.stringify(socketErrors))
  } catch {
    console.warn("Could not store socket errors in localStorage")
  }
}

/**
 * Enhanced event logging
 */
function logSocketEvent(event: string): void {
  console.log(`[Socket] ${event}`)
  connectionState.lastActivity = Date.now()
}

/**
 * Join a room
 */
export const joinRoom = (roomCode: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      const error = new Error("Cannot join room: Socket not connected")
      logSocketError({
        message: error.message,
        type: "operation",
        timestamp: Date.now()
      })
      reject(error)
      return
    }

    try {
      console.log(`Joining room: ${roomCode}`)
      socket.emit(
        SocketEvent.JOIN_ROOM,
        roomCode,
        (response: { error?: string }) => {
          if (response.error) {
            reject(new Error(response.error))
          } else {
            resolve()
          }
        }
      )
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Leave a room
 */
export const leaveRoom = (roomCode: string): void => {
  if (!socket) {
    console.error("Cannot leave room: Socket not connected")
    return
  }

  console.log(`Leaving room: ${roomCode}`)
  socket.emit(SocketEvent.LEAVE_ROOM, roomCode)
}

/**
 * Submit an answer to a question
 */
export const submitAnswer = (data: AnswerData): void => {
  if (!socket) {
    console.error("Cannot submit answer: Socket not connected")
    return
  }

  console.log(`Submitting answer for question ${data.questionId}:`, data.answer)
  socket.emit(SocketEvent.SUBMIT_ANSWER, data)
}

/**
 * Listen for quiz started event
 */
export const onQuizStarted = (callback: () => void): void => {
  if (!socket) {
    console.error("Cannot listen for quiz started: Socket not connected")
    return
  }

  socket.on(SocketEvent.QUIZ_STARTED, callback)
}

/**
 * Listen for question started event
 */
export const onQuestionStarted = (
  callback: (question: unknown) => void
): void => {
  if (!socket) {
    console.error("Cannot listen for question started: Socket not connected")
    return
  }

  socket.on(SocketEvent.QUESTION_STARTED, callback)
}

/**
 * Listen for quiz stopped event
 */
export const onQuizStopped = (callback: () => void): void => {
  if (!socket) {
    console.error("Cannot listen for quiz stopped: Socket not connected")
    return
  }

  socket.on(SocketEvent.QUIZ_STOPPED, callback)
}

/**
 * Listen for error events
 */
export const onError = (callback: (error: string) => void): void => {
  if (!socket) {
    console.error("Cannot listen for errors: Socket not connected")
    return
  }

  socket.on(SocketEvent.ERROR, callback)
}

/**
 * Remove all event listeners
 */
export const removeAllListeners = (): void => {
  if (!socket) {
    console.error("Cannot remove listeners: Socket not connected")
    return
  }

  socket.removeAllListeners()
}

/**
 * Disconnect the socket
 */
export const disconnectSocket = (): void => {
  if (!socket) {
    console.warn("No socket to disconnect")
    return
  }

  console.log("Disconnecting socket")
  socket.disconnect()
}

/**
 * Get the current socket instance
 */
export const getSocket = (): Socket | null => {
  return socket
}

/**
 * Get socket status
 */
export const getSocketStatus = (): {
  connected: boolean
  id?: string
  connectionAttempts: number
  lastErrors: string[]
} => {
  return {
    connected: socket?.connected || false,
    id: socket?.id,
    connectionAttempts: connectionState.reconnectAttempts,
    lastErrors: socketErrors.map((e) => e.message)
  }
}

/**
 * Get enhanced socket diagnostics
 */
export const getSocketDiagnostics = (): string => {
  if (!socket) {
    return "No socket instance created"
  }

  return JSON.stringify(
    {
      id: socket.id,
      connected: socket.connected,
      disconnected: socket.disconnected,
      connectionState,
      errors: socketErrors,
      eventQueueLength: eventQueue.length,
      lastActivity: connectionState.lastActivity,
      serverUrl:
        typeof window !== "undefined" ? window.location.origin : "unknown"
    },
    null,
    2
  )
}

// Event listeners
export const onParticipantJoined = (
  callback: (participant: Participant) => void
) => {
  if (socket) {
    socket.on(SocketEvent.PARTICIPANT_JOINED, callback)
  }
}

export const onParticipantLeft = (
  callback: (participantId: string) => void
) => {
  if (socket) {
    socket.on(SocketEvent.PARTICIPANT_LEFT, callback)
  }
}

export const onJoinSuccess = (callback: (data: JoinSuccessData) => void) => {
  if (socket) {
    socket.on(SocketEvent.JOIN_SUCCESS, callback)
  }
}

export const onRoomResetSuccess = (callback: (data: RoomResetData) => void) => {
  if (socket) {
    socket.on(SocketEvent.ROOM_RESET_SUCCESS, callback)
  }
}

export const removeParticipant = (roomCode: string, participantId: string) => {
  if (socket) {
    socket.emit(SocketEvent.REMOVE_PARTICIPANT, { roomCode, participantId })
  }
}

export const onRemovedFromQuiz = (
  callback: (data: { message: string }) => void
) => {
  if (socket) {
    socket.on(SocketEvent.REMOVED_FROM_QUIZ, callback)
  }
}

export const onParticipantRemoved = (
  callback: (participantId: string) => void
) => {
  if (socket) {
    socket.on(SocketEvent.PARTICIPANT_REMOVED, callback)
  }
}

export const onParticipantRemovalSuccess = (
  callback: (data: RemovalData) => void
) => {
  if (socket) {
    socket.on(SocketEvent.PARTICIPANT_REMOVAL_SUCCESS, callback)
  }
}

/**
 * Start a quiz in a room
 */
export const startQuiz = (roomCode: string): void => {
  if (!socket) {
    console.error("Cannot start quiz: Socket not connected")
    return
  }

  console.log(`Starting quiz in room: ${roomCode}`)
  socket.emit(SocketEvent.QUIZ_STARTED, { roomCode })
}

/**
 * Stop a quiz in a room
 */
export const stopQuiz = (roomCode: string): void => {
  if (!socket) {
    console.error("Cannot stop quiz: Socket not connected")
    return
  }

  console.log(`Stopping quiz in room: ${roomCode}`)
  socket.emit(SocketEvent.QUIZ_STOPPED, { roomCode })
}

/**
 * Reset a room
 */
export const resetRoom = (roomCode: string): void => {
  if (!socket) {
    console.error("Cannot reset room: Socket not connected")
    return
  }

  console.log(`Resetting room: ${roomCode}`)
  socket.emit(SocketEvent.ROOM_RESET, { roomCode })
}
