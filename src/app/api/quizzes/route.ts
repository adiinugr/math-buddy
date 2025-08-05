import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { nanoid } from "nanoid"
import prisma from "@/lib/prisma"

interface QuestionInput {
  text: string
  options: string[]
  correctAnswer: number
  category: string
  subcategory: string
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("Session data:", session)

    if (!session?.user?.id) {
      console.error("No valid session or user ID found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      console.error("User not found in database:", session.user.id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { title, description, questions } = await req.json()

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }

    // Generate a unique code for the quiz
    const code = nanoid(6).toUpperCase()

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        code,
        userId: user.id,
        questions: {
          create: questions.map((q: QuestionInput, index: number) => ({
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            category:
              q.category && q.category !== "uncategorized"
                ? q.category
                : "umum",
            subcategory: q.subcategory || "general",
            order: index + 1
          }))
        }
      },
      include: {
        questions: true
      }
    })

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error creating quiz:", error)
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const quizzes = await prisma.quiz.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        questions: true,
        participants: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
