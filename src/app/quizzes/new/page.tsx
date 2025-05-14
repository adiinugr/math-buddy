"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wand2, Pencil, ArrowRight, BookOpen } from "lucide-react"

export default function NewQuizPage() {
  const router = useRouter()
  const quizType = "assessment"

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex flex-col gap-8 items-center w-full max-w-2xl mx-auto relative">
        <div className="w-full backdrop-blur-lg bg-white/30 p-6 rounded-xl border border-white/20 shadow-lg">
          <div className="flex flex-col items-center text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-heading">
              Buat Penilaian Baru
            </h2>
            <p className="text-gray-700 text-base mb-6">
              Pilih bagaimana Anda ingin membuat penilaian Anda
            </p>
            <div className="w-full max-w-md flex items-center justify-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-medium text-gray-800">
                Penilaian
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className="backdrop-blur-lg bg-white/30 border-white/20 cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() =>
                router.push(`/quizzes/new/generate?type=${quizType}`)
              }
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-blue-500/20 mb-4 group-hover:scale-110 transition-transform">
                    <Wand2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Generate dengan AI
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Biarkan AI membantu Anda membuat penilaian berdasarkan topik
                    dan persyaratan Anda
                  </p>
                  <Button className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/20 group">
                    Generate
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card
              className="backdrop-blur-lg bg-white/30 border-white/20 cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() =>
                router.push(`/quizzes/new/manual?type=${quizType}`)
              }
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-blue-500/20 mb-4 group-hover:scale-110 transition-transform">
                    <Pencil className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Buat Manual
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Buat penilaian Anda secara manual dengan kendali penuh atas
                    pertanyaan dan jawaban
                  </p>
                  <Button className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/20 group">
                    Buat
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
