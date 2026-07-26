"use client"

import { useState, useCallback } from "react"
import type {
  PlaceSummary,
  PlaceDetails,
  SearchApiResponse,
  DetailsApiResponse,
  EmbedUrlApiResponse,
  PlacesTextSearchRequest,
} from "@/types/places"

// ─── Search ──────────────────────────────────────────────────────────────────

export function usePlacesSearch() {
  const [results, setResults] = useState<PlaceSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string, locationBias?: PlacesTextSearchRequest["locationBias"]) => {
    if (!query.trim()) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textQuery: query,
          ...(locationBias && { locationBias }),
        }),
      })

      if (!res.ok) {
        const err = (await res.json()) as { error: string }
        throw new Error(err.error ?? "Search failed")
      }

      const data = (await res.json()) as SearchApiResponse
      setResults(data.places)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { results, isLoading, error, search }
}

// ─── Details ─────────────────────────────────────────────────────────────────

export function usePlaceDetails() {
  const [place, setPlace] = useState<PlaceDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetails = useCallback(async (placeId: string) => {
    setIsLoading(true)
    setError(null)
    setPlace(null)

    try {
      const res = await fetch(`/api/places/details/${placeId}`)

      if (!res.ok) {
        const err = (await res.json()) as { error: string }
        throw new Error(err.error ?? "Failed to load details")
      }

      const data = (await res.json()) as DetailsApiResponse
      setPlace(data.place)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { place, isLoading, error, fetchDetails }
}

// ─── Embed URL ────────────────────────────────────────────────────────────────

export function useEmbedUrl() {
  const [src, setSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEmbedUrl = useCallback(async (placeId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ mode: "place", placeId })
      const res = await fetch(`/api/maps/embed-url?${params.toString()}`)

      if (!res.ok) {
        const err = (await res.json()) as { error: string }
        throw new Error(err.error ?? "Failed to generate embed URL")
      }

      const data = (await res.json()) as EmbedUrlApiResponse
      setSrc(data.src)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setSrc(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { src, isLoading, error, fetchEmbedUrl }
}
