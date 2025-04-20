"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/hooks/useTranslation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function StartAssessment() {
  const router = useRouter()
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError(t("start.nameError"))
      return
    }

    // Store name in localStorage for later use
    localStorage.setItem("studentName", name)

    // Navigate to the assessment page
    router.push("/assessment/questions")
  }

  return (
    <div className="p-8 pb-20 sm:p-20">
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
        <div className="w-full bg-card p-8 rounded-xl shadow-md border border-border">
          <h2 className="text-3xl font-bold text-primary mb-6 tracking-tight text-center font-heading">
            {t("start.title")}
          </h2>

          <div className="mb-8">
            <p className="text-center text-foreground mb-4">
              {t("start.welcome")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t("start.nameLabel")}
              </label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError("")
                }}
                placeholder={t("start.namePlaceholder")}
                className="w-full"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <Button type="submit" className="w-full" variant="default">
              {t("start.continue")}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="font-semibold mb-3 font-heading">
              {t("start.whatToExpect.title")}
            </h3>
            <ul className="space-y-2">
              {[0, 1, 2].map((index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-primary font-bold">
                      {index + 1}
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t(`start.whatToExpect.items.${index}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
