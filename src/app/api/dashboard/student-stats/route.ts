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

    const userId = session.user.id
    const userName = session.user.name || session.user.email || ""

    console.log("Processing student stats for user:", {
      id: userId,
      name: userName,
      email: session.user.email
    })

    // Get all quiz answers for this user
    const userAnswers = await prisma.quizAnswer.findMany({
      where: { userId },
      include: {
        question: {
          include: {
            quiz: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    console.log("Found user answers:", userAnswers.length)

    // Get all participants for this user by name matching
    // Try exact name match first, then partial matches
    const userParticipants = await prisma.participant.findMany({
      where: {
        OR: [
          { name: userName },
          { name: { contains: userName.split(" ")[0], mode: "insensitive" } },
          {
            name: {
              contains: userName.split(" ").slice(-1)[0],
              mode: "insensitive"
            }
          }
        ]
      },
      include: {
        quiz: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    console.log("Found user participants:", userParticipants.length)
    console.log(
      "Participant names:",
      userParticipants.map((p) => p.name)
    )

    // If user has no data, return empty response
    if (userAnswers.length === 0 && userParticipants.length === 0) {
      console.log("No data found for user")
      return NextResponse.json({
        noData: true,
        stats: {
          totalAssessments: 0,
          assessmentGrowth: 0,
          averageScore: 0,
          scoreGrowth: 0,
          timeSpent: 0,
          timeGrowth: 0,
          completionRate: 0,
          completionRateGrowth: 0
        },
        recentAssessments: [],
        learningProgress: [],
        username: session.user.name || "Student"
      })
    }

    // Process quiz answers to get assessment data
    const assessmentMap = new Map()

    // Process authenticated user answers
    userAnswers.forEach((answer) => {
      const quizId = answer.question.quiz.id
      const quizTitle = answer.question.quiz.title

      if (!assessmentMap.has(quizId)) {
        assessmentMap.set(quizId, {
          id: quizId,
          title: quizTitle,
          answers: [],
          totalQuestions: 0,
          correctAnswers: 0,
          completedAt: answer.createdAt
        })
      }

      const assessment = assessmentMap.get(quizId)
      assessment.answers.push(answer)
      assessment.totalQuestions++
      if (answer.isCorrect) {
        assessment.correctAnswers++
      }
    })

    // Process participant data
    userParticipants.forEach((participant) => {
      const quizId = participant.quiz.id
      const quizTitle = participant.quiz.title

      if (!assessmentMap.has(quizId)) {
        assessmentMap.set(quizId, {
          id: quizId,
          title: quizTitle,
          score: participant.score,
          totalQuestions: 0,
          correctAnswers: participant.score,
          completedAt: participant.createdAt
        })
      }
    })

    // Convert to array and calculate scores
    const recentAssessments = Array.from(assessmentMap.values()).map(
      (assessment) => {
        const score =
          assessment.score ||
          (assessment.correctAnswers / assessment.totalQuestions) * 100

        return {
          id: assessment.id,
          title: assessment.title,
          score: Math.round(score),
          completedAt: assessment.completedAt.toISOString(),
          totalQuestions: assessment.totalQuestions,
          correctAnswers: assessment.correctAnswers
        }
      }
    )

    console.log("Processed assessments:", recentAssessments.length)

    // Calculate statistics
    const totalAssessments = recentAssessments.length
    const averageScore =
      totalAssessments > 0
        ? Math.round(
            recentAssessments.reduce(
              (sum, assessment) => sum + assessment.score,
              0
            ) / totalAssessments
          )
        : 0

    // Calculate learning progress based on categories
    const categoryStats = new Map()

    userAnswers.forEach((answer) => {
      const category = answer.question.category || "umum"
      if (!categoryStats.has(category)) {
        categoryStats.set(category, { correct: 0, total: 0 })
      }
      const stats = categoryStats.get(category)
      stats.total++
      if (answer.isCorrect) {
        stats.correct++
      }
    })

    const learningProgress = Array.from(categoryStats.entries()).map(
      ([skill, stats]) => ({
        skill,
        progress: Math.round((stats.correct / stats.total) * 100),
        status:
          stats.correct / stats.total >= 0.7
            ? "improving"
            : stats.correct / stats.total >= 0.5
            ? "stable"
            : "needs work",
        improvement: Math.round((stats.correct / stats.total) * 100)
      })
    )

    console.log("Returning data with assessments:", recentAssessments.length)

    return NextResponse.json({
      noData: false,
      stats: {
        totalAssessments,
        assessmentGrowth: 0, // Could calculate based on time periods
        averageScore,
        scoreGrowth: 0, // Could calculate based on time periods
        timeSpent: 0, // Could calculate based on answer timestamps
        timeGrowth: 0,
        completionRate: 100, // Assuming all started assessments are completed
        completionRateGrowth: 0
      },
      recentAssessments,
      learningProgress,
      username: session.user.name || "Student"
    })
  } catch (error) {
    console.error("Error fetching student stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch student dashboard data" },
      { status: 500 }
    )
  }
}
