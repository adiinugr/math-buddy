import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the ID from params
    const { id: roomCode } = await params

    if (!roomCode) {
      return NextResponse.json(
        { error: "Assessment code is required" },
        { status: 400 }
      )
    }

    console.log(`Looking for quiz with code: ${roomCode}`)

    // Find quiz by code
    const quiz = await prisma.quiz.findFirst({
      where: {
        code: {
          equals: roomCode.toUpperCase(),
          mode: "insensitive"
        }
      },
      include: {
        questions: {
          orderBy: {
            order: "asc"
          }
        }
      }
    })

    if (!quiz) {
      console.log(`No quiz found with code: ${roomCode}`)
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      )
    }

    console.log(`Found quiz: ${quiz.title}`)
    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error verifying assessment:", error)
    return NextResponse.json(
      { error: "Failed to verify assessment" },
      { status: 500 }
    )
  }
}
