import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Define interfaces for our data structures
interface QuizQuestion {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  category?: string
  subcategory?: string
  _needsReview?: boolean
  [key: string]: string | number | string[] | boolean | undefined
}

interface QuizData {
  title: string
  description: string
  questions: QuizQuestion[]
  [key: string]: string | QuizQuestion[] | undefined
}

interface Topic {
  category: string
  categoryName: string
  subcategory: string
  subcategoryName: string
  questionCount: number
}

interface TopicMapping {
  category: string
  subcategory: string
  categoryName: string
  subcategoryName: string
}

export async function POST(req: Request) {
  try {
    const { topics, level, questionCount, requirements, type } =
      await req.json()

    if (!topics || topics.length === 0) {
      return NextResponse.json(
        { error: "At least one topic is required" },
        { status: 400 }
      )
    }

    // For single category/subcategory (backward compatibility)
    if (!Array.isArray(topics) && topics.category && topics.subcategory) {
      const { category, subcategory } = topics
      return generateSingleCategoryQuiz(
        category,
        subcategory,
        level,
        questionCount,
        requirements,
        type
      )
    }

    // For multiple categories/subcategories
    return generateMultiCategoryQuiz(topics, level, requirements, type)
  } catch (error) {
    console.error("Error generating quiz:", error)
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    )
  }
}

async function generateSingleCategoryQuiz(
  category: string,
  subcategory: string,
  level: string,
  questionCount: number,
  requirements?: string,
  type: "live" | "assessment" = "live"
) {
  // Create a specific title and description based on category/subcategory
  const quizTitle = `${
    level.charAt(0).toUpperCase() + level.slice(1)
  } ${subcategory} ${type === "live" ? "Quiz" : "Assessment"}`
  const quizDescription = `A ${level} difficulty ${
    type === "live" ? "quiz" : "assessment"
  } on ${subcategory} concepts in ${category}. Contains ${questionCount} questions.`

  const prompt = `Create a ${
    type === "live" ? "quiz" : "assessment"
  } about ${category} - ${subcategory} at ${level} difficulty level. Generate ${questionCount} questions.
    ${requirements ? `Additional requirements: ${requirements}` : ""}
    
IMPORTANT: Create all questions in Indonesian language (Bahasa Indonesia).

IMPORTANT: For any mathematical equations or expressions, use LaTeX format with $ signs. For example:
- Single line equation: $x^2 + y^2 = r^2$
- Inline equation: The area of a circle is $A = \pi r^2$
- Multiple line equation: 
$$
\\begin{align}
x &= \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\\\
y &= mx + b
\\end{align}
$$

Generate ${questionCount} multiple choice questions with 4 options each. Format the response as JSON with the following structure:
{
  "title": "${quizTitle}",
  "description": "${quizDescription}",
  "questions": [
    {
      "id": "1",
      "text": "Question text with LaTeX equations like $x^2 + y^2 = r^2$",
      "options": [
        "Option 1 with equation $y = mx + b$",
        "Option 2 with equation $A = \\pi r^2$",
        "Option 3 with equation $E = mc^2$",
        "Option 4 with equation $F = ma$"
      ],
      "correctAnswer": 0,
      "category": "${category}",
      "subcategory": "${subcategory}"
    }
  ]
}`

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that creates educational quizzes and assessments in Indonesian language (Bahasa Indonesia). Always use LaTeX format with $ signs for mathematical equations. Your response must be valid JSON only, no explanations or text outside the JSON object."
      },
      {
        role: "user",
        content: `${prompt}\n\nIMPORTANT: Your response MUST be a valid JSON object only. Do not include any explanations, markdown formatting, or text outside the JSON object.`
      }
    ],
    model: "gpt-3.5-turbo",
    temperature: 0.2 // Lower temperature for more predictable output
  })

  const content = completion.choices[0].message.content
  if (!content) {
    throw new Error("No content generated")
  }

  // More robust JSON extraction
  let jsonContent = content
  try {
    // First approach: If content has non-JSON text, try to extract the JSON object
    if (!content.trim().startsWith("{")) {
      const jsonStart = content.indexOf("{")
      const jsonEnd = content.lastIndexOf("}") + 1
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonContent = content.substring(jsonStart, jsonEnd)
      }
    }

    // Custom JSON parsing to handle LaTeX expressions
    const generatedQuiz = safeJSONParse(jsonContent)

    // Validate the response and ensure all questions have proper categories
    const validatedQuiz = validateQuizResponse(generatedQuiz, [
      {
        category,
        categoryName: category.charAt(0).toUpperCase() + category.slice(1),
        subcategory,
        subcategoryName:
          subcategory.charAt(0).toUpperCase() + subcategory.slice(1),
        questionCount
      }
    ])

    return NextResponse.json(validatedQuiz)
  } catch (error) {
    console.error("Error parsing generated quiz:", error)
    console.error("Raw content:", content)

    // Fallback approach: Create a minimal valid quiz structure with error message
    const fallbackQuiz = {
      title: quizTitle,
      description: quizDescription,
      questions: Array(questionCount)
        .fill(0)
        .map((_, index) => ({
          id: `${index + 1}`, // Match expected format - just string numbers
          text: `Error generating question ${index + 1}. Please try again.`,
          options: [
            "Option 1 (error generating content)",
            "Option 2 (error generating content)",
            "Option 3 (error generating content)",
            "Option 4 (error generating content)"
          ],
          correctAnswer: 0
        }))
    }

    return NextResponse.json(fallbackQuiz, { status: 200 })
  }
}

