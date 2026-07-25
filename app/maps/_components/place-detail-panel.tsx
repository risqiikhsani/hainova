"use client"

import {
  Phone,
  Globe,
  Clock,
  MapPin,
  Star,
  ExternalLink,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { PlaceDetails } from "@/types/places"

// ─── Loading skeleton ─────────────────────────────────────────────────────────

export function PlaceDetailSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="aspect-video w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

interface PlaceDetailPanelProps {
  place: PlaceDetails
  embedSrc: string | null
  embedLoading: boolean
  embedError: string | null
}

export function PlaceDetailPanel({
  place,
  embedSrc,
  embedLoading,
  embedError,
}: PlaceDetailPanelProps) {
  const isOpen = place.regularOpeningHours?.openNow

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{place.displayName.text}</CardTitle>
          {place.rating && (
            <Badge variant="secondary" className="shrink-0 gap-1">
              <Star className="size-3" />
              {place.rating.toFixed(1)}
              {place.userRatingCount && (
                <span className="text-xs opacity-70">
                  ({place.userRatingCount.toLocaleString()})
                </span>
              )}
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-start gap-1">
          <MapPin className="mt-0.5 size-3 shrink-0" />
          {place.formattedAddress}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Status + type badges */}
        <div className="flex flex-wrap gap-2">
          {place.primaryTypeDisplayName && (
            <Badge variant="outline">
              {place.primaryTypeDisplayName.text}
            </Badge>
          )}
          {isOpen !== undefined && (
            <Badge variant={isOpen ? "default" : "outline"}>
              {isOpen ? "Open now" : "Closed"}
            </Badge>
          )}
          {place.businessStatus === "CLOSED_PERMANENTLY" && (
            <Badge variant="destructive">Permanently closed</Badge>
          )}
        </div>

        {/* Editorial summary */}
        {place.editorialSummary && (
          <p className="text-sm text-muted-foreground">
            {place.editorialSummary.text}
          </p>
        )}

        <Separator />

        {/* Contact info */}
        <div className="flex flex-col gap-2 text-sm">
          {place.nationalPhoneNumber && (
            <a
              href={`tel:${place.nationalPhoneNumber}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Phone className="size-4 shrink-0" />
              {place.nationalPhoneNumber}
            </a>
          )}
          {place.websiteUri && (
            <a
              href={place.websiteUri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Globe className="size-4 shrink-0" />
              <span className="truncate">{place.websiteUri}</span>
              <ExternalLink className="ml-auto size-3 shrink-0" />
            </a>
          )}
        </div>

        {/* Opening hours */}
        {place.regularOpeningHours?.weekdayDescriptions && (
          <>
            <Separator />
            <div className="flex flex-col gap-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Clock className="size-4" />
                Hours
              </p>
              {place.regularOpeningHours.weekdayDescriptions.map((desc, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  {desc}
                </p>
              ))}
            </div>
          </>
        )}

        {/* Open in Google Maps button */}
        {place.googleMapsUri && (
          <a
            href={place.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ExternalLink className="size-4" />
            Open in Google Maps
          </a>
        )}

        <Separator />

        {/* Embedded map */}
        {embedError && (
          <Alert variant="destructive">
            <AlertDescription>Could not load map: {embedError}</AlertDescription>
          </Alert>
        )}
        {embedLoading && <Skeleton className="aspect-video w-full rounded-lg" />}
        {embedSrc && !embedLoading && (
          <iframe
            src={embedSrc}
            className="aspect-video w-full rounded-lg border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            title={`Map of ${place.displayName.text}`}
          />
        )}
      </CardContent>
    </Card>
  )
}
