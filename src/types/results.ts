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
    algebra: { correct: number; total: number }
    geometry: { correct: number; total: number }
    arithmetic: { correct: number; total: number }
    calculus: { correct: number; total: number }
  }
  difficulties: {
    easy: { correct: number; total: number }
    medium: { correct: number; total: number }
    hard: { correct: number; total: number }
  }
  timestamp: string
  answers?: Record<string, string>
}
