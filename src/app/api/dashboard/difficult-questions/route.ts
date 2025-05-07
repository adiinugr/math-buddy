import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all quizzes created by this user
    const quizzes = await prisma.quiz.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        questions: {
          include: {
            answers: true
          }
        },
        participants: true
      }
    })

    // Process questions to determine difficulty
    const quizQuestions = []

    for (const quiz of quizzes) {
      // Skip quizzes with no participants
      if (quiz.participants.length === 0) continue

      for (const question of quiz.questions) {
        // Calculate percentage of correct answers
        const answersCount = question.answers.length
        let correctAnswersCount = 0

        question.answers.forEach((answer) => {
          if (answer.isCorrect) {
            correctAnswersCount++
          }
        })

        // If there are no participant answers, check participant JSON records
        if (answersCount === 0) {
          quiz.participants.forEach((participant) => {
            const answers =
              (participant.answers as Record<string, number>) || {}
            if (answers[question.id] !== undefined) {
              if (answers[question.id] === question.correctAnswer) {
                correctAnswersCount++
              }
            }
          })
        }

        const totalResponses =
          answersCount > 0 ? answersCount : quiz.participants.length
        const correctPercentage =
          totalResponses > 0
            ? Math.round((correctAnswersCount / totalResponses) * 100)
            : 0

        quizQuestions.push({
          id: question.id,
          text: question.text,
          quizId: quiz.id,
          quizTitle: quiz.title,
          subcategory: question.subcategory || "Uncategorized",
          correctPercentage,
          difficulty:
            correctPercentage < 40
              ? "Hard"
              : correctPercentage < 70
              ? "Medium"
              : "Easy"
        })
      }
    }

    // Sort questions by difficulty (hardest first)
    const sortedQuestions = quizQuestions.sort(
      (a, b) => a.correctPercentage - b.correctPercentage
    )

    // Group questions by difficulty level
    const difficultyGroups = {
      hard: sortedQuestions.filter((q) => q.difficulty === "Hard"),
      medium: sortedQuestions.filter((q) => q.difficulty === "Medium"),
      easy: sortedQuestions.filter((q) => q.difficulty === "Easy")
    }

    return NextResponse.json({
      difficultyGroups,
      allQuestions: sortedQuestions
    })
  } catch (error) {
    console.error("Error fetching difficult questions:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
