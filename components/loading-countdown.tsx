"use client"

import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface LoadingCountdownProps {
  seconds?: number
  message?: string
  isLoading: boolean
}

export function LoadingCountdown({ seconds = 3, message = "Loading data", isLoading }: LoadingCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    // Reset timer when loading state changes
    if (isLoading) {
      setTimeLeft(seconds)
      setShowLoading(true)
    }
  }, [isLoading, seconds])

  useEffect(() => {
    if (!isLoading) {
      setShowLoading(false)
      return
    }

    if (timeLeft <= 0) {
      // Keep showing loading spinner but without countdown
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, isLoading])

  // Don't show loading if it's not loading or if we've decided to hide it
  if (!isLoading || !showLoading) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <LoadingSpinner />
      <p className="text-muted-foreground">
        {message}... {timeLeft > 0 ? `${timeLeft}s` : ""}
      </p>
    </div>
  )
}

