import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { code, name } = await req.json()

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    // Get session to check if user is authenticated
    const session = await getServerSession(authOptions)

    // Use name from request or authenticated user's name if available
    const participantName = name || (session?.user?.name as string) || ""

    if (!participantName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const quiz = await prisma.quiz.findFirst({
      where: {
        code: {
          equals: code.toUpperCase(),
          mode: "insensitive"
        },
        isActive: true
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
      return NextResponse.json(
        { error: "Quiz not found or inactive" },
        { status: 404 }
      )
    }

    // Create a participant
    const participant = await prisma.participant.create({
      data: {
        name: participantName,
        quizId: quiz.id
      }
    })

    // Return quiz details without correct answers
    const quizWithoutAnswers = {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        order: q.order
      }))
    }

    return NextResponse.json({
      quiz: quizWithoutAnswers,
      participantId: participant.id,
      name: participantName
    })
  } catch (error) {
    console.error("Error joining quiz:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
