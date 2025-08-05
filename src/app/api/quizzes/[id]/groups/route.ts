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
    const forceRegenerate = searchParams.get("forceRegenerate")

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

    console.log(`Found ${participants.length} participants for quiz ${quizId}`)

    if (!participants.length) {
      console.log("No participants found for this quiz")
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
          aljabar: { correct: 0, total: 0, subcategories: {} },
          geometri: { correct: 0, total: 0, subcategories: {} },
          aritmatika: { correct: 0, total: 0, subcategories: {} },
          kalkulus: { correct: 0, total: 0, subcategories: {} },
          trigonometri: { correct: 0, total: 0, subcategories: {} },
          statistik: { correct: 0, total: 0, subcategories: {} },
          umum: { correct: 0, total: 0, subcategories: {} }
        }

        // Process each question and update category statistics
        quizWithQuestions.questions.forEach((question) => {
          // Use default category if not available
          // Based on the schema, we need to handle the possibility that category might not exist on older questions
          const category =
            "category" in question
              ? (question.category as string) || "umum"
              : "umum"

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

    // If forceRegenerate is provided, shuffle participants first for different grouping
    if (forceRegenerate) {
      console.log("Force regenerate requested - shuffling participants")
      // Shuffle participants to get different grouping
      for (let i = detailedParticipants.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[detailedParticipants[i], detailedParticipants[j]] = [
          detailedParticipants[j],
          detailedParticipants[i]
        ]
      }
    }

    if (categoryKey !== "overall") {
      groups = createCategoryBasedGroups(
        detailedParticipants,
        groupSize,
        categoryKey
      )
    } else {
      groups = createHeterogeneousGroups(detailedParticipants, groupSize)
    }

    console.log(
      `Generated ${groups.length} groups with ${detailedParticipants.length} participants`
    )
    console.log(`Group size target: ${groupSize}, Category: ${categoryKey}`)
    if (forceRegenerate) {
      console.log("Manual regenerate with shuffled participants")
    } else {
      console.log("Auto-update with original participant order")
    }

    // Validate that groups were created successfully
    if (!groups || groups.length === 0) {
      return NextResponse.json(
        {
          groups: [],
          error: "Failed to generate groups. Please try again."
        },
        { status: 200 }
      )
    }

    // Log detailed group information for debugging
    console.log(`=== Group Distribution Details ===`)
    console.log(`Total participants: ${detailedParticipants.length}`)
    console.log(`Target group size: ${groupSize}`)
    console.log(`Number of groups created: ${groups.length}`)
    console.log(
      `Expected groups: ${Math.ceil(detailedParticipants.length / groupSize)}`
    )

    groups.forEach((group, index) => {
      console.log(`Group ${index + 1}: ${group.length} students`)
      if (group.length === 0) {
        console.warn(`Warning: Group ${index + 1} is empty`)
      }
    })

    // Check if any groups are empty and warn
    const emptyGroups = groups.filter((group) => group.length === 0)
    if (emptyGroups.length > 0) {
      console.warn(`Warning: ${emptyGroups.length} empty groups detected`)
    }

    // Calculate average group size
    const totalStudents = groups.reduce((sum, group) => sum + group.length, 0)
    const avgGroupSize = totalStudents / groups.length
    console.log(`Average group size: ${avgGroupSize.toFixed(2)}`)
    console.log(`=== End Group Distribution Details ===`)

    return NextResponse.json({ groups })
  } catch (error) {
    console.error("Error generating groups:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
