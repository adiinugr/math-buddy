"use client"

import React, { useRef, useState, useEffect } from "react"
import { Button } from "./button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import ShareCard from "./share-card"
import type { AssessmentResults } from "@/types/results"
import { toPng, toBlob } from "html-to-image"
import { FaTwitter, FaFacebook, FaWhatsapp } from "react-icons/fa"
import { Loader2, ShareIcon } from "lucide-react"

interface ShareResultsProps {
  results?: AssessmentResults
  lang: "en" | "id"
  studentName?: string
  score?: number
  totalQuestions?: number
  strengthCategories?: string[]
  timestamp?: string
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
      await new Promise((resolve) => setTimeout(resolve, 100))

      try {
        // Coba gunakan metode toBlob untuk kinerja yang lebih baik
        const blob = await toBlob(cloneElement, {
          quality: 0.95,
          pixelRatio: 1.5, // Turunkan untuk performa
          skipAutoScale: true,
          cacheBust: true
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
          quality: 0.9,
          pixelRatio: 1.5,
          skipAutoScale: true,
          cacheBust: true,
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

  // Create a function to preload the ShareCard component
  useEffect(() => {
    // Preload the card component when component mounts
    // This ensures it's already in the DOM when the dialog opens
    return () => {
      // Clean up any resources if needed when component unmounts
    }
  }, [])

  // Tambahkan fungsi untuk berbagi ke WhatsApp dengan gambar dan link sekaligus
  const shareToWhatsApp = async () => {
    if (!imageUrl) {
      // Jika gambar belum dibuat, generate dulu
      if (!isGenerating) {
        setIsDialogLoading(true)
        await generateImage()
      }
      // Tunggu sampai proses generate selesai
      return
    }

    try {
      setIsDialogLoading(true)

      // Konversi imageUrl menjadi blob untuk di-download
      let imageBlob
      if (imageUrl.startsWith("blob:")) {
        const response = await fetch(imageUrl)
        imageBlob = await response.blob()
      } else {
        const response = await fetch(imageUrl)
        imageBlob = await response.blob()
      }

      // Simpan gambar ke device terlebih dahulu
      const blobUrl = URL.createObjectURL(imageBlob)
      const tempLink = document.createElement("a")
      tempLink.href = blobUrl
      tempLink.download = `mathbuddy-assessment-${new Date().getTime()}.png`
      document.body.appendChild(tempLink)
      tempLink.click()
      document.body.removeChild(tempLink)

      // Tambahkan notifikasi langsung dalam dialog
      const notification = document.createElement("div")
      notification.className =
        "fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50"
      notification.innerHTML = `
        <div class="flex items-center">
          <div class="py-1"><svg class="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z"/></svg></div>
          <div>
            <p class="font-bold">${
              lang === "en" ? "Image Downloaded" : "Gambar Diunduh"
            }</p>
            <p class="text-sm">${
              lang === "en"
                ? "Please attach it manually to WhatsApp"
                : "Silakan lampirkan secara manual ke WhatsApp"
            }</p>
          </div>
        </div>
      `
      document.body.appendChild(notification)

      // Hapus notifikasi setelah beberapa detik
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 5000)

      // Tunggu sedikit supaya user melihat notifikasi
      setTimeout(() => {
        // Buka WhatsApp dengan link
        const shareText = `${translations.shareAssessment}: ${window.location.href}`
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
        )
        setIsDialogLoading(false)
      }, 1200)
    } catch (error) {
      console.error("Error sharing to WhatsApp:", error)

      // Fallback ke metode share biasa
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${translations.shareAssessment}: ${window.location.href}`
        )}`
      )
      setIsDialogLoading(false)

      // Tambahkan notifikasi error langsung dalam dialog
      const errorNotification = document.createElement("div")
      errorNotification.className =
        "fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50"
      errorNotification.innerHTML = `
        <div class="flex items-center">
          <div class="py-1"><svg class="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm1.41-1.41A8 8 0 1 0 15.66 4.34 8 8 0 0 0 4.34 15.66zm9.9-8.49L11.41 10l2.83 2.83-1.41 1.41L10 11.41l-2.83 2.83-1.41-1.41L8.59 10 5.76 7.17l1.41-1.41L10 8.59l2.83-2.83 1.41 1.41z"/></svg></div>
          <div>
            <p class="font-bold">${
              lang === "en" ? "Share Error" : "Error Berbagi"
            }</p>
            <p class="text-sm">${
              lang === "en"
                ? "Could not share with image. Only the link has been shared."
                : "Tidak dapat berbagi dengan gambar. Hanya link yang dibagikan."
            }</p>
          </div>
        </div>
      `
      document.body.appendChild(errorNotification)

      // Hapus notifikasi error setelah beberapa detik
      setTimeout(() => {
        document.body.removeChild(errorNotification)
      }, 5000)
    }
  }

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
                    <img
                      src={imageUrl}
                      alt="Assessment Result"
                      className="max-w-full max-h-[300px] rounded-md object-contain"
                      onLoad={() => {
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
                <div className="flex gap-3 justify-between">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleDownload}
                    disabled={isGenerating}
                  >
                    {translations.downloadImage}
                  </Button>
                  <div className="flex-1 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        window.open(
                          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                            window.location.href
                          )}`
                        )
                      }}
                      disabled={isGenerating}
                    >
                      <FaTwitter />
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        window.open(
                          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                            window.location.href
                          )}`
                        )
                      }}
                      disabled={isGenerating}
                    >
                      <FaFacebook />
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={shareToWhatsApp}
                      disabled={isGenerating}
                    >
                      <FaWhatsapp />
                    </Button>
                  </div>
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

              <div className="flex gap-3 justify-between">
                <Button
                  variant={copySuccess ? "default" : "outline"}
                  className={`flex-1 transition-all duration-200 ${
                    copySuccess ? "bg-green-600 hover:bg-green-700" : ""
                  }`}
                  onClick={handleCopyLink}
                >
                  {copySuccess
                    ? lang === "en"
                      ? "Copied!"
                      : "Tersalin!"
                    : translations.copyLink}
                </Button>

                <div className="flex-1 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      window.open(
                        `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                          window.location.href
                        )}`
                      )
                    }}
                  >
                    <FaTwitter />
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          window.location.href
                        )}`
                      )
                    }}
                  >
                    <FaFacebook />
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={shareToWhatsApp}
                  >
                    <FaWhatsapp />
                  </Button>
                </div>
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
          height: "1250px"
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
