import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Extract the code from the URL
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json(
        { error: "Code parameter is required" },
        { status: 400 }
      )
    }

    console.log(`Looking for quiz with code: ${code}`)

    // Find quiz by code
    const quiz = await prisma.quiz.findFirst({
      where: {
        code: {
          equals: code.toUpperCase(),
          mode: "insensitive"
        }
      },
      include: {
        questions: {
          orderBy: {
            order: "asc"
          }
        }
      }
    })

    if (!quiz) {
      console.log(`No quiz found with code: ${code}`)
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    console.log(
      `Found quiz: ${quiz.title} with ${quiz.questions.length} questions`
    )
    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error verifying quiz code:", error)
    return NextResponse.json(
      { error: "Failed to verify quiz code" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Extract the roomCode from the request body
    const { roomCode } = await request.json()

    if (!roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      )
    }

    console.log(`Looking for live quiz session with room code: ${roomCode}`)

    // Find the live quiz session by room code
    const session = await prisma.liveQuizSession.findFirst({
      where: {
        roomCode: roomCode.toUpperCase()
      },
      include: { quiz: true }
    })

    if (!session) {
      console.log(`No live session found with room code: ${roomCode}`)
      return NextResponse.json({ error: "Invalid room code" }, { status: 404 })
    }

    console.log(`Found live session for quiz: ${session.quiz.title}`)
    return NextResponse.json({
      success: true,
      quizId: session.quizId
    })
  } catch (error) {
    console.error("Error verifying room code:", error)
    return NextResponse.json(
      { error: "Failed to verify room code" },
      { status: 500 }
    )
  }
}
