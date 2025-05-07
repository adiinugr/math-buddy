import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

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

    // Return empty data to indicate the user hasn't taken any assessments yet
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
  } catch (error) {
    console.error("Error fetching student stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch student dashboard data" },
      { status: 500 }
    )
  }
}
