"use client"

import { useEffect, useState, useRef } from "react"
import DashboardClient from "../DashboardClient"
import toast from "react-hot-toast"

interface Signal {
  ticker: string
  company: string
  confluence_score: number
  confidence: string
  risk: string
  horizon: string
  why_now: string
  price: number
}

export default function DashboardPage() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [systemStatus, setSystemStatus] = useState<string>("Checking")
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Track previously seen signals to detect genuinely new high-confidence arrivals.
  // Using a ref so the latest value is always accessible inside the async callback
  // without the effect needing to re-subscribe.
  const previousSignalsRef = useRef<Signal[]>([])
  const isFirstFetchRef = useRef(true)

  async function fetchSignals() {
    try {
      const res = await fetch("http://localhost:8000/signals/today")
      if (!res.ok) {
        throw new Error("Failed to fetch signals")
      }
      const data = await res.json()
      console.log("Polling signals at:", new Date().toLocaleTimeString())
      const freshSignals: Signal[] = data.signals || data

      // Skip the very first load so users don't see alerts for pre-existing signals.
      if (!isFirstFetchRef.current) {
        const newHighConfidence = freshSignals.find(
          (signal) =>
            signal.confluence_score >= 8 &&
            !previousSignalsRef.current.some((prev) => prev.ticker === signal.ticker)
        )

        if (newHighConfidence) {
          toast.success(
            `High-confidence signal: ${newHighConfidence.company} (${newHighConfidence.ticker}) - Score ${newHighConfidence.confluence_score}`
          )
        }
      }

      isFirstFetchRef.current = false
      previousSignalsRef.current = freshSignals
      setSignals(freshSignals)
      setError(null)
      setSystemStatus("Online")
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      console.error(err)
      setError("Unable to load signals")
      setSystemStatus("Offline")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignals()
    const interval = setInterval(() => {
      fetchSignals()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <DashboardClient
      signals={signals}
      loading={loading}
      error={error}
      systemStatus={systemStatus}
      lastUpdated={lastUpdated}
      onRefresh={fetchSignals}
    />
  )
}
