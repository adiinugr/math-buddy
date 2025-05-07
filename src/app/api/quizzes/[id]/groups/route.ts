import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import {
  createHeterogeneousGroups,
  createCategoryBasedGroups
} from "@/lib/groupingAlgorithm"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupSize = parseInt(searchParams.get("groupSize") || "4", 10)
    const categoryKey = searchParams.get("category") || "overall"

    // Extract quiz ID from params - awaiting the params Promise
    const { id: quizId } = await params

    // First, check if the quiz belongs to the current user
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        userId: session.user.id
      }
    })

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 })
    }

    // Get all participants for this quiz
    const participants = await prisma.participant.findMany({
      where: {
        quizId
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    if (!participants.length) {
      return NextResponse.json(
        {
          groups: [],
          error: "No students have completed this assessment yet"
        },
        { status: 200 }
      )
    }

    // For each participant, get their detailed results with categories
    const detailedParticipants = await Promise.all(
      participants.map(async (participant) => {
        // Get the quiz with questions
        const quizWithQuestions = await prisma.quiz.findUnique({
          where: { id: quizId },
          include: {
            questions: true
          }
        })

        if (!quizWithQuestions) {
          return participant
        }

        const answers = (participant.answers as Record<string, number>) || {}

        // Initialize category statistics
        const categories: Record<
          string,
          {
            correct: number
            total: number
            subcategories: Record<
              string,
              {
                correct: number
                total: number
              }
            >
          }
        > = {
          algebra: { correct: 0, total: 0, subcategories: {} },
          geometry: { correct: 0, total: 0, subcategories: {} },
          arithmetic: { correct: 0, total: 0, subcategories: {} },
          calculus: { correct: 0, total: 0, subcategories: {} }
        }

        // Process each question and update category statistics
        quizWithQuestions.questions.forEach((question) => {
          // Use default category if not available
          // Based on the schema, we need to handle the possibility that category might not exist on older questions
          const category =
            "category" in question
              ? (question.category as string) || "uncategorized"
              : "uncategorized"

          const subcategory = question.subcategory || "general"
          const userAnswer = answers[question.id]
          const isCorrect = userAnswer === question.correctAnswer

          // Initialize subcategory if it doesn't exist
          if (!categories[category]) {
            categories[category] = {
              correct: 0,
              total: 0,
              subcategories: {}
            }
          }

          if (!categories[category].subcategories[subcategory]) {
            categories[category].subcategories[subcategory] = {
              correct: 0,
              total: 0
            }
          }

          // Update category statistics
          categories[category].total += 1
          if (isCorrect) {
            categories[category].correct += 1
          }

          // Update subcategory statistics
          categories[category].subcategories[subcategory].total += 1
          if (isCorrect) {
            categories[category].subcategories[subcategory].correct += 1
          }
        })

        return {
          ...participant,
          totalQuestions: quizWithQuestions.questions.length,
          categories
        }
      })
    )

    // Create heterogeneous groups
    let groups = []
    if (categoryKey !== "overall") {
      groups = createCategoryBasedGroups(
        detailedParticipants,
        groupSize,
        categoryKey
      )
    } else {
      groups = createHeterogeneousGroups(detailedParticipants, groupSize)
    }

    return NextResponse.json({ groups })
  } catch (error) {
    console.error("Error generating groups:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
