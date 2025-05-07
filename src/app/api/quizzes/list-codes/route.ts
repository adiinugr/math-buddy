import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Find all quizzes and return just their codes
    const quizzes = await prisma.quiz.findMany({
      select: {
        id: true,
        code: true,
        title: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    if (!quizzes || quizzes.length === 0) {
      return NextResponse.json({ message: "No quizzes found" }, { status: 404 })
    }

    return NextResponse.json({ quizzes })
  } catch (error) {
    console.error("Error listing quiz codes:", error)
    return NextResponse.json(
      { error: "Failed to list quiz codes" },
      { status: 500 }
    )
  }
}