async function generateMultiCategoryQuiz(
  topics: Array<{
    category: string
    categoryName: string
    subcategory: string
    subcategoryName: string
    questionCount: number
  }>,
  level: string,
  requirements?: string,
  type: "live" | "assessment" = "live"
) {
  // Generate a meaningful title and description based on topics
  const mainTopics = topics
    .map((t) => t.categoryName)
    .filter((value, index, self) => self.indexOf(value) === index)

  // Create a specific title based on topics and difficulty
  let quizTitle = ""
  if (mainTopics.length === 1) {
    quizTitle = `${level.charAt(0).toUpperCase() + level.slice(1)} ${
      mainTopics[0]
    } ${type === "live" ? "Quiz" : "Assessment"}`
  } else if (mainTopics.length === 2) {
    quizTitle = `${level.charAt(0).toUpperCase() + level.slice(1)} ${
      mainTopics[0]
    } & ${mainTopics[1]} ${type === "live" ? "Quiz" : "Assessment"}`
  } else {
    quizTitle = `${
      level.charAt(0).toUpperCase() + level.slice(1)
    } Multi-Topic Math ${type === "live" ? "Quiz" : "Assessment"}`
  }

  // Create a specific description
  const totalQuestionCount = topics.reduce(
    (sum, topic) => sum + topic.questionCount,
    0
  )
  const subtopics = topics.map((t) => t.subcategoryName).join(", ")
  const quizDescription = `A ${level} difficulty ${
    type === "live" ? "quiz" : "assessment"
  } covering ${subtopics}. Contains ${totalQuestionCount} questions across ${
    topics.length
  } subtopics.`

  // Build a detailed prompt for multi-category quiz generation
  const topicsDescription = topics
    .map(
      (t) =>
        `- ${t.categoryName} / ${t.subcategoryName}: ${t.questionCount} questions`
    )
    .join("\n")

  const totalQuestions = topics.reduce(
    (sum, topic) => sum + topic.questionCount,
    0
  )

  const prompt = `Create a ${
    type === "live" ? "quiz" : "assessment"
  } covering multiple math topics at ${level} difficulty level. Generate a total of ${totalQuestions} questions distributed across the following topics:
  
${topicsDescription}
  
${requirements ? `Additional requirements: ${requirements}` : ""}

IMPORTANT: Create all questions in Indonesian language (Bahasa Indonesia).

IMPORTANT: For any mathematical equations or expressions, use LaTeX format with $ signs. For example:
- Single line equation: $x^2 + y^2 = r^2$
- Inline equation: The area of a circle is $A = \\pi r^2$
- Multiple line equation: 
$$
\\begin{align}
x &= \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\\\
y &= mx + b
\\end{align}
$$

IMPORTANT INSTRUCTIONS:
1. Generate exactly the specified number of questions for each topic
2. Label each question with the appropriate category and subcategory
3. Ensure questions clearly represent their labeled category/subcategory
4. Provide 4 options for each question, with exactly 1 correct answer
5. Use clear, precise mathematics in LaTeX format
6. Include a mix of conceptual and calculation-based questions

Format the response as JSON with the following structure:
{
  "title": "${quizTitle}",
  "description": "${quizDescription}",
  "questions": [
    {
      "id": "1",
      "text": "Question text with LaTeX equations like $x^2 + y^2 = r^2$",
      "options": [
        "Option 1 with equation $y = mx + b$",
        "Option 2 with equation $A = \\pi r^2$",
        "Option 3 with equation $E = mc^2$",
        "Option 4 with equation $F = ma$"
      ],
      "correctAnswer": 0,
      "category": "category_name",
      "subcategory": "subcategory_name"
    }
  ]
}`

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a mathematics education expert that creates high-quality educational assessments in Indonesian language (Bahasa Indonesia). You deeply understand various mathematical topics and can create appropriate questions for each category and subcategory. Always use LaTeX format with $ signs for mathematical equations. Your response must be valid JSON only, no explanations or text outside the JSON object."
      },
      {
        role: "user",
        content: `${prompt}\n\nIMPORTANT: Your response MUST be a valid JSON object only. Do not include any explanations, markdown formatting, or text outside the JSON object.`
      }
    ],
    model: "gpt-3.5-turbo-16k",
    temperature: 0.2 // Lower temperature for more predictable output
  })

  const content = completion.choices[0].message.content
  if (!content) {
    throw new Error("No content generated")
  }

  // More robust JSON extraction
  let jsonContent = content
  try {
    // First approach: If content has non-JSON text, try to extract the JSON object
    if (!content.trim().startsWith("{")) {
      const jsonStart = content.indexOf("{")
      const jsonEnd = content.lastIndexOf("}") + 1
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonContent = content.substring(jsonStart, jsonEnd)
      }
    }

    // Custom JSON parsing to handle LaTeX expressions
    const generatedQuiz = safeJSONParse(jsonContent)

    // Validate the response and ensure all questions have proper categories
    const validatedQuiz = validateQuizResponse(generatedQuiz, topics)

    return NextResponse.json(validatedQuiz)
  } catch (error) {
    console.error("Error parsing generated quiz:", error)
    console.error("Raw content:", content)

    // Fallback approach: Create a minimal valid quiz structure with error message
    const fallbackQuiz = {
      title: quizTitle,
      description: quizDescription,
      questions: topics.map((topic, index) => ({
        id: `${index + 1}`, // Match expected format - just string numbers
        text: `Error generating question for ${topic.categoryName} - ${topic.subcategoryName}. Please try again.`,
        options: [
          "Option 1 (error generating content)",
          "Option 2 (error generating content)",
          "Option 3 (error generating content)",
          "Option 4 (error generating content)"
        ],
        correctAnswer: 0
      }))
    }

    return NextResponse.json(fallbackQuiz, { status: 200 })
  }
}

