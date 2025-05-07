import { Server } from "socket.io"
import prisma from "./prisma"

export const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

const rooms = new Map<string, Set<string>>() // roomCode -> participantIds

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id)

  socket.on("join-room", async (roomCode: string) => {
    try {
      const session = await prisma.liveQuizSession.findFirst({
        where: { roomCode },
        include: { quiz: true }
      })

      if (!session) {
        socket.emit("error", "Invalid room code")
        return
      }

      socket.join(roomCode)
      rooms.set(roomCode, rooms.get(roomCode) || new Set())
      rooms.get(roomCode)?.add(socket.id)

      // Get user info from session
      const user = await prisma.user.findUnique({
        where: { id: socket.handshake.auth.userId }
      })

      if (user) {
        io.to(roomCode).emit("participant-joined", {
          id: socket.id,
          name: user.name,
          email: user.email,
          joinedAt: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error("Error joining room:", error)
      socket.emit("error", "Failed to join room")
    }
  })

  socket.on("leave-room", (roomCode: string) => {
    socket.leave(roomCode)
    rooms.get(roomCode)?.delete(socket.id)
    io.to(roomCode).emit("participant-left", socket.id)
  })

  socket.on("start-quiz", (roomCode: string) => {
    io.to(roomCode).emit("quiz-started")
  })

  socket.on("stop-quiz", (roomCode: string) => {
    io.to(roomCode).emit("quiz-stopped")
  })

  socket.on(
    "submit-answer",
    async (data: { roomCode: string; questionId: string; answer: number }) => {
      try {
        const { roomCode, questionId, answer } = data
        const userId = socket.handshake.auth.userId

        // Save the answer
        await prisma.quizAnswer.create({
          data: {
            userId,
            questionId,
            answer,
            isCorrect: false // Will be updated when quiz is completed
          }
        })

        io.to(roomCode).emit("answer-submitted", {
          userId,
          questionId,
          answer
        })
      } catch (error) {
        console.error("Error submitting answer:", error)
        socket.emit("error", "Failed to submit answer")
      }
    }
  )

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
    // Remove from all rooms
    rooms.forEach((participants, roomCode) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id)
        io.to(roomCode).emit("participant-left", socket.id)
      }
    })
  })
})

export const config = {
  api: {
    bodyParser: false
  }
}
