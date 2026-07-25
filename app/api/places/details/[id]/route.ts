import { NextRequest, NextResponse } from "next/server"
import type {
  PlaceDetails,
  DetailsApiResponse,
  ApiErrorResponse,
} from "@/types/places"

// Richer field mask for the details view
const FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "rating",
  "userRatingCount",
  "priceLevel",
  "primaryTypeDisplayName",
  "photos",
  "location",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "websiteUri",
  "regularOpeningHours",
  "editorialSummary",
  "googleMapsUri",
  "businessStatus",
].join(",")

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<DetailsApiResponse | ApiErrorResponse>> {
  try {
    // In Next.js 15+, params is a Promise — must be awaited
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Place ID is required" },
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
      `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": FIELD_MASK,
        },
        cache: "no-store",
      }
    )

    if (!googleRes.ok) {
      const errText = await googleRes.text()
      console.error(`[places/details/${id}] Google API error:`, errText)
      return NextResponse.json(
        { error: "Failed to fetch place details" },
        { status: googleRes.status }
      )
    }

    const place = (await googleRes.json()) as PlaceDetails
    return NextResponse.json({ place })
  } catch (err) {
    console.error("[places/details] Unexpected error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
