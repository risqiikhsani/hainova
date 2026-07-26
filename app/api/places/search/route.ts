import { NextRequest, NextResponse } from "next/server"
import { checkAndIncrementMapRateLimit } from "@/lib/rate-limit"
import type {
  PlacesTextSearchRequest,
  PlacesTextSearchResponse,
  SearchApiResponse,
  ApiErrorResponse,
} from "@/types/places"

// Fields we want back — keeps response small and avoids unnecessary billing
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.primaryTypeDisplayName",
  "places.photos",
  "places.location",
].join(",")

export async function POST(
  req: NextRequest
): Promise<NextResponse<SearchApiResponse | ApiErrorResponse>> {
  try {
    const rateLimit = await checkAndIncrementMapRateLimit()
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.error ?? "Daily limit exceeded" },
        { status: 429 }
      )
    }

    const body = (await req.json()) as PlacesTextSearchRequest

    if (!body.textQuery?.trim()) {
      return NextResponse.json(
        { error: "textQuery is required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      )
    }

    const googleRes = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": FIELD_MASK,
        },
        body: JSON.stringify({
          textQuery: body.textQuery,
          maxResultCount: body.maxResultCount ?? 10,
          languageCode: body.languageCode ?? "en",
          ...(body.locationBias && { locationBias: body.locationBias }),
        }),
        // Always fresh — no Next.js data-cache
        cache: "no-store",
      }
    )

    if (!googleRes.ok) {
      const errText = await googleRes.text()
      console.error("[places/search] Google API error:", errText)
      return NextResponse.json(
        { error: "Failed to fetch places" },
        { status: googleRes.status }
      )
    }

    const data = (await googleRes.json()) as PlacesTextSearchResponse
    return NextResponse.json({ places: data.places ?? [] })
  } catch (err) {
    console.error("[places/search] Unexpected error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
