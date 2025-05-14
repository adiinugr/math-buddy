import { NextResponse } from "next/server"
import OpenAI from "openai"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface Question {
  text: string
  options: string[]
  correctAnswer: number
  category: string
  subcategory: string
  difficulty: "easy" | "medium" | "hard"
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { category, count = 5, difficulty = "medium" } = await req.json()

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      )
    }

    const subcategories = {
      aljabar: ["persamaan", "pertidaksamaan", "polinomial", "fungsi"],
      geometri: ["bentuk", "sudut", "luas", "volume"],
      aritmatika: ["operasi", "pecahan", "desimal", "persentase"],
      kalkulus: ["turunan", "integral", "limit", "aplikasi"]
    }

    const prompt = `Generate ${count} multiple choice math questions about ${category} with difficulty level ${difficulty}. 
    Each question should have 4 options and one correct answer. 
    Format the response as a JSON array with the following structure for each question:
    {
      "text": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "category": "${category}",
      "subcategory": "one of ${JSON.stringify(
        subcategories[category as keyof typeof subcategories]
      )}",
      "difficulty": "${difficulty}"
    }
    The correctAnswer should be the index of the correct option (0-3).
    Make sure the questions are appropriate for high school level math.
    For the subcategory, choose the most appropriate one based on the question content.
    Return the response in the following format:
    {
      "questions": [array of questions]
    }`

    console.log("Sending request to OpenAI API...")
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a math teacher creating multiple choice questions. Be precise and accurate. Make sure to assign the correct subcategory based on the question content."
        },
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" }
    })

    console.log("OpenAI API response:", completion)

    if (!completion.choices[0]?.message?.content) {
      console.error("No content in OpenAI response")
      return NextResponse.json(
        { error: "Failed to generate questions: Empty response from AI" },
        { status: 500 }
      )
    }

    let response
    try {
      response = JSON.parse(completion.choices[0].message.content)
    } catch (error) {
      console.error("Error parsing OpenAI response:", error)
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      )
    }

    const questions: Question[] = response.questions || []

    if (questions.length === 0) {
      console.error("No questions generated")
      return NextResponse.json(
        { error: "No questions were generated" },
        { status: 500 }
      )
    }

    // Validate that each question has a valid subcategory
    const validQuestions = questions.filter((q) => {
      const validSubcategories =
        subcategories[q.category as keyof typeof subcategories] || []
      return validSubcategories.includes(q.subcategory)
    })

    if (validQuestions.length === 0) {
      console.error("No valid questions after subcategory validation")
      return NextResponse.json(
        { error: "No valid questions were generated" },
        { status: 500 }
      )
    }

    return NextResponse.json(validQuestions)
  } catch (error) {
    console.error("Error generating questions:", error)
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API Error: ${error.message}` },
        { status: error.status || 500 }
      )
    }
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    )
  }
}
