"use client"

import React, { useRef, useState, useEffect } from "react"
import { Button } from "./button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import ShareCard from "./share-card"
import type { AssessmentResults } from "@/types/results"
import { toPng, toBlob } from "html-to-image"
import { Loader2, ShareIcon, Download, Copy, Check, Share2 } from "lucide-react"
import Image from "next/image"

interface ShareResultsProps {
  results?: AssessmentResults
  lang: "en" | "id"
  studentName?: string
  score?: number
  totalQuestions?: number
  strengthCategories?: string[]
  timestamp?: string
}

// Definisi tipe untuk Web Share API
interface ShareData {
  files?: File[]
  title?: string
  text?: string
  url?: string
}

export default function ShareResults({
  results,
  lang,
  studentName,
  score,
  totalQuestions,
  strengthCategories,
  timestamp
}: ShareResultsProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("image")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(true)
  const [isDialogLoading, setIsDialogLoading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  // Use either the passed props or extract from results if available
  const finalScore = score ?? results?.totalScore ?? 0
  const finalTotalQuestions = totalQuestions ?? results?.totalQuestions ?? 0
  const finalTimestamp =
    timestamp ?? results?.timestamp ?? new Date().toISOString()

  // Prepare strength categories with percentages
  let strengthWithPercentages: Array<{ category: string; percent: number }> = []
  if (results?.categories) {
    const categories = [
      { key: "algebra", name: lang === "en" ? "Algebra" : "Aljabar" },
      { key: "geometry", name: lang === "en" ? "Geometry" : "Geometri" },
      { key: "arithmetic", name: lang === "en" ? "Arithmetic" : "Aritmatika" },
      { key: "calculus", name: lang === "en" ? "Calculus" : "Kalkulus" }
    ]

    strengthWithPercentages = categories
      .map((category) => {
        const { correct, total } =
          results.categories[category.key as keyof typeof results.categories]
        if (total === 0) return null

        const percentageCorrect = (correct / total) * 100
        if (percentageCorrect >= 70) {
          return { category: category.name, percent: percentageCorrect }
        }
        return null
      })
      .filter(
        (item): item is { category: string; percent: number } => item !== null
      )
      .sort((a, b) => b.percent - a.percent)
  }

  // Prepare weakness categories with percentages
  let weaknessCategories: Array<{ category: string; percent: number }> = []
  if (results?.categories) {
    const categories = [
      { key: "algebra", name: lang === "en" ? "Algebra" : "Aljabar" },
      { key: "geometry", name: lang === "en" ? "Geometry" : "Geometri" },
      { key: "arithmetic", name: lang === "en" ? "Arithmetic" : "Aritmatika" },
      { key: "calculus", name: lang === "en" ? "Calculus" : "Kalkulus" }
    ]

    weaknessCategories = categories
      .map((category) => {
        const { correct, total } =
          results.categories[category.key as keyof typeof results.categories]
        if (total === 0) return null

        const percentageCorrect = (correct / total) * 100
        if (percentageCorrect < 50) {
          return { category: category.name, percent: percentageCorrect }
        }
        return null
      })
      .filter(
        (item): item is { category: string; percent: number } => item !== null
      )
      .sort((a, b) => a.percent - b.percent)
  }

  let finalStrengthCategories: string[] = []
  if (strengthCategories && strengthCategories.length > 0) {
    finalStrengthCategories = strengthCategories
  } else if (results?.categoryScores) {
    finalStrengthCategories = results.categoryScores
      .filter(
        ({ percentage }: { percentage?: number }) => (percentage || 0) >= 70
      )
      .map(({ category }: { category: string }) => {
        if (lang === "en") {
          if (category === "algebra") return "Algebra"
          if (category === "geometry") return "Geometry"
          if (category === "statistics") return "Statistics"
          if (category === "numbers") return "Numbers"
          return category
        } else {
          if (category === "algebra") return "Aljabar"
          if (category === "geometry") return "Geometri"
          if (category === "statistics") return "Statistik"
          if (category === "numbers") return "Bilangan"
          return category
        }
      })
  }

  const translations = {
    share: lang === "en" ? "Share Results" : "Bagikan Hasil",
    shareAssessment:
      lang === "en" ? "Share Assessment Results" : "Bagikan Hasil Penilaian",
    image: lang === "en" ? "Image" : "Gambar",
    link: lang === "en" ? "Link" : "Tautan",
    copyLink: lang === "en" ? "Copy Link" : "Salin Tautan",
    download: lang === "en" ? "Download" : "Unduh",
    shareOn: lang === "en" ? "Share on" : "Bagikan di",
    generating: lang === "en" ? "Generating image..." : "Membuat gambar...",
    downloadImage: lang === "en" ? "Download Image" : "Unduh Gambar",
    imageFailed:
      lang === "en" ? "Failed to generate image" : "Gagal membuat gambar"
  }

  const generateImage = async () => {
    if (!cardRef.current) return
    setIsGenerating(true)
    setIsDialogLoading(true)

    try {
      // Tambahkan visual feedback
      setAnimationComplete(false)

      // Beri waktu UI untuk menampilkan indikator loading terlebih dahulu
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      )

      // Buat offscreen canvas untuk proses rendering yang lebih baik
      const element = cardRef.current

      // Langkah 1: Clone elemen tanpa mengubah DOM utama
      const cloneElement = element.cloneNode(true) as HTMLElement

      // Langkah 2: Siapkan div container tersembunyi untuk menyimpan clone
      const offscreenContainer = document.createElement("div")
      offscreenContainer.style.position = "absolute"
      offscreenContainer.style.left = "-9999px"
      offscreenContainer.style.top = "-9999px"
      offscreenContainer.style.width = "1000px"
      offscreenContainer.style.height = "1250px"
      offscreenContainer.style.opacity = "0"
      offscreenContainer.style.pointerEvents = "none"
      offscreenContainer.style.zIndex = "-9999"
      offscreenContainer.appendChild(cloneElement)

      // Langkah 3: Tambahkan container ke body
      document.body.appendChild(offscreenContainer)

      // Langkah 4: Beri waktu untuk browser melakukan layout calculation
      await new Promise((resolve) => setTimeout(resolve, 200))

      try {
        // Coba gunakan metode toBlob untuk kinerja yang lebih baik
        const blob = await toBlob(cloneElement, {
          quality: 0.95,
          pixelRatio: 2,
          skipAutoScale: false,
          cacheBust: true,
          backgroundColor: "#ffffff"
        })

        if (blob) {
          // Langkah 5: Cleanup sumber daya sebelum merender hasil
          document.body.removeChild(offscreenContainer)

          // Langkah 6: Konversi blob ke URL dan set state
          const url = URL.createObjectURL(blob)

          // Tunggu 1 frame animasi lagi untuk UI update
          requestAnimationFrame(() => {
            setImageUrl(url)

            // Tunda set animation complete untuk transisi lebih halus
            setTimeout(() => {
              setAnimationComplete(true)
              setIsDialogLoading(false)
            }, 100)
          })

          console.log("Image generated successfully")
          return
        }

        throw new Error("Failed to generate blob")
      } catch (blobError) {
        console.error("Error with toBlob, falling back to toPng:", blobError)

        // Fallback ke toPng dengan settings yang lebih ringan
        const dataUrl = await toPng(cloneElement, {
          quality: 0.95,
          pixelRatio: 2,
          skipAutoScale: false,
          cacheBust: true,
          backgroundColor: "#ffffff",
          width: 1000,
          height: 1250
        })

        // Langkah 5: Cleanup
        document.body.removeChild(offscreenContainer)

        // Langkah 6: Set data URL setelah cleanup
        requestAnimationFrame(() => {
          setImageUrl(dataUrl)

          setTimeout(() => {
            setAnimationComplete(true)
            setIsDialogLoading(false)
          }, 100)
        })

        console.log("Image generated with toPng fallback")
      }
    } catch (error) {
      console.error("Error generating image:", error)
      alert(translations.imageFailed)
      setAnimationComplete(true)
      setIsDialogLoading(false)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!imageUrl) {
      console.error("No image URL available for download")
      alert(translations.imageFailed)
      return
    }

    try {
      // Buat elemen anchor untuk mendownload
      const link = document.createElement("a")
      link.download = `mathbuddy-assessment-${new Date().getTime()}.png`
      link.href = imageUrl
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        // Jika URL adalah URL objek (dari blob), hapus untuk mencegah memory leak
        if (imageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(imageUrl)
          // Regenerate image setelah URL objek di-revoke
          setTimeout(() => {
            generateImage()
          }, 100)
        }
      }, 100)

      console.log("Download initiated")
    } catch (error) {
      console.error("Error downloading image:", error)
      alert(translations.imageFailed)
    }
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopySuccess(true)

    // Reset setelah 2 detik
    setTimeout(() => {
      setCopySuccess(false)
    }, 2000)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)

    // Jika dialog dibuka, langsung generate gambar
    if (newOpen) {
      setIsDialogLoading(true)
      setActiveTab("image")

      // Beri waktu dialog untuk muncul dahulu
      setTimeout(() => {
        generateImage()
      }, 300)
    } else {
      // Jika dialog ditutup, reset state
      setImageUrl(null)
      setActiveTab("image")
      setIsDialogLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      // Aktifkan loading overlay
      setIsDialogLoading(true)

      // Jika tidak ada imageUrl, generate image first
      if (!imageUrl) {
        await generateImage()
        // Berikan waktu untuk render
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      // Gunakan imageUrl yang sudah ada jika tersedia
      if (!imageUrl) {
        setIsDialogLoading(false)
        console.error("Failed to generate image for sharing")
        return
      }

      try {
        // Konversi imageUrl ke blob
        const response = await fetch(imageUrl)
        const blob = await response.blob()

        // Buat file dari blob untuk berbagi
        const file = new File([blob], "mathbuddy-result.png", {
          type: "image/png",
          lastModified: new Date().getTime()
        })

        // Buat teks informasi yang lebih lengkap
        const scorePercentage = Math.round(
          (finalScore / finalTotalQuestions) * 100
        )

        // Tambahkan informasi kekuatan
        let strengthsText = ""
        if (strengthWithPercentages && strengthWithPercentages.length > 0) {
          strengthsText = `\n\n${lang === "en" ? "Strengths" : "Kelebihan"}:\n`
          strengthWithPercentages.slice(0, 2).forEach((item, index) => {
            strengthsText += `- ${item.category} (${Math.round(item.percent)}%)`
            if (index < Math.min(strengthWithPercentages.length - 1, 1))
              strengthsText += "\n"
          })
        }

        // Tambahkan informasi kelemahan
        let weaknessesText = ""
        if (weaknessCategories && weaknessCategories.length > 0) {
          weaknessesText = `\n\n${
            lang === "en" ? "Areas for Improvement" : "Area untuk Ditingkatkan"
          }:\n`
          weaknessCategories.slice(0, 2).forEach((item, index) => {
            weaknessesText += `- ${item.category} (${Math.round(
              item.percent
            )}%)`
            if (index < Math.min(weaknessCategories.length - 1, 1))
              weaknessesText += "\n"
          })
        }

        const shareText =
          `${translations.shareAssessment}${
            studentName ? ` - ${studentName}` : ""
          }\n\n` +
          `${
            lang === "en" ? "Score" : "Skor"
          }: ${finalScore}/${finalTotalQuestions} (${scorePercentage}%)` +
          strengthsText +
          weaknessesText +
          `\n\n${lang === "en" ? "Date" : "Tanggal"}: ${new Date(
            finalTimestamp
          ).toLocaleDateString(lang === "en" ? "en-US" : "id-ID")}\n\n` +
          `${
            lang === "en"
              ? "Check my detailed results at"
              : "Lihat hasil lengkap saya di"
          }:`

        // Periksa apakah browser mendukung berbagi file
        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        ) {
          try {
            // Share dengan file
            await navigator.share({
              title: translations.shareAssessment,
              text: shareText,
              url: window.location.href,
              files: [file]
            } as ShareData)
            console.log("Shared successfully with file")
          } catch (error) {
            console.error("Error sharing with file:", error)

            // Fallback: berbagi tanpa file
            await navigator.share({
              title: translations.shareAssessment,
              text: shareText,
              url: window.location.href
            })
            console.log("Shared successfully with text only (fallback)")
          }
        } else if (navigator.share) {
          // Share tanpa file jika canShare tidak didukung
          await navigator.share({
            title: translations.shareAssessment,
            text: shareText,
            url: window.location.href
          })
          console.log("Shared successfully with text only")
        } else {
          // Fallback ke download jika Web Share API tidak didukung
          handleDownload()
        }
      } catch (error) {
        console.error("Error in sharing process:", error)
        // Fallback ke download untuk error apapun kecuali user cancel
        if (error instanceof Error && error.name !== "AbortError") {
          handleDownload()
        }
      }
    } finally {
      setIsDialogLoading(false)
    }
  }

  // Tambahkan fungsi untuk menangani berbagi melalui data URL langsung
  const handleShareDirectDataUrl = async () => {
    try {
      setIsDialogLoading(true)

      if (!cardRef.current) {
        setIsDialogLoading(false)
        return
      }

      // Gunakan cara yang paling sederhana untuk membuat gambar
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        quality: 1.0
      })

      // Set URL baru untuk ditampilkan
      setImageUrl(dataUrl)

      // Download gambar secara otomatis
      const link = document.createElement("a")
      link.download = `mathbuddy-assessment-${new Date().getTime()}.png`
      link.href = dataUrl
      link.click()

      // Buat teks informasi yang lebih lengkap
      const scorePercentage = Math.round(
        (finalScore / finalTotalQuestions) * 100
      )

      // Tambahkan informasi kekuatan
      let strengthsText = ""
      if (strengthWithPercentages && strengthWithPercentages.length > 0) {
        strengthsText = `\n\n${lang === "en" ? "Strengths" : "Kelebihan"}:\n`
        strengthWithPercentages.slice(0, 2).forEach((item, index) => {
          strengthsText += `- ${item.category} (${Math.round(item.percent)}%)`
          if (index < Math.min(strengthWithPercentages.length - 1, 1))
            strengthsText += "\n"
        })
      }

      // Tambahkan informasi kelemahan
      let weaknessesText = ""
      if (weaknessCategories && weaknessCategories.length > 0) {
        weaknessesText = `\n\n${
          lang === "en" ? "Areas for Improvement" : "Area untuk Ditingkatkan"
        }:\n`
        weaknessCategories.slice(0, 2).forEach((item, index) => {
          weaknessesText += `- ${item.category} (${Math.round(item.percent)}%)`
          if (index < Math.min(weaknessCategories.length - 1, 1))
            weaknessesText += "\n"
        })
      }

      const shareText =
        `${translations.shareAssessment}${
          studentName ? ` - ${studentName}` : ""
        }\n\n` +
        `${
          lang === "en" ? "Score" : "Skor"
        }: ${finalScore}/${finalTotalQuestions} (${scorePercentage}%)` +
        strengthsText +
        weaknessesText +
        `\n\n${lang === "en" ? "Date" : "Tanggal"}: ${new Date(
          finalTimestamp
        ).toLocaleDateString(lang === "en" ? "en-US" : "id-ID")}\n\n` +
        `${
          lang === "en"
            ? "Check my detailed results at"
            : "Lihat hasil lengkap saya di"
        }:`

      // Coba berbagi teks yang lebih informatif
      if (navigator.share) {
        await navigator.share({
          title: translations.shareAssessment,
          text: shareText,
          url: window.location.href
        })
        console.log("Shared with direct URL")
      }
    } catch (error) {
      console.error("Error in direct share:", error)
      handleDownload()
    } finally {
      setIsDialogLoading(false)
    }
  }

  // Create a function to preload the ShareCard component
  useEffect(() => {
    // Preload the card component when component mounts
    // This ensures it's already in the DOM when the dialog opens
    return () => {
      // Clean up any resources if needed when component unmounts
    }
  }, [])

  return (
    <>
      <Button
        onClick={() => handleOpenChange(true)}
        size="lg"
        className="transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
      >
        <ShareIcon className="w-4 h-4 mr-2" />
        {translations.share}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md duration-300 w-full max-w-lg mx-auto">
          {isDialogLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <DialogHeader>
            <DialogTitle>{translations.shareAssessment}</DialogTitle>
          </DialogHeader>
          <Tabs
            defaultValue="image"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image">{translations.image}</TabsTrigger>
              <TabsTrigger value="link">{translations.link}</TabsTrigger>
            </TabsList>
            <TabsContent
              value="image"
              className="pt-4 transition-all duration-300 ease-in-out"
            >
              <div className="flex justify-center overflow-hidden rounded-md mb-4">
                {imageUrl ? (
                  <div
                    className={`w-full flex items-center justify-center transition-opacity duration-300 ${
                      animationComplete ? "opacity-100" : "opacity-30"
                    }`}
                  >
                    <Image
                      src={imageUrl}
                      alt="Assessment Result"
                      className="max-w-full max-h-[300px] rounded-md object-contain"
                      width={500}
                      height={300}
                      unoptimized
                      onLoadingComplete={() => {
                        setAnimationComplete(true)
                        setIsDialogLoading(false)
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-[300px] w-full flex flex-col items-center justify-center bg-gray-100 rounded-md">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
                    <p className="text-gray-500">{translations.generating}</p>
                  </div>
                )}
              </div>

              {imageUrl && (
                <div className="flex flex-col sm:flex-row justify-between w-full gap-3">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 flex-1"
                    onClick={handleDownload}
                    disabled={isGenerating}
                  >
                    <Download className="h-4 w-4" />
                    {translations.downloadImage}
                  </Button>

                  <Button
                    variant="default"
                    className="flex items-center gap-2 flex-1"
                    onClick={handleShare}
                    disabled={isGenerating}
                  >
                    <Share2 className="h-4 w-4" />
                    {lang === "en" ? "Share" : "Bagikan"}
                  </Button>
                </div>
              )}

              {/* Tambahkan tombol fallback jika platform adalah mobile */}
              {imageUrl &&
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                  navigator.userAgent
                ) && (
                  <div className="mt-3">
                    <Button
                      variant="ghost"
                      className="w-full text-sm text-muted-foreground"
                      onClick={handleShareDirectDataUrl}
                      disabled={isGenerating}
                    >
                      {lang === "en"
                        ? "Alternative share method"
                        : "Metode berbagi alternatif"}
                    </Button>
                  </div>
                )}
            </TabsContent>
            <TabsContent
              value="link"
              className="pt-4 transition-all duration-300 ease-in-out"
            >
              <div className="mb-4">
                <div className="relative">
                  <input
                    readOnly
                    value={
                      typeof window !== "undefined" ? window.location.href : ""
                    }
                    className={`w-full rounded-md border p-2 pr-20 transition-colors duration-200 ${
                      copySuccess ? "border-green-500 bg-green-50" : ""
                    }`}
                  />
                  {copySuccess && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 text-sm bg-green-50 px-2 py-1 rounded">
                      {lang === "en" ? "Copied!" : "Tersalin!"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center w-full">
                <Button
                  variant={copySuccess ? "default" : "outline"}
                  className={`flex items-center gap-2 w-full max-w-md transition-all duration-200 ${
                    copySuccess ? "bg-green-600 hover:bg-green-700" : ""
                  }`}
                  onClick={handleCopyLink}
                >
                  {copySuccess ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copySuccess
                    ? lang === "en"
                      ? "Copied!"
                      : "Tersalin!"
                    : translations.copyLink}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Hidden component for image generation */}
      <div
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          visibility: "hidden",
          pointerEvents: "none",
          opacity: "0",
          transform: "scale(1)",
          transformOrigin: "0 0",
          width: "1000px",
          height: "1250px",
          zIndex: "-9999",
          overflow: "hidden",
          backgroundColor: "#ffffff"
        }}
      >
        <ShareCard
          ref={cardRef}
          studentName={studentName ?? results?.studentName}
          score={finalScore}
          totalQuestions={finalTotalQuestions}
          strengthCategories={finalStrengthCategories}
          strengthPercentages={strengthWithPercentages}
          weaknessCategories={weaknessCategories}
          timestamp={finalTimestamp}
          lang={lang}
        />
      </div>
    </>
  )
}
