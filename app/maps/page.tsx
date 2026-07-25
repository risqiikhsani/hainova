"use client"

import { useState, useCallback, useRef, type KeyboardEvent } from "react"
import { Search, MapPin, LocateFixed, Loader2, LocateOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { usePlacesSearch, usePlaceDetails, useEmbedUrl } from "@/hooks/use-places"
import { useGeolocation } from "@/hooks/use-geolocation"
import { PlaceCard } from "./_components/place-card"
import {
  PlaceDetailPanel,
  PlaceDetailSkeleton,
} from "./_components/place-detail-panel"
import type { PlaceSummary } from "@/types/places"

const NEARBY_RADIUS_METERS = 5000 // 5 km

export default function MapsPage() {
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    results,
    isLoading: searchLoading,
    error: searchError,
    search,
  } = usePlacesSearch()

  const {
    place,
    isLoading: detailLoading,
    error: detailError,
    fetchDetails,
  } = usePlaceDetails()

  const {
    src: embedSrc,
    isLoading: embedLoading,
    error: embedError,
    fetchEmbedUrl,
  } = useEmbedUrl()

  const { status: geoStatus, coords, requestLocation } = useGeolocation()

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setSelectedId(null)
    await search(query)
  }, [query, search])

  const handleSearchNearby = useCallback(async () => {
    if (!query.trim() || !coords) return
    setSelectedId(null)
    await search(query, {
      circle: {
        center: { latitude: coords.lat, longitude: coords.lng },
        radius: NEARBY_RADIUS_METERS,
      },
    })
  }, [query, coords, search])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") void handleSearch()
    },
    [handleSearch]
  )

  const handleSelectPlace = useCallback(
    (p: PlaceSummary) => {
      setSelectedId(p.id)
      void fetchDetails(p.id)
      void fetchEmbedUrl(p.id)
    },
    [fetchDetails, fetchEmbedUrl]
  )

  const hasResults = results.length > 0
  const showEmptyState =
    !searchLoading && query && !hasResults && !searchError

  // ─── Location section UI ───────────────────────────────────────────────────

  function LocationSection() {
    if (geoStatus === "granted" && coords) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <LocateFixed className="size-3 text-green-500" />
            Near you
          </Badge>
          <span className="text-xs text-muted-foreground">
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={requestLocation}
          >
            Refresh
          </Button>
        </div>
      )
    }

    if (geoStatus === "loading") {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Detecting your location…
        </div>
      )
    }

    if (geoStatus === "denied") {
      return (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="flex items-center gap-2 text-xs">
            <LocateOff className="size-4 shrink-0" />
            Location access was blocked. Enable it in your browser settings and
            try again.
          </AlertDescription>
        </Alert>
      )
    }

    if (geoStatus === "unavailable") {
      return (
        <Alert className="py-2">
          <AlertDescription className="text-xs">
            Geolocation is not supported by your browser.
          </AlertDescription>
        </Alert>
      )
    }

    // idle — show the button
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={requestLocation}
        className="w-fit"
      >
        <LocateFixed className="size-4" />
        Use My Location
      </Button>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="mx-auto flex min-h-svh max-w-6xl flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <MapPin className="size-5 text-primary" />
          <h1 className="text-xl font-semibold">Place Search</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Search for any place — restaurants, parks, museums — and view it on
          the map. Powered by Google Places API and Google Maps Embed API.
        </p>
      </div>

      {/* Location row */}
      <LocationSection />

      {/* Search bar */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="e.g. coffee shops in Tokyo, Eiffel Tower, Central Park…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Search for a place"
        />
        <Button
          onClick={() => void handleSearch()}
          disabled={searchLoading || !query.trim()}
          className="shrink-0"
          variant="outline"
        >
          <Search className="size-4" />
          Search
        </Button>
        <Button
          onClick={() => void handleSearchNearby()}
          disabled={searchLoading || !query.trim() || geoStatus !== "granted"}
          className="shrink-0"
          title={
            geoStatus !== "granted"
              ? "Click 'Use My Location' first to enable nearby search"
              : "Search near your current location"
          }
        >
          <LocateFixed className="size-4" />
          Search Nearby
        </Button>
      </div>

      {/* Search error */}
      {searchError && (
        <Alert variant="destructive">
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
      )}

      {/* Empty state */}
      {showEmptyState && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Search className="size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">No places found</p>
          <p className="text-xs text-muted-foreground">
            Try a different search term or location.
          </p>
        </div>
      )}

      {/* Results + detail layout */}
      {(hasResults || selectedId) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
          {/* Results list */}
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((p) => (
              <PlaceCard
                key={p.id}
                place={p}
                isSelected={selectedId === p.id}
                onClick={() => handleSelectPlace(p)}
              />
            ))}
          </div>

          {/* Detail / map panel */}
          <div className="flex flex-col gap-4">
            {detailError && (
              <Alert variant="destructive">
                <AlertDescription>{detailError}</AlertDescription>
              </Alert>
            )}
            {detailLoading && <PlaceDetailSkeleton />}
            {!detailLoading && place && (
              <PlaceDetailPanel
                place={place}
                embedSrc={embedSrc}
                embedLoading={embedLoading}
                embedError={embedError}
              />
            )}
            {!detailLoading && !place && !detailError && (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
                <MapPin className="size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Select a result to see details and the map.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* API info footer */}
      <footer className="mt-auto border-t pt-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          <span>
            <span className="font-medium">POST</span>{" "}
            <code className="rounded bg-muted px-1">/api/places/search</code>{" "}
            — Text Search proxy (supports locationBias)
          </span>
          <span>
            <span className="font-medium">GET</span>{" "}
            <code className="rounded bg-muted px-1">
              /api/places/details/[id]
            </code>{" "}
            — Place Details proxy
          </span>
          <span>
            <span className="font-medium">GET</span>{" "}
            <code className="rounded bg-muted px-1">/api/maps/embed-url</code>{" "}
            — Embed URL builder
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          API key is kept server-side. Nearby search uses browser Geolocation
          API (5 km radius).
        </p>
      </footer>
    </main>
  )
}
