"use client"

import { useTranslation } from "@/hooks/useTranslation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="p-6 pb-20 sm:p-20">
      <div className="flex flex-col gap-[32px] items-center w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-heading">
              {t("home.hero.title")} <span className="text-accent">β</span>
            </h2>
            <p className="text-foreground mb-6 text-lg">
              {t("home.hero.description")}
            </p>
            <Button asChild size="lg" className="w-fit">
              <Link href="/assessment/start">{t("home.hero.cta")}</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center">
              <span className="text-[200px] font-bold text-primary font-serif drop-shadow-lg hover:text-accent transition-colors duration-300">
                β
              </span>
            </div>
          </div>
        </div>

        <div className="w-full mt-16">
          <h3 className="text-2xl font-semibold text-center mb-10 font-heading">
            {t("home.howItWorks.title")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-xl shadow-md border border-border hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-12 h-12 ${
                    index === 3 ? "bg-accent/20" : "bg-primary/20"
                  } rounded-full flex items-center justify-center mb-4`}
                >
                  <span
                    className={`font-bold text-xl ${
                      index === 3 ? "text-accent" : "text-primary"
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2 font-heading">
                  {t(`home.howItWorks.steps.${index}.title`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(`home.howItWorks.steps.${index}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full mt-16 bg-card p-8 rounded-xl shadow-md border border-border">
          <h3 className="text-2xl font-semibold mb-6 font-heading">
            {t("home.whyChoose.title")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="flex gap-4">
                <div
                  className={`w-10 h-10 ${
                    index === 3 ? "bg-accent/20" : "bg-primary/20"
                  } rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <svg
                    className={`w-5 h-5 ${
                      index === 3 ? "text-accent" : "text-primary"
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {index === 0 && (
                      <path
                        d="M3 6h18M3 12h18M3 18h18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    )}
                    {index === 1 && (
                      <>
                        <path
                          d="M4 4l16 16M4 20L20 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </>
                    )}
                    {index === 2 && (
                      <>
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <text
                          x="7.5"
                          y="15"
                          fontSize="9"
                          fontWeight="bold"
                          fill="currentColor"
                          fontFamily="serif"
                        >
                          β
                        </text>
                      </>
                    )}
                    {index === 3 && (
                      <>
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M12 7v10M7 12h10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </>
                    )}
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 font-heading">
                    {t(`home.whyChoose.features.${index}.title`)}
                  </h4>
                  <p className="text-muted-foreground">
                    {t(`home.whyChoose.features.${index}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full mt-10 flex flex-col items-center">
          <h3 className="text-2xl font-semibold mb-4 font-heading">
            {t("home.finalCta.title")}
          </h3>
          <Button asChild size="lg" className="mt-4 text-lg">
            <Link href="/assessment/start">{t("home.finalCta.button")}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
