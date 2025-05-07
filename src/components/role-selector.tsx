"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { GraduationCap, UserCog } from "lucide-react"

export interface RoleSelectorProps {
  onRoleSelect: (role: "student" | "teacher") => void
  welcomeMessage?: string
}

export default function RoleSelector({
  onRoleSelect,
  welcomeMessage
}: RoleSelectorProps) {
  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
        {welcomeMessage && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 font-heading">
              {welcomeMessage}
            </h1>
            <p className="text-xl text-gray-600">
              Bagaimana Anda ingin menggunakan platform ini?
            </p>
          </div>
        )}

        {!welcomeMessage && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 font-heading">
              Pilih Peran Anda
            </h1>
            <p className="text-xl text-gray-600">
              Pilih peran Anda untuk mengakses fitur dan konten yang sesuai
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <Card
            className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => onRoleSelect("student")}
          >
            <CardHeader>
              <div className="p-4 rounded-full bg-blue-500/20 w-fit mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-heading text-gray-800">
                Saya seorang Siswa
              </CardTitle>
              <CardDescription className="text-lg">
                Ikuti penilaian dan lacak kemajuan belajar Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Ambil penilaian diagnostik
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Lacak kemajuan belajar Anda
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Dapatkan rekomendasi yang dipersonalisasi
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card
            className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => onRoleSelect("teacher")}
          >
            <CardHeader>
              <div className="p-4 rounded-full bg-purple-500/20 w-fit mb-4 group-hover:scale-110 transition-transform">
                <UserCog className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl font-heading text-gray-800">
                Saya seorang Guru
              </CardTitle>
              <CardDescription className="text-lg">
                Buat penilaian dan lacak kemajuan siswa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Buat dan kelola penilaian
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Lacak performa siswa
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Hasilkan laporan terperinci
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
