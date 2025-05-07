import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface CategoryData {
  total: number
  correct: number
  average: number
  trend: "improving" | "stable" | "needs work"
}

interface CategoryPerformance {
  [key: string]: CategoryData
}

interface CategoryEntry {
  topic: string
  average: number
  trend: "improving" | "stable" | "needs work"
}

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
        participants: true,
        questions: true
      }
    })

    // Get all participants across all quizzes
    const participants = quizzes.flatMap((quiz) => quiz.participants)

    // Calculate averages and totals
    const totalQuizzes = quizzes.length

    // Calculate month-over-month growth for quizzes
    const lastMonthDate = new Date()
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)

    const thisMonthQuizzes = quizzes.filter(
      (quiz) => new Date(quiz.createdAt) > lastMonthDate
    ).length

    // Calculate active students (unique participants within last 30 days)
    const activeStudents = new Set(
      participants
        .filter((p) => new Date(p.createdAt) > lastMonthDate)
        .map((p) => p.name)
    ).size

    const lastTwoMonthsDate = new Date()
    lastTwoMonthsDate.setMonth(lastTwoMonthsDate.getMonth() - 2)

    const previousMonthActiveStudents = new Set(
      participants
        .filter(
          (p) =>
            new Date(p.createdAt) > lastTwoMonthsDate &&
            new Date(p.createdAt) < lastMonthDate
        )
        .map((p) => p.name)
    ).size

    const studentGrowth = activeStudents - previousMonthActiveStudents

    // Calculate average score across all participants
    let totalScore = 0

    participants.forEach((participant) => {
      totalScore += participant.score
    })

    const averageScore =
      participants.length > 0
        ? Math.round((totalScore / participants.length) * 100)
        : 0

    // Calculate previous month's average score for comparison
    const previousMonthParticipants = participants.filter(
      (p) =>
        new Date(p.createdAt) > lastTwoMonthsDate &&
        new Date(p.createdAt) < lastMonthDate
    )

    let previousMonthTotalScore = 0
    previousMonthParticipants.forEach((participant) => {
      previousMonthTotalScore += participant.score
    })

    const previousMonthAverageScore =
      previousMonthParticipants.length > 0
        ? Math.round(
            (previousMonthTotalScore / previousMonthParticipants.length) * 100
          )
        : 0

    const scoreGrowth = averageScore - previousMonthAverageScore

    // Calculate completion rate (participants who answered all questions)
    const completedParticipants = participants.filter((participant) => {
      const quiz = quizzes.find((q) => q.id === participant.quizId)
      if (!quiz) return false

      const answers = (participant.answers as Record<string, number>) || {}
      return Object.keys(answers).length === quiz.questions.length
    }).length

    const completionRate =
      participants.length > 0
        ? Math.round((completedParticipants / participants.length) * 100)
        : 0

    const previousMonthCompletedParticipants = previousMonthParticipants.filter(
      (participant) => {
        const quiz = quizzes.find((q) => q.id === participant.quizId)
        if (!quiz) return false

        const answers = (participant.answers as Record<string, number>) || {}
        return Object.keys(answers).length === quiz.questions.length
      }
    ).length

    const previousMonthCompletionRate =
      previousMonthParticipants.length > 0
        ? Math.round(
            (previousMonthCompletedParticipants /
              previousMonthParticipants.length) *
              100
          )
        : 0

    const completionRateGrowth = completionRate - previousMonthCompletionRate

    // Get recent assessments
    const recentQuizzes = quizzes
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3)
      .map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        createdAt: quiz.createdAt,
        participants: quiz.participants.length,
        completionRate:
          quiz.participants.length > 0
            ? Math.round(
                (quiz.participants.filter((p) => {
                  const answers = (p.answers as Record<string, number>) || {}
                  return Object.keys(answers).length === quiz.questions.length
                }).length /
                  quiz.participants.length) *
                  100
              )
            : 0
      }))

    // Calculate performance by subject/topic
    const categoryPerformance: CategoryPerformance = {}

    participants.forEach((participant) => {
      const quiz = quizzes.find((q) => q.id === participant.quizId)
      if (!quiz) return

      const answers = (participant.answers as Record<string, number>) || {}

      quiz.questions.forEach((question) => {
        const category = question.subcategory?.split(" ")[0] || "uncategorized"

        if (!categoryPerformance[category]) {
          categoryPerformance[category] = {
            total: 0,
            correct: 0,
            average: 0,
            trend: "stable"
          }
        }

        categoryPerformance[category].total++

        if (answers[question.id] === question.correctAnswer) {
          categoryPerformance[category].correct++
        }
      })
    })

    // Calculate averages and determine trends
    Object.keys(categoryPerformance).forEach((category) => {
      const { total, correct } = categoryPerformance[category]

      if (total > 0) {
        const average = Math.round((correct / total) * 100)
        categoryPerformance[category].average = average

        // Determine trend (this would be more accurate with historical data)
        if (average > 70) {
          categoryPerformance[category].trend = "improving"
        } else if (average < 50) {
          categoryPerformance[category].trend = "needs work"
        } else {
          categoryPerformance[category].trend = "stable"
        }
      }
    })

    // Format data for the top 3 categories
    const topCategories: CategoryEntry[] = Object.entries(categoryPerformance)
      .filter(([, data]) => data.total > 0)
      .sort((a, b) => b[1].average - a[1].average)
      .slice(0, 3)
      .map(([category, data]) => ({
        topic: category,
        average: data.average,
        trend: data.trend
      }))

    return NextResponse.json({
      stats: {
        totalQuizzes,
        quizGrowth: thisMonthQuizzes,
        activeStudents,
        studentGrowth,
        averageScore,
        scoreGrowth,
        completionRate,
        completionRateGrowth
      },
      recentQuizzes,
      categoryPerformance: topCategories
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