// Enhance the response validation to ensure category and subcategory are always set
function validateQuizResponse(quizData: QuizData, topics: Topic[]): QuizData {
  if (!quizData.questions || !Array.isArray(quizData.questions)) {
    throw new Error("Invalid quiz structure: 'questions' array is missing")
  }

  // Create topic maps for easy lookup
  const topicMap = new Map<string, TopicMapping>()
  topics.forEach((topic) => {
    topicMap.set(
      `${topic.categoryName.toLowerCase()}-${topic.subcategoryName.toLowerCase()}`,
      {
        category: topic.category,
        subcategory: topic.subcategory,
        categoryName: topic.categoryName,
        subcategoryName: topic.subcategoryName
      }
    )
  })

  // Ensure each question has valid category and subcategory
  quizData.questions = quizData.questions.map(
    (question: QuizQuestion, index: number) => {
      // If both category and subcategory are properly set, validate them
      if (question.category && question.subcategory) {
        // Try to find a matching topic by name
        const key = `${question.category.toLowerCase()}-${question.subcategory.toLowerCase()}`
        const matchingTopic = topicMap.get(key)

        if (matchingTopic) {
          // Use the correct category and subcategory IDs
          return {
            ...question,
            category: matchingTopic.category,
            subcategory: matchingTopic.subcategory
          }
        }
      }

      // If we reach here, we need to assign a category and subcategory
      // Use the topic at the corresponding index (or the first topic as fallback)
      const fallbackTopic =
        topics[Math.min(index, topics.length - 1)] || topics[0]

      return {
        ...question,
        category: fallbackTopic.category,
        subcategory: fallbackTopic.subcategory,
        _needsReview: true // Flag for questions that had category issues
      }
    }
  )

  return quizData
}

// Helper function to safely parse JSON that might contain LaTeX expressions
function safeJSONParse(jsonString: string) {
  try {
    // First attempt: standard JSON.parse
    return JSON.parse(jsonString)
  } catch (e) {
    console.warn(
      "Standard JSON parse failed, attempting to fix LaTeX expressions:",
      e
    )

    // More aggressive cleanup for common LaTeX issues
    let fixedJson = jsonString

    // Replace escaped backslashes in LaTeX that break JSON
    fixedJson = fixedJson.replace(/\\{2,}/g, "\\\\")

    // Handle unescaped quotes within LaTeX expressions
    let inLatex = false
    let result = ""
    for (let i = 0; i < fixedJson.length; i++) {
      const char = fixedJson[i]
      const nextChar = fixedJson[i + 1]

      if (char === "$" && nextChar === "$") {
        inLatex = !inLatex
        result += "$$"
        i++ // Skip the next $ since we've already added it
      } else if (char === "$") {
        inLatex = !inLatex
        result += "$"
      } else if (char === '"' && inLatex) {
        // Escape quotes inside LaTeX
        result += '\\"'
      } else {
        result += char
      }
    }

    // Try parsing again
    try {
      return JSON.parse(result)
    } catch (innerError) {
      console.error("Failed to parse JSON even after fixes:", innerError)
      throw innerError
    }
  }
}
