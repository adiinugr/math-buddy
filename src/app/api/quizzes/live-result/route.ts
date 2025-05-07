import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// POST: Save live quiz results
export async function POST(request: Request) {
  try {
    const { quizId, name, answers } = await request.json()

    if (!quizId || !name || !answers) {
      return NextResponse.json(
        { error: "Quiz ID, name, and answers are required" },
        { status: 400 }
      )
    }

    // Get the quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true
      }
    })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Calculate score
    let score = 0
    const answerMap: Record<string, number> = {}

    // Process each answer
    Object.entries(answers).forEach(([questionId, answerValue]) => {
      const question = quiz.questions.find((q) => q.id === questionId)
      if (question && question.correctAnswer === answerValue) {
        score++
      }
      answerMap[questionId] = answerValue as number
    })

    // Create a participant/result record
    const participant = await prisma.participant.create({
      data: {
        name,
        quizId,
        score,
        answers: answerMap
      }
    })

    return NextResponse.json({
      participantId: participant.id,
      score,
      totalQuestions: quiz.questions.length
    })
  } catch (error) {
    console.error("Error saving live quiz result:", error)
    return NextResponse.json(
      { error: "Failed to save quiz result" },
      { status: 500 }
    )
  }
}

// GET: Retrieve live quiz results
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get("participantId")

    if (!participantId) {
      return NextResponse.json(
        { error: "Participant ID is required" },
        { status: 400 }
      )
    }

    // Get the participant with quiz and questions
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

    // Convert answers from Record<string, number> to expected format
    const answers = participant.answers as Record<string, number>

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
      // Use default or inferred category if not available
      const category =
        (question as unknown as { category?: string })?.category ||
        question.subcategory?.split(" ")[0] ||
        "uncategorized"

      const subcategory = question.subcategory || "general"
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

    // Format the response
    const result = {
      id: participant.id,
      name: participant.name,
      score: participant.score,
      totalQuestions: participant.quiz.questions.length,
      createdAt: participant.createdAt,
      questions: participant.quiz.questions,
      answers,
      categories
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error retrieving quiz result:", error)
    return NextResponse.json(
      { error: "Failed to retrieve quiz result" },
      { status: 500 }
    )
  }
}
