import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// Define the structure of the answers JSON
interface AnswerMap {
  [questionId: string]: number
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const participantId = searchParams.get("participantId")

    if (!participantId) {
      return NextResponse.json(
        { error: "Participant ID is required" },
        { status: 400 }
      )
    }

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        quiz: {
          include: {
            questions: true
          }
        }
      }
    })

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      )
    }

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

    // Create a map to store each question's category
    const questionCategories: Record<string, string> = {}

    // Calculate category and subcategory statistics
    participant.quiz.questions.forEach((question) => {
      // Determine category based on subcategory
      let category = "algebra" // default category
      if (question.subcategory) {
        if (
          ["equations", "inequalities", "polynomials", "functions"].includes(
            question.subcategory
          )
        ) {
          category = "algebra"
        } else if (
          ["shapes", "angles", "area", "volume"].includes(question.subcategory)
        ) {
          category = "geometry"
        } else if (
          ["operations", "fractions", "decimals", "percentages"].includes(
            question.subcategory
          )
        ) {
          category = "arithmetic"
        } else if (
          ["derivatives", "integrals", "limits", "applications"].includes(
            question.subcategory
          )
        ) {
          category = "calculus"
        }
      }

      // Store the category for this question
      questionCategories[question.id] = category

      const subcategory = question.subcategory || "general"
      const answers = participant.answers as AnswerMap
      const userAnswer = answers?.[question.id]
      const isCorrect = userAnswer === question.correctAnswer

      // Update category stats
      categories[category].total++
      if (isCorrect) {
        categories[category].correct++
      }

      // Initialize subcategory if not exists
      if (!categories[category].subcategories[subcategory]) {
        categories[category].subcategories[subcategory] = {
          correct: 0,
          total: 0
        }
      }

      // Update subcategory stats
      categories[category].subcategories[subcategory].total++
      if (isCorrect) {
        categories[category].subcategories[subcategory].correct++
      }
    })

    // Add category field to each question
    const questionsWithCategory = participant.quiz.questions.map(
      (question) => ({
        ...question,
        category: questionCategories[question.id]
      })
    )

    return NextResponse.json({
      id: participant.id,
      name: participant.name,
      score: participant.score,
      totalQuestions: participant.quiz.questions.length,
      createdAt: participant.createdAt,
      questions: questionsWithCategory,
      answers: participant.answers,
      categories
    })
  } catch (error) {
    console.error("Error fetching quiz result:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
