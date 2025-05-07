import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Destructure roomCode for socket communication if needed
    await request.json()

    // Extract the ID from params
    const { id } = await params

    // Verify the quiz exists and belongs to the teacher
    const quiz = await prisma.quiz.findUnique({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 })
    }

    // Update the live quiz session
    await prisma.liveQuizSession.update({
      where: {
        quizId: id
      },
      data: {
        status: "completed"
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error stopping live quiz:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
