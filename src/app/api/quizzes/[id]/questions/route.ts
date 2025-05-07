import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      )
    }

    // Get the quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: id
      },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            options: true,
            order: true,
            correctAnswer: true
          },
          orderBy: {
            order: "asc"
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Create a safe response without exposing the userId
    const safeResponse = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt
    }

    return NextResponse.json(safeResponse)
  } catch (error) {
    console.error("Error fetching quiz questions:", error)
    return NextResponse.json(
      { error: "Failed to fetch quiz questions" },
      { status: 500 }
    )
  }
}
