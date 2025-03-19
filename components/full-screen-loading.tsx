"use client"

import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface FullScreenLoadingProps {
  seconds?: number
  message?: string
  onComplete?: () => void
}

export function FullScreenLoading({ seconds = 5, message = "Loading data", onComplete }: FullScreenLoadingProps) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onComplete) onComplete()
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
      setProgress(((seconds - timeLeft + 1) / seconds) * 100)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, seconds, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-8 p-6 text-center">
        <LoadingSpinner />
        <h2 className="text-2xl font-bold">{message}</h2>
        <p className="text-muted-foreground">
          Please wait while we load your data... {timeLeft > 0 ? `${timeLeft}s` : ""}
        </p>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="absolute left-0 top-0 h-full bg-primary transition-all duration-1000 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

