export type SubcategoryKey =
  | "persamaan"
  | "pertidaksamaan"
  | "polinomial"
  | "fungsi"
  | "bentuk"
  | "sudut"
  | "luas"
  | "volume"
  | "operasi"
  | "pecahan"
  | "desimal"
  | "persentase"
  | "turunan"
  | "integral"
  | "limit"
  | "aplikasi"

export type CategoryKey = "aljabar" | "geometri" | "aritmatika" | "kalkulus"

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
