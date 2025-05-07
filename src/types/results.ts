export type SubcategoryKey =
  | "equations"
  | "inequalities"
  | "polynomials"
  | "functions"
  | "shapes"
  | "angles"
  | "area"
  | "volume"
  | "operations"
  | "fractions"
  | "decimals"
  | "percentages"
  | "derivatives"
  | "integrals"
  | "limits"
  | "applications"

export type CategoryKey = "algebra" | "geometry" | "arithmetic" | "calculus"

export type AssessmentResults = {
  totalScore: number
  totalQuestions: number
  studentName?: string
  score?: number
  categoryScores?: Array<{
    category: string
    percentage?: number
  }>
  categories: {
    [key in CategoryKey]: {
      correct: number
      total: number
      subcategories: {
        [key in SubcategoryKey]?: {
          correct: number
          total: number
        }
      }
    }
  }
  difficulties: {
    easy: { correct: number; total: number }
    medium: { correct: number; total: number }
    hard: { correct: number; total: number }
  }
  timestamp: string
  answers?: Record<string, string>
}
