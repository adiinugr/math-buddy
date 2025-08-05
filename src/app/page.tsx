"use client"

import { useTranslation } from "@/hooks/useTranslation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import {
  ArrowRight,
  BookOpen,
  Brain,
  LineChart,
  Target,
  Key,
  LucideIcon
} from "lucide-react"
import { useRouter } from "next/navigation"
import { memo } from "react"

// Memoized feature card component
const FeatureCard = memo(
  ({
    icon: Icon,
    color,
    title,
    description
  }: {
    icon: LucideIcon
    color: string
    title: string
    description: string
  }) => (
    <div
      className="backdrop-blur-lg bg-white/30 p-4 sm:p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all group"
      role="article"
      aria-labelledby={`feature-title-${title}`}
    >
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 ${
          color === "purple" ? "bg-purple-500/20" : "bg-blue-500/20"
        } rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}
        aria-hidden="true"
      >
        <Icon
          className={`w-5 h-5 sm:w-6 sm:h-6 ${
            color === "purple" ? "text-purple-600" : "text-blue-600"
          }`}
        />
      </div>
      <h3
        id={`feature-title-${title}`}
        className="text-base sm:text-lg font-semibold text-gray-800 mb-2 font-heading"
      >
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600">{description}</p>
    </div>
  )
)

FeatureCard.displayName = "FeatureCard"

// Memoized why choose item component
const WhyChooseItem = memo(
  ({
    index,
    title,
    description
  }: {
    index: number
    title: string
    description: string
  }) => (
    <div
      className="flex gap-3 sm:gap-4"
      role="article"
      aria-labelledby={`why-choose-title-${index}`}
    >
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 ${
          index === 3 ? "bg-purple-500/20" : "bg-blue-500/20"
        } rounded-full flex items-center justify-center flex-shrink-0`}
        aria-hidden="true"
      >
        <svg
          className={`w-4 h-4 sm:w-5 sm:h-5 ${
            index === 3 ? "text-purple-600" : "text-blue-600"
          }`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <h4
          id={`why-choose-title-${index}`}
          className="text-base sm:text-lg font-semibold text-gray-800 mb-1"
        >
          {title}
        </h4>
        <p className="text-sm sm:text-base text-gray-600">{description}</p>
      </div>
    </div>
  )
)

WhyChooseItem.displayName = "WhyChooseItem"

export default function Home() {
  const { t } = useTranslation()
  const { status } = useSession()
  const router = useRouter()

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex flex-col gap-6 sm:gap-8 md:gap-[32px] items-center w-full max-w-7xl mx-auto relative">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-10 w-full animate-fade-in-up">
          <div className="flex flex-col justify-center backdrop-blur-lg bg-white/30 p-6 sm:p-8 rounded-xl border border-white/20 shadow-lg w-full">
            <h1 className="text-3xl xl:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 font-heading">
              {t("home.hero.title")}{" "}
              <span className="text-blue-600" aria-hidden="true">
                β
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">
              {t("home.hero.description")}
            </p>
            {status === "authenticated" ? (
              <Button
                asChild
                size="lg"
                className="w-full sm:w-fit bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/20 group button-hover-effect"
              >
                <Link
                  href="/dashboard/role"
                  className="flex items-center justify-center gap-2"
                >
                  {t("home.hero.dashboard")}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-fit bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/20 group button-hover-effect"
                >
                  <Link
                    href="/auth/register"
                    className="flex items-center justify-center gap-2"
                  >
                    Mulai Sekarang
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-fit bg-white/50 border-gray-200/50 hover:bg-white/70 text-gray-800 hover:text-gray-900"
                >
                  <Link
                    href="/auth/login"
                    className="flex items-center justify-center gap-2"
                  >
                    Saya sudah punya akun
                  </Link>
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center w-full md:w-2/5">
            <div className="relative w-full h-60 sm:h-80 md:h-96 rounded-xl overflow-hidden backdrop-blur-lg bg-white/30 border border-white/20 shadow-lg flex items-center justify-center animate-subtle-pulse">
              <span
                className="text-[150px] sm:text-[200px] font-bold text-blue-600 font-serif drop-shadow-lg hover:text-purple-600 transition-colors duration-300"
                aria-hidden="true"
              >
                β
              </span>

              {/* Add floating elements */}
              <div
                className="absolute top-1/4 right-1/4 w-16 h-16 rounded-full bg-purple-500/10 animate-pulse"
                style={{ animationDuration: "4s" }}
                aria-hidden="true"
              ></div>
              <div
                className="absolute bottom-1/3 left-1/4 w-12 h-12 rounded-full bg-blue-500/10 animate-pulse"
                style={{ animationDuration: "6s" }}
                aria-hidden="true"
              ></div>
              <div
                className="absolute top-1/2 left-1/6 w-8 h-8 rounded-lg bg-blue-500/5 rotate-12 animate-float"
                aria-hidden="true"
              ></div>
            </div>
          </div>
        </div>

        <div className="w-full backdrop-blur-lg bg-white/30 p-6 sm:p-8 rounded-xl border border-white/20 shadow-lg animate-fade-in-up delay-1 hover-lift">
          <div className="flex flex-col items-center text-center">
            <div
              className="p-2 rounded-full bg-blue-500/20 mb-3 sm:mb-4"
              aria-hidden="true"
            >
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 font-heading">
              Sudah punya kode kuis?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md">
              {/* TODO: Add a link to the join page */}
              Masukkan kode kuis Anda untuk langsung bergabung dengan penilaian.
              Tidak perlu akun!
            </p>
            <Button
              onClick={() => router.push("/join")}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white button-hover-effect"
            >
              Gabung Kuis atau Penilaian
            </Button>
          </div>
        </div>

        <div className="w-full mt-8 sm:mt-16 animate-fade-in-up delay-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-10 font-heading text-gray-800">
            {t("home.howItWorks.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full">
            {[
              { icon: BookOpen, color: "blue" },
              { icon: Brain, color: "purple" },
              { icon: LineChart, color: "blue" },
              { icon: Target, color: "purple" }
            ].map(({ icon: Icon, color }, index) => (
              <FeatureCard
                key={index}
                icon={Icon}
                color={color}
                title={t(`home.howItWorks.steps.${index}.title`)}
                description={t(`home.howItWorks.steps.${index}.description`)}
              />
            ))}
          </div>
        </div>

        <div className="w-full mt-8 sm:mt-16 backdrop-blur-lg bg-white/30 p-6 sm:p-8 rounded-xl border border-white/20 shadow-lg animate-fade-in-up delay-3 hover-lift">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 font-heading text-gray-800">
            {t("home.whyChoose.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {[0, 1, 2, 3].map((index) => (
              <WhyChooseItem
                key={index}
                index={index}
                title={t(`home.whyChoose.features.${index}.title`)}
                description={t(`home.whyChoose.features.${index}.description`)}
              />
            ))}
          </div>
        </div>

        {status !== "authenticated" && (
          <div className="w-full mt-8 sm:mt-16 backdrop-blur-lg bg-white/30 p-6 sm:p-8 rounded-xl border border-white/20 shadow-lg text-center animate-fade-in-up delay-4 hover-lift">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 font-heading text-gray-800">
              Siap untuk memulai?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan siswa yang telah meningkatkan
              keterampilan matematika mereka dengan alat diagnostik kami.
            </p>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/20 group button-hover-effect"
            >
              <Link
                href="/auth/register"
                className="flex items-center justify-center gap-2"
              >
                Buat akun gratis Anda
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
