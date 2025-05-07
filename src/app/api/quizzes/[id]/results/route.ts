import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Define Question interface with optional category field for backward compatibility
interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  category?: string
  subcategory?: string
  order: number
  quizId: string
}

// Category mapping for consistent categorization
const CATEGORY_MAPPINGS: Record<string, string[]> = {
  algebra: [
    "equations",
    "inequalities",
    "polynomials",
    "functions",
    "expressions"
  ],
  geometry: ["shapes", "angles", "area", "volume", "triangles", "circles"],
  arithmetic: [
    "operations",
    "fractions",
    "decimals",
    "percentages",
    "integers"
  ],
  calculus: [
    "derivatives",
    "integrals",
    "limits",
    "applications",
    "differentiation"
  ],
  trigonometry: [
    "functions",
    "identities",
    "equations",
    "applications",
    "angles"
  ],
  statistics: [
    "probability",
    "data",
    "distributions",
    "inference",
    "regression"
  ]
}

// Determine category from subcategory using consistent mapping
function determineCategoryFromSubcategory(subcategory: string): string {
  if (!subcategory) return "uncategorized"

  // Look through our mappings for a match
  for (const [category, subcategories] of Object.entries(CATEGORY_MAPPINGS)) {
    if (
      subcategories.some((sub) =>
        subcategory.toLowerCase().includes(sub.toLowerCase())
      )
    ) {
      return category
    }
  }

  return "uncategorized"
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

    // Correctly extract and await params
    const { id } = await Promise.resolve(params)
    const quizId = id

    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get("participantId")

    // If participantId is provided, fetch detailed result for analytics
    if (participantId) {
      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId,
          quiz: {
            userId: session.user.id // Make sure the quiz belongs to the current user
          }
        },
        include: {
          quiz: {
            include: {
              questions: true
            }
          }
        }
      })

      if (!participant) {
        return NextResponse.json({ error: "Result not found" }, { status: 404 })
      }

      // Convert answers from JSON to object if needed
      const answers = (participant.answers as Record<string, number>) || {}

      // Create a map to store each question's category
      const questionCategories: Record<string, string> = {}

      // Calculate category and subcategory statistics
      const categories: Record<
        string,
        {
          correct: number
          total: number
          subcategories: Record<string, { correct: number; total: number }>
        }
      > = {}

      // Process each question to build category stats
      participant.quiz.questions.forEach((question) => {
        // More robust category determination logic
        let category = (question as Question).category || "uncategorized"
        const subcategory = (question as Question).subcategory || "general"

        // If no category is provided but subcategory exists, derive category from subcategory
        if (category === "uncategorized" && subcategory !== "general") {
          category = determineCategoryFromSubcategory(subcategory)
        }

        // Store category for use with questions
        questionCategories[question.id] = category

        const userAnswer = answers[question.id]
        const isCorrect = userAnswer === question.correctAnswer

        // Initialize category if it doesn't exist
        if (!categories[category]) {
          categories[category] = {
            correct: 0,
            total: 0,
            subcategories: {}
          }
        }

        // Initialize subcategory if it doesn't exist
        if (!categories[category].subcategories[subcategory]) {
          categories[category].subcategories[subcategory] = {
            correct: 0,
            total: 0
          }
        }

        // Update counts
        categories[category].total++
        categories[category].subcategories[subcategory].total++

        if (isCorrect) {
          categories[category].correct++
          categories[category].subcategories[subcategory].correct++
        }
      })

      // Add category field to each question for backward compatibility
      const questionsWithCategory = participant.quiz.questions.map(
        (question) => ({
          ...question,
          category: questionCategories[question.id] || "uncategorized",
          subcategory: (question as Question).subcategory || "general"
        })
      )

      // Format the response
      const detailedResult = {
        id: participant.id,
        name: participant.name,
        userId: null, // Participant doesn't have user ID
        quizId: participant.quizId,
        score: participant.score,
        totalQuestions: participant.quiz.questions.length,
        createdAt: participant.createdAt,
        questions: questionsWithCategory,
        answers,
        categories
      }

      return NextResponse.json(detailedResult)
    }

    // Otherwise return all participants/results for this quiz
    const results = await prisma.participant.findMany({
      where: {
        quizId: quizId, // Use the extracted quizId variable
        quiz: {
          userId: session.user.id // Make sure the quiz belongs to the current user
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching quiz results:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
