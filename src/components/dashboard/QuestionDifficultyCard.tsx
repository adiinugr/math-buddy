import { BadgeAlert, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import Latex from "react-latex-next"
import "katex/dist/katex.min.css"

interface QuestionDifficultyCardProps {
  question: {
    id: string
    text: string
    quizId: string
    quizTitle: string
    subcategory: string
    correctPercentage: number
    difficulty: "Hard" | "Medium" | "Easy"
  }
  onClick?: () => void
}

export function QuestionDifficultyCard({
  question,
  onClick
}: QuestionDifficultyCardProps) {
  const difficultyConfig = {
    Hard: {
      icon: BadgeAlert,
      iconColor: "text-red-500",
      textColor: "text-red-500",
      bgColor: "bg-red-100",
      labelIcon: AlertCircle,
      labelColor: "text-red-500",
      label: "Difficult"
    },
    Medium: {
      icon: Clock,
      iconColor: "text-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
      labelIcon: Clock,
      labelColor: "text-yellow-500",
      label: "Moderate"
    },
    Easy: {
      icon: CheckCircle2,
      iconColor: "text-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-100",
      labelIcon: CheckCircle2,
      labelColor: "text-green-500",
      label: "Easy"
    }
  }

  const config = difficultyConfig[question.difficulty]
  const Icon = config.icon
  const LabelIcon = config.labelIcon

  return (
    <div
      className="p-4 rounded-lg bg-white/50 border border-white/20 hover:bg-white/70 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${config.iconColor}`} />
        <span
          className={`text-sm font-medium ${config.textColor} ${config.bgColor} px-2 py-0.5 rounded-full`}
        >
          {question.correctPercentage}% correct
        </span>
        <span className="text-sm text-gray-500">
          From: {question.quizTitle}
        </span>
      </div>
      <p className="text-gray-800 font-medium mb-2">
        <Latex>{question.text}</Latex>
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Category: {question.subcategory}
        </span>
        <div className="flex items-center gap-1 text-xs">
          <LabelIcon className={`h-3 w-3 ${config.labelColor}`} />
          <span className={`${config.textColor} font-medium`}>
            {config.label}
          </span>
        </div>
      </div>
    </div>
  )
}
