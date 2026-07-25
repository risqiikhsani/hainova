// ─── Google Places API (New) – Text Search response ──────────────────────────

export interface PlacesTextSearchRequest {
  textQuery: string
  maxResultCount?: number // 1–20, default 20
  languageCode?: string // e.g. "en"
  locationBias?: {
    circle: {
      center: { latitude: number; longitude: number }
      radius: number // meters, max 50000
    }
  }
}

export interface PlacePhoto {
  name: string // e.g. "places/ChIJ.../photos/..."
  widthPx: number
  heightPx: number
  authorAttributions: {
    displayName: string
    uri: string
    photoUri: string
  }[]
}

export interface PlaceLocation {
  latitude: number
  longitude: number
}

export interface PlaceSummary {
  id: string // e.g. "ChIJN1t_tDeuEmsRUsoyG83frY4"
  displayName: { text: string; languageCode: string }
  formattedAddress: string
  rating?: number // 1.0–5.0
  userRatingCount?: number
  priceLevel?:
    | "PRICE_LEVEL_FREE"
    | "PRICE_LEVEL_INEXPENSIVE"
    | "PRICE_LEVEL_MODERATE"
    | "PRICE_LEVEL_EXPENSIVE"
    | "PRICE_LEVEL_VERY_EXPENSIVE"
  primaryTypeDisplayName?: { text: string; languageCode: string }
  photos?: PlacePhoto[]
  location?: PlaceLocation
}

export interface PlacesTextSearchResponse {
  places: PlaceSummary[]
}

// ─── Google Places API (New) – Place Details response ────────────────────────

export interface PlaceOpeningHoursPeriod {
  open: { day: number; hour: number; minute: number }
  close: { day: number; hour: number; minute: number }
}

export interface PlaceDetails extends PlaceSummary {
  // Additional fields requested via FieldMask
  nationalPhoneNumber?: string
  internationalPhoneNumber?: string
  websiteUri?: string
  regularOpeningHours?: {
    openNow: boolean
    periods: PlaceOpeningHoursPeriod[]
    weekdayDescriptions: string[]
  }
  editorialSummary?: { text: string; languageCode: string }
  googleMapsUri?: string
  businessStatus?:
    | "OPERATIONAL"
    | "CLOSED_TEMPORARILY"
    | "CLOSED_PERMANENTLY"
}

// ─── Our API route response shapes ───────────────────────────────────────────

export interface SearchApiResponse {
  places: PlaceSummary[]
}

export interface DetailsApiResponse {
  place: PlaceDetails
}

export interface EmbedUrlApiResponse {
  src: string
}

// ─── API error shape ─────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  error: string
}
