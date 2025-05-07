import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

interface QuestionInput {
  text: string
  options: string[]
  correctAnswer: number
  order: number
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id: quizId } = await params

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        userId: session.user.id
      },
      include: {
        questions: true
      }
    })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id: quizId } = await params
    const { title, description, questions } = await request.json()

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Title and questions are required" },
        { status: 400 }
      )
    }

    // First, get the existing quiz to verify ownership
    const existingQuiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        userId: session.user.id
      }
    })

    if (!existingQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Update the quiz
    const updatedQuiz = await prisma.quiz.update({
      where: {
        id: quizId
      },
      data: {
        title,
        description,
        questions: {
          deleteMany: {}, // Delete all existing questions
          create: questions.map((q: QuestionInput, index: number) => ({
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            order: index
          }))
        }
      },
      include: {
        questions: true
      }
    })

    return NextResponse.json(updatedQuiz)
  } catch (error) {
    console.error("Error updating quiz:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id: quizId } = await params

    // First, get the existing quiz to verify ownership
    const existingQuiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        userId: session.user.id
      }
    })

    if (!existingQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Delete all related questions first
    await prisma.question.deleteMany({
      where: {
        quizId: quizId
      }
    })

    // Delete all related participants
    await prisma.participant.deleteMany({
      where: {
        quizId: quizId
      }
    })

    // Now delete the quiz
    await prisma.quiz.delete({
      where: {
        id: quizId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting quiz:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
