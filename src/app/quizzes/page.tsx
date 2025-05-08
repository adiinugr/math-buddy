"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  Edit,
  BarChart2,
  Trash2,
  Plus,
  Calendar,
  ArrowLeft,
  PenTool
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

interface Quiz {
  id: string
  title: string
  description: string
  createdAt: string
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch("/api/quizzes")
        if (!response.ok) throw new Error("Failed to fetch quizzes")
        const data = await response.json()
        setQuizzes(data)
      } catch (err) {
        setError("Failed to load quizzes")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  const handleDelete = async (quizId: string) => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error("Failed to delete quiz")
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId))
      setQuizToDelete(null)
    } catch (err) {
      setError("Failed to delete quiz")
      console.error(err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex flex-col gap-8 items-center w-full max-w-7xl mx-auto relative">
        <div className="w-full backdrop-blur-lg bg-white/30 p-6 rounded-xl border border-white/20 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard?role=teacher")}
                  className="flex items-center gap-1 border-gray-300 bg-white/50 hover:bg-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 font-heading text-center sm:text-left">
                Kuis Saya
              </h2>
              <p className="text-gray-600 mt-1 text-center sm:text-left">
                Kelola kuis dan penilaian Anda
              </p>
            </div>
            <Button
              onClick={() => router.push("/quizzes/new")}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/20 group"
            >
              Buat Kuis Baru
              <Plus className="ml-2 h-4 w-4 transition-transform group-hover:rotate-90" />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center py-8 px-4 bg-white/50 rounded-lg shadow-sm max-w-md w-full">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2.5"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="mt-6 w-full">
                    <div className="h-10 bg-gray-200 rounded-md w-full"></div>
                  </div>
                </div>
                <p className="text-gray-500 mt-8">Memuat kuis Anda...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center py-8 bg-red-50 rounded-lg border border-red-100 px-6 max-w-md w-full">
                <div className="text-red-500 bg-red-100 p-3 rounded-full inline-flex mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Error Memuat Kuis
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  Coba Lagi
                </Button>
              </div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center py-10 px-6 bg-white/50 rounded-lg shadow-sm max-w-md w-full">
                <div className="bg-blue-100 p-3 rounded-full inline-flex mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Tidak Ada Kuis Ditemukan
                </h3>
                <p className="text-gray-600 mb-6">
                  Anda belum membuat kuis apa pun. Mulai dengan membuat kuis
                  pertama Anda!
                </p>
                <Button
                  onClick={() => router.push("/quizzes/new")}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Kuis Pertama Anda
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="backdrop-blur-lg bg-white/30 border-white/20 shadow-sm hover:shadow-lg transition-all"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-medium text-gray-800">
                      {quiz.title}
                    </CardTitle>
                    <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(quiz.createdAt)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <p className="text-gray-600 line-clamp-2 text-sm">
                      {quiz.description || "Tidak ada deskripsi."}
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch gap-2">
                    <div className="grid grid-cols-3 gap-2 w-full">
                      <Button
                        onClick={() => router.push(`/quizzes/${quiz.id}/edit`)}
                        variant="outline"
                        className="flex items-center gap-1 text-xs h-9 bg-white/50"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        onClick={() =>
                          router.push(`/quizzes/${quiz.id}/results`)
                        }
                        variant="outline"
                        className="flex items-center gap-1 text-xs h-9 bg-white/50"
                      >
                        <BarChart2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Hasil</span>
                      </Button>
                      <Button
                        onClick={() => setQuizToDelete(quiz.id)}
                        variant="outline"
                        className="flex items-center gap-1 text-xs h-9 bg-white/50 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Hapus</span>
                      </Button>
                    </div>
                    <Button
                      onClick={() =>
                        router.push(`/quizzes/${quiz.id}/assessment`)
                      }
                      className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-green-500/20 group w-full flex items-center justify-center gap-1 h-9"
                    >
                      <PenTool className="h-3.5 w-3.5" />
                      Mulai Penilaian
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={!!quizToDelete}
        onOpenChange={() => setQuizToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Apakah Anda yakin ingin menghapus kuis ini?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Kuis ini akan dihapus secara
              permanen dari server kami.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => quizToDelete && handleDelete(quizToDelete)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
