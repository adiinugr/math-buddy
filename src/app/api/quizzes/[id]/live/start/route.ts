import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Extract the quiz ID from params
    const { id: quizId } = await params
    if (!quizId) {
      return new NextResponse("Quiz ID is required", { status: 400 })
    }

    const { roomCode } = await request.json()

    // Verify the quiz exists and belongs to the teacher
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        userId: session.user.id
      }
    })

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 })
    }

    // Create or update the live quiz session
    await prisma.liveQuizSession.upsert({
      where: {
        quizId: quizId
      },
      update: {
        roomCode,
        status: "in_progress"
      },
      create: {
        quizId: quizId,
        roomCode,
        status: "in_progress"
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error starting live quiz:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
