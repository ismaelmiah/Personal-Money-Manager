"use client"

import { FullScreenLoading } from "@/components/full-screen-loading";
import { useAppData } from "@/providers/data-provider";
import { useState, useEffect } from "react";
import PlatformSelectionPage from "./platform-selection/page";

export default function Home() {
  
  const [initialLoading, setInitialLoading] = useState(true)
  const { refreshData, isLoading } = useAppData()

  useEffect(() => {
    const loadData = async () => {
      await refreshData()
      setInitialLoading(false)
    }

    loadData()
  }, [refreshData])

  if (initialLoading || isLoading) {
    return <FullScreenLoading message="Loading App Data" seconds={5} />
  }
  
  return (
    <PlatformSelectionPage />
  );
}
