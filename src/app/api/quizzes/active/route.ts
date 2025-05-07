import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // User ID is available for future use when we need to check user-specific progress
    // const userId = session.user.id

    // Get active quizzes - in a real implementation we would:
    // 1. Find quizzes where isActive = true
    // 2. Check if user has already completed them
    // 3. Return only the ones that are active and not completed by the user

    // For now, fetch all active quizzes
    const activeQuizzes = await prisma.quiz.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        title: true,
        code: true,
        createdAt: true,
        user: {
          select: {
            name: true
          }
        },
        questions: {
          select: {
            id: true
          }
        }
      }
    })

    // Format the quizzes to include progress information
    // In a real implementation, you would check the user's progress on each quiz
    const formattedQuizzes = activeQuizzes.map((quiz) => {
      // Set a due date 14 days from created date for demo purposes
      const createdDate = new Date(quiz.createdAt)
      const dueDate = new Date(createdDate)
      dueDate.setDate(createdDate.getDate() + 14)

      return {
        id: quiz.id,
        title: quiz.title,
        code: quiz.code,
        teacher: quiz.user.name || "Teacher",
        dueDate: dueDate.toISOString(),
        status: "not_started", // Default to not started
        progress: 0,
        totalQuestions: quiz.questions.length
      }
    })

    return NextResponse.json({
      activeAssessments: formattedQuizzes,
      noData: formattedQuizzes.length === 0
    })
  } catch (error) {
    console.error("Error fetching active assessments:", error)
    return NextResponse.json(
      { error: "Failed to fetch active assessments" },
      { status: 500 }
    )
  }
}
