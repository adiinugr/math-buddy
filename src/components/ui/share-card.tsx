"use client"

import React, { forwardRef } from "react"

interface ShareCardProps {
  studentName?: string
  score: number
  totalQuestions: number
  strengthCategories: string[]
  timestamp: string
  lang: "en" | "id"
  weaknessCategories?: Array<{ category: string; percent: number }>
  strengthPercentages?: Array<{ category: string; percent: number }>
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  (
    {
      studentName = "Anonymous",
      score,
      totalQuestions,
      strengthCategories,
      timestamp,
      lang,
      weaknessCategories = [],
      strengthPercentages = []
    },
    ref
  ) => {
    const percentage = Math.round((score / totalQuestions) * 100)

    // Format the timestamp if it's an ISO string
    const formattedTimestamp = (() => {
      try {
        // Pastikan tanggal valid terlebih dahulu
        const date = new Date(timestamp)
        if (isNaN(date.getTime())) {
          // Jika tanggal tidak valid, gunakan tanggal saat ini
          return new Date().toLocaleDateString(
            lang === "en" ? "en-US" : "id-ID",
            {
              year: "numeric",
              month: "long",
              day: "numeric"
            }
          )
        }

        return date.toLocaleDateString(lang === "en" ? "en-US" : "id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      } catch {
        // Jika format gagal, gunakan tanggal saat ini dengan format default
        return new Date().toLocaleDateString(lang === "en" ? "en-US" : "id-ID")
      }
    })()

    const translations = {
      result: lang === "en" ? "Assessment Result" : "Hasil Penilaian",
      studentName: lang === "en" ? "Student Name" : "Nama Siswa",
      score: lang === "en" ? "Score" : "Skor",
      strengths: lang === "en" ? "Strengths" : "Kelebihan",
      weaknesses:
        lang === "en" ? "Areas for Improvement" : "Area untuk Ditingkatkan",
      date: lang === "en" ? "Date" : "Tanggal",
      poweredBy: lang === "en" ? "Powered by" : "Diberdayakan oleh",
      mathBuddy: "MathBuddy"
    }

    // Konversi strengthCategories ke strengthPercentages jika tidak ada data persentase
    const displayStrengths =
      strengthPercentages.length > 0
        ? strengthPercentages
        : strengthCategories.map((category) => ({ category, percent: 0 }))

    return (
      <div
        ref={ref}
        className="bg-white p-12 rounded-lg border-2 border-indigo-300 shadow-lg w-full flex flex-col"
        style={{
          fontFamily: "Arial, sans-serif",
          color: "#111",
          width: "1000px",
          height: "1250px",
          boxSizing: "border-box",
          margin: "0",
          padding: "48px",
          background: "linear-gradient(to bottom, #ffffff, #f7f9ff)",
          contain: "layout paint style"
        }}
      >
        {/* Header with Logo */}
        <div
          className="text-center border-b-4 border-indigo-500 pb-8 mb-10 flex items-center justify-between"
          style={{ paddingBottom: "32px", marginBottom: "40px" }}
        >
          <div className="flex-1 text-left">
            <h2 className="text-4xl font-bold text-indigo-700">
              {translations.result}
            </h2>
          </div>
          <div className="flex-none">
            <div className="text-primary font-bold text-4xl font-heading">
              {translations.mathBuddy}
              <span className="text-accent text-3xl align-text-top">β</span>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="mb-12" style={{ marginBottom: "48px" }}>
          <div
            className="mb-4 text-2xl"
            style={{ marginBottom: "20px", fontSize: "32px" }}
          >
            <span
              className="font-medium text-gray-800"
              style={{ fontWeight: "500", color: "#333" }}
            >
              {translations.studentName}:
            </span>
            <span
              className="ml-3 font-bold"
              style={{ marginLeft: "16px", fontWeight: "700" }}
            >
              {studentName}
            </span>
          </div>

          <div
            className="mb-4 text-2xl"
            style={{ marginBottom: "20px", fontSize: "32px" }}
          >
            <span
              className="font-medium text-gray-800"
              style={{ fontWeight: "500", color: "#333" }}
            >
              {translations.date}:
            </span>
            <span className="ml-3" style={{ marginLeft: "16px" }}>
              {formattedTimestamp}
            </span>
          </div>
        </div>

        {/* Score */}
        <div
          className="flex items-center justify-center mb-12 bg-indigo-50 py-8 rounded-2xl"
          style={{
            marginBottom: "48px",
            padding: "36px 0",
            borderRadius: "16px"
          }}
        >
          <div
            className="relative w-64 h-64 mx-6"
            style={{ width: "280px", height: "280px", margin: "0 24px" }}
          >
            <div
              className="w-full h-full rounded-full border-16 border-indigo-100 flex items-center justify-center"
              style={{
                borderWidth: "18px",
                borderColor: "#e0e7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9999px"
              }}
            >
              <div
                className="text-6xl font-bold text-indigo-700"
                style={{
                  fontSize: "72px",
                  fontWeight: "800",
                  color: "#4338ca"
                }}
              >
                {percentage}%
              </div>
            </div>
            <div
              className="absolute top-0 left-0 w-full h-full rounded-full border-16 border-indigo-600 border-t-transparent border-r-transparent"
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                borderRadius: "9999px",
                borderWidth: "18px",
                borderColor: "#4f46e5",
                borderTopColor: "transparent",
                borderRightColor: "transparent",
                transform: `rotate(${percentage * 3.6}deg)`,
                transition: "transform 1s ease-in-out"
              }}
            />
          </div>

          <div className="text-center ml-6" style={{ marginLeft: "24px" }}>
            <div
              className="text-2xl font-medium text-indigo-800"
              style={{ fontSize: "32px", fontWeight: "500", color: "#3730a3" }}
            >
              {translations.score}
            </div>
            <div
              className="text-4xl font-bold mt-3 text-indigo-900"
              style={{
                fontSize: "56px",
                fontWeight: "700",
                marginTop: "12px",
                color: "#312e81"
              }}
            >
              {score} / {totalQuestions}
            </div>
          </div>
        </div>

        {/* Performance Data - Side by Side */}
        <div
          className="grid grid-cols-2 gap-8 mb-12"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
            marginBottom: "48px"
          }}
        >
          {/* Strengths Section */}
          <div
            className="bg-green-50 p-6 rounded-xl"
            style={{
              backgroundColor: "#ecfdf5",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
            }}
          >
            <h3
              className="text-2xl font-semibold mb-6 text-green-800"
              style={{
                fontSize: "32px",
                fontWeight: "600",
                marginBottom: "24px",
                color: "#166534"
              }}
            >
              {translations.strengths}
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {displayStrengths.length > 0 ? (
                displayStrengths.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 20px",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
                    }}
                  >
                    <span style={{ fontSize: "22px", fontWeight: "500" }}>
                      {item.category}
                    </span>
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#16a34a",
                        backgroundColor: "#dcfce7",
                        padding: "6px 16px",
                        borderRadius: "9999px"
                      }}
                    >
                      {Math.round(item.percent)}%
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "22px",
                    color: "#555"
                  }}
                >
                  {lang === "en"
                    ? "Keep practicing to develop your strengths!"
                    : "Terus berlatih untuk mengembangkan kelebihanmu!"}
                </div>
              )}
            </div>
          </div>

          {/* Weaknesses Section */}
          <div
            className="bg-orange-50 p-6 rounded-xl"
            style={{
              backgroundColor: "#fff7ed",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
            }}
          >
            <h3
              className="text-2xl font-semibold mb-6 text-orange-800"
              style={{
                fontSize: "32px",
                fontWeight: "600",
                marginBottom: "24px",
                color: "#9a3412"
              }}
            >
              {translations.weaknesses}
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {weaknessCategories.length > 0 ? (
                weaknessCategories.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 20px",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
                    }}
                  >
                    <span style={{ fontSize: "22px", fontWeight: "500" }}>
                      {item.category}
                    </span>
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#ea580c",
                        backgroundColor: "#ffedd5",
                        padding: "6px 16px",
                        borderRadius: "9999px"
                      }}
                    >
                      {Math.round(item.percent)}%
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "22px",
                    color: "#555"
                  }}
                >
                  {lang === "en"
                    ? "Great job! You're doing well in all areas."
                    : "Kerja bagus! Kamu berhasil di semua area."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-auto text-center text-lg text-gray-600 pt-8 border-t-2 border-indigo-200"
          style={{
            marginTop: "auto",
            textAlign: "center",
            fontSize: "24px",
            color: "#4b5563",
            paddingTop: "32px",
            borderTopWidth: "2px",
            borderTopColor: "#c7d2fe",
            background:
              "linear-gradient(to bottom, rgba(224, 231, 255, 0), rgba(224, 231, 255, 0.2))",
            paddingBottom: "16px",
            borderRadius: "0 0 12px 12px"
          }}
        >
          <p
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {translations.poweredBy}
            <span
              style={{
                fontWeight: "700",
                background: "linear-gradient(45deg, #4338ca, #6366f1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              {translations.mathBuddy}
            </span>
          </p>
        </div>
      </div>
    )
  }
)

ShareCard.displayName = "ShareCard"

export default ShareCard
