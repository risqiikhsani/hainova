import { NextRequest, NextResponse } from "next/server"
import { checkAndIncrementMapRateLimit } from "@/lib/rate-limit"
import type { EmbedUrlApiResponse, ApiErrorResponse } from "@/types/places"

// Supported embed modes
type EmbedMode = "place" | "search" | "view"

export async function GET(
  req: NextRequest
): Promise<NextResponse<EmbedUrlApiResponse | ApiErrorResponse>> {
  try {
    const rateLimit = await checkAndIncrementMapRateLimit()
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.error ?? "Daily limit exceeded" },
        { status: 429 }
      )
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      )
    }

    const { searchParams } = req.nextUrl
    const mode = (searchParams.get("mode") ?? "place") as EmbedMode

    const base = "https://www.google.com/maps/embed/v1"
    const params = new URLSearchParams({ key: apiKey })

    if (mode === "place") {
      // Prefer place_id when available (more accurate)
      const placeId = searchParams.get("placeId")
      const q = searchParams.get("q")

      if (!placeId && !q) {
        return NextResponse.json(
          { error: "Provide either placeId or q for place mode" },
          { status: 400 }
        )
      }

      params.set("q", placeId ? `place_id:${placeId}` : q!)
      return NextResponse.json({ src: `${base}/place?${params.toString()}` })
    }

    if (mode === "search") {
      const q = searchParams.get("q")
      if (!q) {
        return NextResponse.json(
          { error: "q is required for search mode" },
          { status: 400 }
        )
      }
      params.set("q", q)
      return NextResponse.json({ src: `${base}/search?${params.toString()}` })
    }

    if (mode === "view") {
      const lat = searchParams.get("lat")
      const lng = searchParams.get("lng")
      const zoom = searchParams.get("zoom") ?? "14"

      if (!lat || !lng) {
        return NextResponse.json(
          { error: "lat and lng are required for view mode" },
          { status: 400 }
        )
      }

      params.set("center", `${lat},${lng}`)
      params.set("zoom", zoom)
      return NextResponse.json({ src: `${base}/view?${params.toString()}` })
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
  } catch (err) {
    console.error("[maps/embed-url] Unexpected error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
