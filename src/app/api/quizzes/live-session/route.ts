import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { quizId } = await request.json()

    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      )
    }

    // Check if a live session already exists for this quiz
    let session = await prisma.liveQuizSession.findFirst({
      where: { quizId }
    })

    // If no session exists, create a new one
    if (!session) {
      // Generate a unique room code
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()

      // Create the session
      session = await prisma.liveQuizSession.create({
        data: {
          quizId,
          roomCode,
          status: "waiting"
        }
      })
    }

    return NextResponse.json({
      roomCode: session.roomCode,
      status: session.status
    })
  } catch (error) {
    console.error("Error creating live session:", error)
    return NextResponse.json(
      { error: "Failed to create live session" },
      { status: 500 }
    )
  }
}
