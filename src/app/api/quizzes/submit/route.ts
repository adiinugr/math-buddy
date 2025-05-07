import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface Answer {
  questionId: string
  answer: number
}

export async function POST(req: Request) {
  try {
    const { participantId, answers } = await req.json()

    if (!participantId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Participant ID and answers are required" },
        { status: 400 }
      )
    }

    // Get the participant and quiz
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

    // Calculate score
    let score = 0
    const answerMap: Record<string, number> = {}

    answers.forEach((answer: Answer) => {
      const question = participant.quiz.questions.find(
        (q) => q.id === answer.questionId
      )
      if (question && question.correctAnswer === answer.answer) {
        score++
      }
      answerMap[answer.questionId] = answer.answer
    })

    // Update participant with score and answers
    await prisma.participant.update({
      where: { id: participantId },
      data: {
        score,
        answers: answerMap as Record<string, number> // More specific type for JSON field
      }
    })

    return NextResponse.json({
      score,
      totalQuestions: participant.quiz.questions.length
    })
  } catch (error) {
    console.error("Error submitting quiz:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
